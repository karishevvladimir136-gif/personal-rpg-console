import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createCampaignSettings,
  effectiveDmStyle,
} from "../src/lib/campaign-settings.ts";
import russian from "../src/lib/locales/ru.json" with { type: "json" };
import { craftKeyFromTitle } from "../src/components/dm-craft-key.ts";

const require = createRequire(import.meta.url);
const controlsPath = fileURLToPath(
  new URL("../src/components/dm-style-controls.tsx", import.meta.url),
);

function renderStyle(language, settings) {
  const source = readFileSync(controlsPath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (name) => {
    if (name.endsWith("language-context"))
      return {
        useLanguage: () => ({
          t: (key) => (language === "ru" ? (russian[key] ?? key) : key),
        }),
      };
    if (name === "@/lib/campaign-settings") return { effectiveDmStyle };
    return require(name);
  };
  vm.runInThisContext(`(function(require, module, exports) { ${output}\n })`, {
    filename: controlsPath,
  })(localRequire, loaded, loaded.exports);
  return renderToStaticMarkup(
    createElement(loaded.exports.CampaignDmStyle, {
      settings,
      onChange: () => assert.fail("render must not mutate settings"),
    }),
  );
}

test("DM Style renders seven bounded controls in English and Russian with legacy defaults", () => {
  const legacy = createCampaignSettings("campaign");
  delete legacy.dmStyle;
  for (const language of ["en", "ru"]) {
    const html = renderStyle(language, legacy);
    assert.equal((html.match(/<select/g) ?? []).length, 7);
    assert.equal((html.match(/<option/g) ?? []).length, 21);
    assert.match(
      html,
      language === "ru" ? /Инициатива спутников/ : /Companion initiative/,
    );
    assert.match(
      html,
      language === "ru" ? /Драматический темп/ : /Dramatic pace/,
    );
    assert.match(html, /value="normal" selected=""/);
    assert.doesNotMatch(html, /selection trace|source\.craft|rpg_private/i);
  }
});

test("owner card titles produce bounded unique internal keys", () => {
  const first = craftKeyFromTitle("Companions choose their own words", []);
  assert.equal(first, "owner-companions-choose-their-own-words");
  assert.equal(
    craftKeyFromTitle("Companions choose their own words", [first]),
    `${first}-2`,
  );
  assert.match(craftKeyFromTitle("История", []), /^[a-z][a-z0-9-]{1,79}$/);
  assert.match(
    craftKeyFromTitle("A".repeat(200), []),
    /^[a-z][a-z0-9-]{1,79}$/,
  );
});
