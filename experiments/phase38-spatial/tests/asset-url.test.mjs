import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import {
  assetUrl,
  protocol,
  canonical,
  hash,
  safeFailureReason,
} from "../src/protocol.ts";
import { worldFence } from "../src/world-metadata.ts";
import {
  worldOutput,
  validatedAssetURL,
  inspectAsset,
} from "../src/outputs.ts";
import {
  assetDownloadTransport,
  isPublicAddress,
} from "../src/asset-download.ts";
import { httpTransport } from "../src/transport.ts";
import { clock, world } from "./fixtures.mjs";

globalThis.fetch = async () => {
  throw Error("OFFLINE_TEST_NETWORK_FORBIDDEN");
};
const job = protocol.jobs[0],
  host = "cdn.marble.worldlabs.ai";
const base = `https://${host}/00000000-0000-4000-8000-000000000000`;
function source() {
  const w = world(job);
  w.assets.splats.spz_urls["100k"] = `${base}/synthetic.spz`;
  w.assets.mesh.collider_mesh_url = `${base}/synthetic.glb`;
  w.assets.imagery.pano_url = `${base}/synthetic/synthetic.png`;
  w.assets.thumbnail_url = `${base}/synthetic/synthetic.webp`;
  const fence = worldFence(
    {
      operation_id: "synthetic-operation",
      done: true,
      response: { world_id: w.world_id },
    },
    job,
    "synthetic-operation",
    {
      jobId: job.id,
      started: clock().now(),
      model: job.model,
      endpoint: job.endpoint,
      inputHash: hash(canonical(job.input)),
    },
  );
  return { w, fence };
}
function requestFor(asset = undefined) {
  if (!asset) {
    const { w, fence } = source();
    asset = worldOutput(w, job, fence).assets[0];
  }
  return {
    asset,
    url: asset.url,
    method: "GET",
    headers: {},
    limit: 50,
    timeoutMs: 1000,
  };
}
function mockConnection({
  status = 200,
  headers = {},
  bytes = Buffer.from("synthetic asset"),
  fail = false,
} = {}) {
  const calls = [];
  const connect = (url, options, callback) => {
    calls.push({ url: url.href, options });
    const req = new EventEmitter();
    req.destroy = () => {};
    req.end = () =>
      queueMicrotask(() => {
        if (fail) {
          req.emit("error", Error("SYNTHETIC_SECRET_NETWORK_ERROR"));
          return;
        }
        const response = Readable.from([bytes]);
        response.statusCode = status;
        response.headers = headers;
        callback(response);
      });
    return req;
  };
  return { calls, connect };
}
const publicDNS = async () => [{ address: "8.8.8.8", family: 4 }];

test("observed four sanitized URL structures pass corrected policy; original rejection remains historical", () => {
  const evidence = JSON.parse(
    readFileSync(new URL("../results/url-diagnosis-001.json", import.meta.url)),
  );
  const { w, fence } = source();
  const assets = worldOutput(w, job, fence).assets;
  for (const a of assets) {
    const e = evidence.assets.find((x) => x.role === a.role);
    assert.equal(e.hostname, host);
    assert.equal(e.frozenAssertion, "asset_host_not_allowed");
    assert.equal(e.scheme, "https");
    assert.equal(
      e.explicitPort || e.credentials || e.queryParameters || e.fragment,
      false,
    );
    assert.equal(
      new URL(a.url).pathname.split("/").filter(Boolean).length,
      e.pathSegmentCount,
    );
    assert.equal(assetUrl(a.url, "worldlabs"), a.url);
    assert.equal(validatedAssetURL(a), a.url);
  }
  assert.equal(evidence.requests, 1);
  assert.equal(evidence.assetDownloads, 0);
});

