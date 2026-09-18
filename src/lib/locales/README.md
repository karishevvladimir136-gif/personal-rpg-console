# Interface translations

`ru.json` is the bilingual message catalog: each English source phrase is a stable key and its value is the Russian translation. English uses the source phrase directly. `translate()` provides interpolation and an English fallback; `useLanguage()` shares the current interface language across the app.

- Add both phrases here, then render the key with `t("English source phrase")`. Use `LocalizedText` for text passed through a server-rendered boundary such as the missing-page screen.
- Translate labels, placeholders, accessible names, empty states, dialogs, and static sample data. Use complete sentences with `{named}` parameters for changing values; keep parameter names identical in both languages.
- Keep route slugs, record IDs, option values, tab/filter state, and React keys independent of translations. Translate their labels at display time. `Tabs` translates its own labels and retains its existing values.
- Never pass user-entered text through `t()`. Notes and actions remain literal. OOC is stored separately from action text so only its UI prefix is translated.
- Language option names deliberately use their own language: **English**, **Русский**. Text painted into the supplied artwork remains part of the original image.
- The isolated Phase 0 previews use temporary language preferences. In the persistent application, the owner’s interface preference is saved across campaigns; campaign language is saved separately with `campaign_id` and controls future Phase 2 narration. Neither setting rewrites existing owner text or saved narration.

Run `pnpm test` with the preview running to check catalog coverage and interpolation alongside the route checks. Review changed text on desktop and mobile in both languages.
