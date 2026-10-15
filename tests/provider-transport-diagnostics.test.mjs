import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";

const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { openAiProvider } = await import("../src/lib/server/dm/provider.ts");
hook.deregister();

const KEY = "sk-SYNTHETIC_PRIVATE_CREDENTIAL_123456789";
function setup(fetcher) {
  const { source, input, plan } = runtimeFixture();
  const diagnostics = [],
    attempts = [];
  const provider = openAiProvider({
    apiKey: KEY,
    model: "gpt-6-astra",
    reasoning: "xhigh",
    fetcher,
    observer: (row) => attempts.push(row),
    diagnosticObserver: (row) => diagnostics.push(row),
  });
  return {
    plan,
    diagnostics,
    attempts,
    run: () => provider.plan(source, input),
  };
}
function completed(plan) {
  return new Response(
    JSON.stringify({
      id: "resp_synthetic123",
      model: "gpt-6-astra",
      status: "completed",
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(plan) }],
        },
      ],
      usage: { input_tokens: 120, output_tokens: 30 },
    }),
    { headers: { "x-request-id": "req_success" } },
  );
}
function assertSafe(error, diagnostics, attempts, category) {
  assert.equal(error.name, "DmError");
  assert.equal(error.message, category);
  assert.equal(error.code, category);
  assert.equal(Object.hasOwn(error, "diagnostic"), false);
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0].category, category);
  assert.equal(Object.hasOwn(attempts[0], "nativeMessage"), false);
  assert.equal(Object.hasOwn(attempts[0], "providerErrorMessage"), false);
  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].category, category);
  assert.ok(!JSON.stringify(error).includes(KEY));
  assert.ok(!JSON.stringify(attempts).includes(KEY));
  assert.ok(!JSON.stringify(diagnostics).includes(KEY));
}

test("native fetch rejection retains bounded cause without changing safe gameplay error", async () => {
  let calls = 0;
  const f = setup(async () => {
    calls++;
    const cause = Object.assign(new Error(`connect failed with ${KEY}`), {
      code: "ECONNRESET",
    });
    throw new TypeError(`fetch failed: Authorization: Bearer ${KEY}`, {
      cause,
    });
  });
  await assert.rejects(f.run(), (error) => {
    assertSafe(error, f.diagnostics, f.attempts, "provider");
    return true;
  });
  assert.equal(calls, 1);
  const d = f.diagnostics[0];
  assert.equal(d.phase, "request");
  assert.equal(d.nativeName, "TypeError");
  assert.equal(d.causeName, "Error");
  assert.equal(d.causeCode, "ECONNRESET");
  assert.match(d.nativeMessage, /fetch failed/);
  assert.match(d.nativeMessage, /\[REDACTED\]/);
  assert.match(d.causeMessage, /\[REDACTED\]/);
  assert.equal(d.responseReceived, false);
  assert.equal(d.bodyReceived, false);
  assert.equal(d.httpStatus, null);
  assert.equal(d.abortKind, null);
  assert.ok(d.elapsedMs >= 0);
});

test("HTTP 400 preserves structured provider details only in opt-in diagnostics", async () => {
  const f = setup(
    async () =>
      new Response(
        JSON.stringify({
          error: {
            type: "invalid_request_error",
            code: "unsupported_parameter",
            message: "Invalid max_output_tokens",
          },
        }),
        {
          status: 400,
          statusText: "Bad Request",
          headers: {
            "x-request-id": "req_400",
            "openai-request-id": "req_openai_400",
          },
        },
      ),
  );
  await assert.rejects(f.run(), (error) => {
    assertSafe(error, f.diagnostics, f.attempts, "provider");
    return true;
  });
  const d = f.diagnostics[0];
  assert.equal(d.httpStatus, 400);
  assert.equal(d.httpStatusText, "Bad Request");
  assert.equal(d.providerErrorType, "invalid_request_error");
  assert.equal(d.providerErrorCode, "unsupported_parameter");
  assert.equal(d.providerErrorMessage, "Invalid max_output_tokens");
  assert.equal(d.requestId, "req_400");
  assert.equal(d.openaiRequestId, "req_openai_400");
  assert.equal(d.responseReceived, true);
  assert.equal(d.bodyReceived, true);
  assert.equal(d.jsonParseFailed, false);
  assert.equal(f.attempts[0].providerCode, "unsupported_parameter");
});