for (const bad of [
  `http://${host}/a`,
  `https://${host}:443/a`,
  `https://${host}:8443/a`,
  `https://user:pass@${host}/a`,
  `https://@${host}/a`,
  `https://${host}/a#fragment`,
  `https://${host}/a#`,
  `https://${host}/a/../b`,
  `https://${host}/a/.`,
  `https://${host}/%2e%2e/a`,
  `https://${host}/%252e%252e/a`,
  `https://${host}/a%2fb`,
  `https://${host}/a%5cb`,
  `https://${host}/%00/a`,
  `https://${host}/%0d%0a/a`,
  `https://${host}/%c0%ae/a`,
  `https://${host}/%ff/a`,
  `https://${host}/%zz/a`,
  `https://${host}//a`,
  `https://${host}/a\\b`,
  `https://${host}/a
`,
  ` https://${host}/a`,
  `https://${host}/`,
  `https://${host}.evil.test/a`,
  `https://evil-${host}/a`,
  `https://sub.${host}/a`,
  `https://${host}./a`,
  `https://cdn%2emarble.worldlabs.ai/a`,
  "https://localhost/a",
  "https://metadata.google.internal/a",
  "https://127.0.0.1/a",
  "https://2130706433/a",
  "https://0x7f000001/a",
  "https://127.1/a",
  "https://[::1]/a",
  "https://[::ffff:127.0.0.1]/a",
  "https://169.254.169.254/a",
  "file:///etc/passwd",
]) {
  test(`reject hostile URL ${JSON.stringify(bad)}`, () =>
    assert.throws(() => assetUrl(bad, "worldlabs")));
}

test("benign signed query is preserved exactly, never stripped or transferred to another asset", () => {
  const { w, fence } = source();
  const url = `${base}/synthetic.spz?token=SYNTHETIC_ONLY&expires=123`;
  w.assets.splats.spz_urls["100k"] = url;
  const asset = worldOutput(w, job, fence).assets[0];
  assert.equal(validatedAssetURL(asset), url);
  assert.throws(
    () => validatedAssetURL({ ...asset, url: url + "4" }),
    /asset_provenance_required/,
  );
});

test("allowlisted URL string alone cannot authorize download", async () => {
  let dnsCalls = 0;
  const mock = mockConnection();
  const transport = assetDownloadTransport(async () => {
    dnsCalls++;
    return publicDNS();
  }, mock.connect);
  const genuine = requestFor();
  for (const asset of [
    undefined,
    { ...genuine.asset },
    JSON.parse(JSON.stringify(genuine.asset)),
  ]) {
    await assert.rejects(transport({ ...genuine, asset }));
  }
  assert.equal(dnsCalls, 0);
  assert.equal(mock.calls.length, 0);
});

test("exact retained URL, method, credentials and body fencing precedes DNS", async () => {
  const request = requestFor(),
    mock = mockConnection();
  let dns = 0;
  const download = assetDownloadTransport(async () => {
    dns++;
    return publicDNS();
  }, mock.connect);
  for (const patch of [
    { url: `${base}/other.spz` },
    { headers: { Authorization: "SYNTHETIC_SECRET" } },
    { method: "POST" },
    { body: "synthetic" },
  ])
    await assert.rejects(download({ ...request, ...patch }));
  assert.equal(dns, 0);
  assert.equal(mock.calls.length, 0);
  assert.throws(() => {
    request.asset.url = `${base}/other.spz`;
  });
});

test("wrong-world/public metadata never issues asset authority", () => {
  const { w, fence } = source();
  w.world_id = "other-world";
  assert.throws(() => worldOutput(w, job, fence), /stale_world_id/);
  w.world_id = fence.worldId;
  w.permission.public = true;
  assert.throws(() => worldOutput(w, job, fence), /world_privacy_unverified/);
});

for (const address of [
  "0.0.0.0",
  "10.2.3.4",
  "100.64.0.1",
  "127.0.0.1",
  "169.254.169.254",
  "172.16.0.1",
  "172.31.255.255",
  "192.168.1.1",
  "192.0.0.8",
  "192.0.2.1",
  "198.18.0.1",
  "198.51.100.1",
  "203.0.113.1",
  "224.0.0.1",
  "255.255.255.255",
  "::",
  "::1",
  "::ffff:8.8.8.8",
  "::ffff:127.0.0.1",
  "fc00::1",
  "fd00::1",
  "fe80::1",
  "ff02::1",
  "64:ff9b::a00:1",
  "2002:7f00:1::",
  "2001:db8::1",
  "2001::1",
  "3fff::1",
  "invalid",
]) {
  test(`DNS blocks nonpublic/transitional destination ${address}`, async () => {
    assert.equal(isPublicAddress(address), false);
    const mock = mockConnection();
    await assert.rejects(
      assetDownloadTransport(
        async () => [{ address, family: address.includes(":") ? 6 : 4 }],
        mock.connect,
      )(requestFor()),
      /asset_destination_not_public/,
    );
    assert.equal(mock.calls.length, 0);
  });
}

