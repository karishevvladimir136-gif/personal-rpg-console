import assert from "node:assert/strict";
import test from "node:test";
import {
  installDraftNavigationGuard,
  registerDirtyDraft,
} from "../src/lib/persistence/navigation-guard.ts";

function browserHistory() {
  const window = new EventTarget();
  window.document = new EventTarget();
  const entries = [
    {
      state: { __NA: true, tree: "original router tree" },
      url: "http://localhost/campaigns",
    },
  ];
  let position = 0;
  let prompts = 0;
  window.location = { href: entries[0].url };
  window.confirm = () => {
    prompts++;
    return false;
  };
  window.history = {
    get state() {
      return entries[position].state;
    },
    pushState(state, unused, url) {
      entries.splice(++position);
      entries.push({ state, url: url ?? window.location.href });
      window.location.href = entries[position].url;
    },
    replaceState(state, unused, url) {
      entries[position] = { state, url: url ?? window.location.href };
      window.location.href = entries[position].url;
    },
    go(delta) {
      position += delta;
      assert.ok(position >= 0 && position < entries.length);
      window.location.href = entries[position].url;
      const event = new Event("popstate");
      event.state = entries[position].state;
      window.dispatchEvent(event);
    },
  };
  return { window, entries, prompts: () => prompts };
}
test("cancelled Back preserves editor, router state, forward history and asks once for two drafts", () => {
  const fake = browserHistory();
  const cleanup = installDraftNavigationGuard(fake.window);
  const unregisterA = registerDirtyDraft(Symbol(), () => "Discard?");
  const unregisterB = registerDirtyDraft(Symbol(), () => "Discard second?");
  try {
    fake.window.history.pushState(
      { __NA: true, tree: "document tree" },
      "",
      "http://localhost/document",
    );
    fake.window.history.go(-1);
    assert.equal(fake.window.location.href, "http://localhost/document");
    assert.equal(fake.window.history.state.tree, "document tree");
    assert.equal(fake.prompts(), 1);
    assert.equal(fake.entries.length, 2);
    unregisterA();
    unregisterB();
    fake.window.history.go(-1);
    assert.equal(fake.window.location.href, "http://localhost/campaigns");
    fake.window.history.go(1);
    assert.equal(fake.window.location.href, "http://localhost/document");
  } finally {
    unregisterA();
    unregisterB();
    cleanup();
  }
});
test("accepted history navigation continues and existing Next state fields survive replace", () => {
  const fake = browserHistory();
  const cleanup = installDraftNavigationGuard(fake.window);
  const unregister = registerDirtyDraft(Symbol(), () => "Discard?");
  fake.window.confirm = () => true;
  try {
    fake.window.history.pushState(
      { __NA: true, tree: "editor" },
      "",
      "http://localhost/editor",
    );
    fake.window.history.replaceState(
      { __NA: true, tree: "updated editor" },
      "",
    );
    assert.equal(fake.window.history.state.tree, "updated editor");
    fake.window.history.go(-1);
    assert.equal(fake.window.location.href, "http://localhost/campaigns");
    assert.equal(fake.window.history.state.tree, "original router tree");
  } finally {
    unregister();
    cleanup();
  }
});