test("HTTP 401 and 403 retain configuration category and private diagnostic metadata", async () => {
  for (const status of [401, 403]) {
    const f = setup(
      async () =>
        new Response(
          JSON.stringify({
            error: {
              type: "invalid_request_error",
              code: "invalid_api_key",
              message: `Credential ${KEY} denied`,
            },
          }),
          { status },
        ),
    );
    await assert.rejects(f.run(), (error) => {
      assertSafe(error, f.diagnostics, f.attempts, "configuration");
      assert.equal(error.retryable, true);
      return true;
    });
    assert.equal(f.diagnostics[0].httpStatus, status);
    assert.equal(f.diagnostics[0].providerErrorCode, "invalid_api_key");
    assert.equal(
      f.diagnostics[0].providerErrorMessage,
      "Credential [REDACTED] denied",
    );
  }
});

test("HTTP 429 preserves Retry-After and rate-limit metadata without retry", async () => {
  let calls = 0;
  const f = setup(async () => {
    calls++;
    return new Response(
      JSON.stringify({
        error: {
          type: "rate_limit_error",
          code: "rate_limit_exceeded",
          message: "Synthetic rate limit",
        },
      }),
      {
        status: 429,
        headers: { "retry-after": "12", "x-request-id": "req_429" },
      },
    );
  });
  await assert.rejects(f.run(), (error) => {
    assertSafe(error, f.diagnostics, f.attempts, "provider");
    return true;
  });
  assert.equal(calls, 1);
  assert.equal(f.diagnostics[0].retryAfter, "12");
  assert.equal(f.diagnostics[0].requestId, "req_429");
  assert.equal(f.diagnostics[0].providerErrorType, "rate_limit_error");
  assert.equal(f.attempts[0].providerType, "rate_limit_error");
});

test("HTTP 5xx keeps provider category and records overload details", async () => {
  const f = setup(
    async () =>
      new Response(
        JSON.stringify({
          error: {
            type: "server_error",
            code: "server_is_overloaded",
            message: "Try later",
          },
        }),
        { status: 503, statusText: "Service Unavailable" },
      ),
  );
  await assert.rejects(f.run(), (error) => {
    assertSafe(error, f.diagnostics, f.attempts, "provider");
    return true;
  });
  assert.equal(f.diagnostics[0].httpStatus, 503);
  assert.equal(f.diagnostics[0].httpStatusText, "Service Unavailable");
  assert.equal(f.diagnostics[0].providerErrorCode, "server_is_overloaded");
  assert.equal(f.attempts[0].providerCode, "server_is_overloaded");
});

test("AbortError and TimeoutError are distinct and still fail closed", async () => {
  for (const [name, kind] of [
    ["AbortError", "abort"],
    ["TimeoutError", "timeout"],
  ]) {
    const f = setup(async () => {
      throw new DOMException(`Synthetic ${name}`, name);
    });
    await assert.rejects(f.run(), (error) => {
      assertSafe(error, f.diagnostics, f.attempts, "provider");
      return true;
    });
    assert.equal(f.diagnostics[0].nativeName, name);
    assert.equal(f.diagnostics[0].abortKind, kind);
    assert.equal(f.diagnostics[0].responseReceived, false);
  }
});

test("malformed provider JSON marks parse failure and retains response header only", async () => {
  const f = setup(
    async () =>
      new Response("{ malformed", {
        headers: { "x-request-id": "req_bad_json" },
      }),
  );
  await assert.rejects(f.run(), (error) => {
    assertSafe(error, f.diagnostics, f.attempts, "provider");
    return true;
  });
  const d = f.diagnostics[0];
  assert.equal(d.phase, "provider-json");
  assert.equal(d.nativeName, "SyntaxError");
  assert.equal(d.responseReceived, true);
  assert.equal(d.bodyReceived, true);
  assert.equal(d.jsonParseFailed, true);
  assert.equal(d.requestId, "req_bad_json");
});