test("mixed public/private DNS answers fail closed before any socket", async () => {
  const mock = mockConnection();
  await assert.rejects(
    assetDownloadTransport(
      async () => [
        { address: "8.8.8.8", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ],
      mock.connect,
    )(requestFor()),
    /asset_destination_not_public/,
  );
  assert.equal(mock.calls.length, 0);
});

test("approved public destination is pinned without second lookup/address fallback; TLS identity preserved", async () => {
  let lookups = 0;
  const mock = mockConnection();
  const download = assetDownloadTransport(async () => {
    lookups++;
    return [{ address: lookups === 1 ? "8.8.8.8" : "127.0.0.1", family: 4 }];
  }, mock.connect);
  const req = requestFor(),
    result = await download(req);
  assert.equal(lookups, 1);
  assert.equal(mock.calls.length, 1);
  assert.equal(result.url, req.url);
  const options = mock.calls[0].options;
  assert.equal(options.autoSelectFamily, false);
  assert.equal(options.agent, false);
  assert.equal(options.servername, host);
  assert.equal(options.rejectUnauthorized, true);
  assert.deepEqual(options.headers, {});
  for (let i = 0; i < 2; i++)
    options.lookup(host, {}, (err, address, family) => {
      assert.equal(err, null);
      assert.equal(address, "8.8.8.8");
      assert.equal(family, 4);
    });
  assert.equal(lookups, 1);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
  assert.equal(isPublicAddress("2001:4860:4860::8888"), true);
});

for (const [label, options, reason] of [
  [
    "redirect",
    { status: 302, headers: { location: "http://127.0.0.1/" } },
    "http_or_redirect_failure",
  ],
  ["error", { status: 503 }, "http_or_redirect_failure"],
  [
    "oversized header",
    { headers: { "content-length": "9999" } },
    "response_too_large",
  ],
  ["oversized stream", { bytes: Buffer.alloc(100) }, "response_too_large"],
  ["network failure", { fail: true }, "asset_network_failure"],
]) {
  test(`${label} stops without redirect, retry or leaking provider errors`, async () => {
    const mock = mockConnection(options);
    let dns = 0;
    await assert.rejects(
      assetDownloadTransport(async () => {
        dns++;
        return publicDNS();
      }, mock.connect)(requestFor()),
      (error) => {
        assert.equal(safeFailureReason(error), reason);
        assert.ok(!error.message.includes("SYNTHETIC_SECRET"));
        return true;
      },
    );
    assert.equal(mock.calls.length, 1);
    assert.equal(dns, 1);
  });
}

test("DNS failure and timeout are bounded, safe and never retried", async () => {
  for (const timeout of [false, true]) {
    let calls = 0;
    const mock = mockConnection();
    const download = assetDownloadTransport(async () => {
      calls++;
      if (timeout) return new Promise(() => {});
      throw Error("SYNTHETIC_SECRET_DNS");
    }, mock.connect);
    await assert.rejects(
      download({ ...requestFor(), timeoutMs: 5 }),
      (error) => {
        assert.equal(
          safeFailureReason(error),
          timeout ? "asset_timeout" : "asset_dns_failure",
        );
        return true;
      },
    );
    assert.equal(calls, 1);
    assert.equal(mock.calls.length, 0);
  }
});

test("ordinary fetch path cannot bypass asset transport; approved descriptors use secured path only", async () => {
  let fetches = 0;
  const mock = mockConnection();
  const transport = httpTransport(
    async () => {
      fetches++;
      throw Error("no API call expected");
    },
    assetDownloadTransport(publicDNS, mock.connect),
  );
  const request = requestFor();
  await assert.rejects(
    transport({ ...request, asset: undefined }),
    /asset_provenance_required/,
  );
  await transport(request);
  assert.equal(fetches, 0);
  assert.equal(mock.calls.length, 1);
});

test("URL suffix is not proof of binary image compatibility; WebP remains outside this URL-only change", () => {
  const { w, fence } = source();
  const thumb = worldOutput(w, job, fence).assets.find(
    (a) => a.role === "thumbnail",
  );
  assert.equal(thumb.url.endsWith(".webp"), true);
  assert.throws(
    () => inspectAsset(Buffer.from("RIFFsyntheticWEBP"), thumb, job),
    /unsupported_or_invalid_image/,
  );
});
