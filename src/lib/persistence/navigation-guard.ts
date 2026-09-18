// One guard for all dirty forms, including a document and feedback draft together.
// History indices let a cancelled Back/Forward return to the original entry
// without dropping its forward history or exposing a different campaign's form.
const drafts = new Map<symbol, () => string>();
export function registerDirtyDraft(token: symbol, message: () => string) {
  drafts.set(token, message);
  return () => {
    drafts.delete(token);
  };
}
export function installDraftNavigationGuard(target: Window) {
  const key = "__rpgHistoryIndex";
  const history = target.history;
  const push = history.pushState;
  const replace = history.replaceState;
  let index = Number.isInteger(history.state?.[key])
    ? (history.state[key] as number)
    : 0;
  let currentUrl = target.location.href;
  let currentState = { ...history.state, [key]: index };
  let restoring = false;
  replace.call(history, currentState, "", currentUrl);
  const allowed = () =>
    !drafts.size || target.confirm(drafts.values().next().value!());
  history.pushState = function (data, unused, url) {
    index++;
    push.call(history, { ...data, [key]: index }, unused, url);
    currentState = history.state;
    currentUrl = target.location.href;
  };
  history.replaceState = function (data, unused, url) {
    replace.call(history, { ...data, [key]: index }, unused, url);
    currentState = history.state;
    currentUrl = target.location.href;
  };
  const pop = (event: PopStateEvent) => {
    if (restoring) {
      restoring = false;
      event.stopImmediatePropagation();
      return;
    }
    const next = event.state?.[key];
    if (!allowed()) {
      event.stopImmediatePropagation();
      if (Number.isInteger(next) && next !== index) {
        restoring = true;
        history.go(index - next);
      } else {
        // An entry created before this app mounted has no index. Retain the
        // current editor rather than silently discarding its unsaved text.
        push.call(history, currentState, "", currentUrl);
      }
      return;
    }
    index = Number.isInteger(next) ? next : index - 1;
    currentState = { ...event.state, [key]: index };
    currentUrl = target.location.href;
    replace.call(history, currentState, "", currentUrl);
  };
  const unload = (event: BeforeUnloadEvent) => {
    if (!drafts.size) return;
    event.preventDefault();
    event.returnValue = "";
  };
  const click = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      !drafts.size ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor = (event.target as Element | null)?.closest(
      "a[href]",
    ) as HTMLAnchorElement | null;
    if (
      !anchor ||
      anchor.target === "_blank" ||
      anchor.hasAttribute("download")
    )
      return;
    if (anchor.href.split("#")[0] === target.location.href.split("#")[0])
      return;
    if (!allowed()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  target.addEventListener("popstate", pop, true);
  target.addEventListener("beforeunload", unload);
  target.document.addEventListener("click", click, true);
  return () => {
    history.pushState = push;
    history.replaceState = replace;
    target.removeEventListener("popstate", pop, true);
    target.removeEventListener("beforeunload", unload);
    target.document.removeEventListener("click", click, true);
  };
}