test("malformed HTTP error JSON retains HTTP category and marks parse failure", async () => {
  const f = setup(async () => new Response("{ malformed", { status: 400 }));
  await assert.rejects(f.run(), (error) => {
    assertSafe(error, f.diagnostics, f.attempts, "provider");
    return true;
  });
  assert.equal(f.diagnostics[0].phase, "error-body");
  assert.equal(f.diagnostics[0].httpStatus, 400);
  assert.equal(f.diagnostics[0].bodyReceived, true);
  assert.equal(f.diagnostics[0].jsonParseFailed, true);
});

test("incomplete Responses object keeps its response ID without accepting output", async () => {
  const f = setup(
    async () =>
      new Response(
        JSON.stringify({
          id: "resp_incomplete123",
          model: "gpt-6-astra",
          status: "incomplete",
          output: [],
          usage: { input_tokens: 120, output_tokens: 4096 },
        }),
      ),
  );
  await assert.rejects(f.run(), (error) => {
    assertSafe(error, f.diagnostics, f.attempts, "provider");
    return true;
  });
  assert.equal(f.diagnostics[0].responseId, "resp_incomplete123");
  assert.equal(f.diagnostics[0].responseReceived, true);
  assert.equal(f.diagnostics[0].bodyReceived, true);
  assert.equal(f.diagnostics[0].success, false);
});

test("response-body rejection distinguishes received headers from missing body", async () => {
  const f = setup(async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers({ "x-request-id": "req_body_abort" }),
    text: async () => {
      throw new DOMException("Synthetic body abort", "AbortError");
    },
  }));
  await assert.rejects(f.run(), (error) => {
    assertSafe(error, f.diagnostics, f.attempts, "provider");
    return true;
  });
  const d = f.diagnostics[0];
  assert.equal(d.phase, "response-body");
  assert.equal(d.responseReceived, true);
  assert.equal(d.bodyReceived, false);
  assert.equal(d.abortKind, "abort");
  assert.equal(d.requestId, "req_body_abort");
});

test("credential-like provider codes, request IDs and messages cannot enter diagnostics", async () => {
  const f = setup(
    async () =>
      new Response(
        JSON.stringify({
          error: {
            type: KEY,
            code: KEY,
            message: `Authorization: Bearer ${KEY}`,
          },
        }),
        { status: 400, headers: { "x-request-id": KEY, "retry-after": KEY } },
      ),
  );
  await assert.rejects(f.run(), (error) => {
    assertSafe(error, f.diagnostics, f.attempts, "provider");
    return true;
  });
  const d = f.diagnostics[0];
  assert.equal(d.providerErrorType, null);
  assert.equal(d.providerErrorCode, null);
  assert.equal(d.requestId, null);
  assert.ok(!JSON.stringify(d).includes(KEY));
  assert.equal(f.attempts[0].providerCode, null);
});

test("completed valid response preserves response ID and leaves normal observer unchanged", async () => {
  const { plan } = runtimeFixture();
  const f = setup(async () => completed(plan));
  const result=await f.run();
  assert.deepEqual(Object.keys(result.usage).sort(),
    ["calls","inputTokens","latencyMs","model","outputTokens"]);
  assert.equal(f.attempts.length, 1);
  assert.equal(f.attempts[0].success, true);
  assert.equal(f.diagnostics.length, 1);
  const d = f.diagnostics[0];
  assert.equal(d.success, true);
  assert.equal(d.phase, "completed");
  assert.equal(d.category, null);
  assert.equal(d.responseId, "resp_synthetic123");
  assert.equal(d.requestId, "req_success");
  assert.equal(d.responseReceived, true);
  assert.equal(d.bodyReceived, true);
  assert.equal(d.jsonParseFailed, false);
  assert.equal(Object.hasOwn(f.attempts[0], "responseId"), false);
});

test("diagnostic callback failure never changes successful gameplay settlement", async () => {
  const { source, input, plan } = runtimeFixture();
  const provider = openAiProvider({
    apiKey: KEY,
    model: "gpt-6-astra",
    fetcher: async () => completed(plan),
    diagnosticObserver: () => {
      throw new Error("SYNTHETIC_DIAGNOSTIC_FAILURE");
    },
  });
  const result = await provider.plan(source, input);
  assert.deepEqual(result.output, plan);
});
