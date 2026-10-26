"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Backpack,
  BookOpen,
  Bookmark,
  Clapperboard,
  Compass,
  Contact,
  Ellipsis,
  Feather,
  Gauge,
  FlaskConical,
  Globe,
  History,
  Image as ImageIcon,
  Library,
  Map as MapIcon,
  Menu,
  MessageSquare,
  Save,
  ScrollText,
  Settings,
  Ship,
  Swords,
  Tent,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useOptionalCampaignData, useWorkspaceData } from "../persistence-context";
import { loadDmSettings, dmTurnModels, type DmSettings } from "@/lib/gameplay/dm-settings-client";
import {
  currentPlace,
  currentSession,
  heroOf,
  holdingsNavLabel,
  holdingsOf,
  sessionNumber,
  worldClock,
} from "@/lib/ui/campaign-view";
import { longRestEnds } from "@/lib/gameplay/world-day";
import { effortLabel } from "@/lib/ui/effort";
import { useCopy, registry as r } from "./primitives";
import { LiveImages } from "./live-images";
import { VisualAutopilot } from "./visual-autopilot";
import { MusicControl, MusicProvider } from "./music-player";
import s from "./shell.module.css";

export type CampaignScreenId =
  | "game" | "character" | "inventory" | "party" | "journal" | "codex" | "map" | "live" | "holdings"
  | "adventures" | "library" | "settings" | "sessions" | "saves" | "timeline" | "world"
  | "dm-chat" | "gallery" | "frame" | "pictures" | "home" | "camp" | "owner";

type Chrome = {
  /** Synthetic previews route inside /preview and never fetch. */
  href?: (screen: CampaignScreenId) => string;
  current?: CampaignScreenId;
  dmSettings?: DmSettings | null;
  libraryHref?: (screen: LibraryScreenId) => string;
  libraryCurrent?: LibraryScreenId;
  /** Previews: «Крупный текст истории» without the saved preferences. */
  largeText?: boolean;
};
const ChromeContext = createContext<Chrome | null>(null);
export function RegistryChrome({ value, children }: { value: Chrome; children: ReactNode }) {
  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}
export function useChrome() {
  return useContext(ChromeContext);
}

/** The game screen reports the world clock; the shell header shows it. Fix S4 11u′: with the play's rest records, so the
 * header's day turns where the DM's does (at first light or at the end of a long rest). */
const ClockContext = createContext<{ minutes: number | null; set: (minutes: number | null, longRests?: string) => void } | null>(null);
export function useShellClock(minutes: number | null | undefined, rests?: Parameters<typeof longRestEnds>[0]) {
  const clock = useContext(ClockContext);
  const set = clock?.set;
  const longRests = longRestEnds(rests).join(",");
  useEffect(() => {
    set?.(minutes ?? null, longRests);
  }, [minutes, longRests, set]);
}

/** The campaign's DM model choice (stage 2 settings), for the pill and the nav box. */
export function useDmSettings(campaignId: string | undefined) {
  const chrome = useChrome();
  const injected = chrome?.dmSettings;
  const [loaded, setLoaded] = useState<DmSettings | null>(null);
  useEffect(() => {
    if (injected !== undefined || !campaignId) return;
    let live = true;
    loadDmSettings(campaignId).then((next) => { if (live) setLoaded(next); }, () => {});
    return () => { live = false; };
  }, [campaignId, injected]);
  return injected !== undefined ? injected : loaded;
}
export function dmModelLabel(settings: DmSettings | null, short = false) {
  const model = settings?.dmTurn ? dmTurnModels.find((entry) => entry.modelId === settings.dmTurn?.modelId) : null;
  if (model) return short ? model.label.replace(/^Claude /, "").replace(/^GPT-6 /, "") : model.label;
  return short ? "Astra" : "GPT-6 Astra";
}

type NavItem = { id: CampaignScreenId; label: string; icon: LucideIcon };

export function CampaignShell({ children }: { children: ReactNode }) {
  const c = useCopy();
  const lang = c.language;
  const chrome = useChrome();
  const pathname = usePathname();
  const snapshot = useOptionalCampaignData();
  const data = snapshot?.data ?? null;
  // Fix run after session 2 (item 6): «Крупный текст истории» reaches today's game screen — the campaign shell
  // carries the class the story's sizes read (game.module.css).
  const workspace = useWorkspaceData();
  const largeText = chrome?.largeText ?? !!workspace?.data?.preferences.largeText;
  const [drawer, setDrawer] = useState(false);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [longRests, setLongRests] = useState("");
  const clockValue = useMemo(() => ({ minutes, set: (next: number | null, rests = "") => { setMinutes(next); setLongRests(rests); } }), [minutes]);
  const dm = useDmSettings(data?.campaign.id);
  if (!data) return <>{children}</>;
  const campaign = data.campaign;
  const holdings = holdingsOf(data);
  const href = chrome?.href ?? ((screen: CampaignScreenId) => `/campaigns/${encodeURIComponent(campaign.id)}/${screen}`);
  const current = chrome?.current ?? (pathname.split("/").filter(Boolean).at(-1) as CampaignScreenId | undefined);
  const primary: NavItem[] = [
    { id: "game", label: c("Игра", "Game"), icon: Compass },
    { id: "character", label: c("Персонаж", "Character"), icon: UserRound },
    { id: "inventory", label: c("Инвентарь", "Inventory"), icon: Backpack },
    { id: "party", label: c("Партия", "Party"), icon: Users },
    { id: "journal", label: c("Журнал", "Journal"), icon: BookOpen },
    { id: "codex", label: c("Кодекс", "Codex"), icon: Contact },
    { id: "map", label: c("Карта", "Map"), icon: MapIcon },
    { id: "live", label: c("2D", "2D Live"), icon: Clapperboard },
    { id: "holdings", label: holdingsNavLabel(holdings, lang), icon: holdings.some((row) => row.kind !== "camp") ? Ship : Tent },
    { id: "adventures", label: c("Приключения", "Adventures"), icon: Swords },
    { id: "library", label: c("Библиотека", "Library"), icon: Library },
    { id: "settings", label: c("Настройки", "Settings"), icon: Settings },
  ];
  const secondary: NavItem[] = [
    { id: "sessions", label: c("Сессии", "Sessions"), icon: ScrollText },
    { id: "saves", label: c("Сейвы", "Saves"), icon: Bookmark },
    // Fix S3-pre B-13: the gallery took the chronicle's place (item 80); the chronicle stays reachable by its URL only.
    { id: "timeline", label: c("Линии времени", "Timelines"), icon: History },
    { id: "world", label: c("Мастерская мира", "World Lab"), icon: FlaskConical },
    { id: "dm-chat", label: c("Чат с ведущим", "Chat with DM"), icon: MessageSquare },
    { id: "pictures", label: c("Картинки", "Pictures"), icon: ImageIcon },
    // Fix run A3/A5: the owner's screen — what each turn cost, what the DM received.
    { id: "owner", label: c("Для владельца", "For the owner"), icon: Gauge },
  ];
  const all = [...primary, ...secondary];
  const active = all.find((item) => item.id === current) ?? (current === "home" || current === "camp" ? primary.find((item) => item.id === "holdings") : undefined);
  const hero = heroOf(data);
  const session = currentSession(data);
  const number = sessionNumber(data, session?.id);
  const place = currentPlace(data);
  const clock = worldClock(minutes, lang, longRests ? longRests.split(",").map(Number) : []);
  const model = dmModelLabel(dm);
  const shortModel = dmModelLabel(dm, true);
  const effort = dm?.dmTurn?.reasoning;
  const link = (item: NavItem, onClick?: () => void) => (
    <Link key={item.id} href={href(item.id)} className={s.link} aria-current={active?.id === item.id ? "page" : undefined} onClick={onClick}>
      <item.icon size={20} strokeWidth={1.6} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
  const tabs: NavItem[] = [primary[0], primary[1], primary[2], primary[4], primary[3]];
  // The music stage: the soundtrack provider wraps the live shell (the header control and every
  // screen share one player); previews render no player.
  const Music = chrome?.href ? NoMusic : MusicProvider;
  return (
    <ClockContext.Provider value={clockValue}>
     <Music campaignId={campaign.id}>
      <div className={`${s.app} ${largeText ? "large-text" : ""}`}>
        <a className={s.skip} href="#main">{c("К содержимому", "Skip to content")}</a>
        <nav className={s.nav} aria-label={c("Разделы кампании", "Campaign sections")}>
          <Link className={s.brand} href={chrome?.libraryHref?.("campaigns") ?? "/campaigns"}>
            <span className={s.brandEyebrow}>Personal RPG Console</span>
            <span className={s.brandTitle}>{campaign.title}</span>
            <span className={s.brandSub}>{[c("Кампания", "Campaign"), hero?.name].filter(Boolean).join(" · ")}</span>
          </Link>
          <div className={s.links}>{primary.map((item) => link(item))}</div>
          <details className={s.more} open={secondary.some((item) => item.id === active?.id)}>
            <summary><Ellipsis size={16} aria-hidden="true" />{c("Ещё", "More")}</summary>
            <div className={s.links}>{secondary.map((item) => link(item))}</div>
          </details>
          <Link className={s.dm} href={href("settings")}>
            <span className={r.eyebrow}>{c("Ведущий", "Game Master")}</span>
            <span className={s.dmName}>{dm ? model : "…"}</span>
            <span className={s.dmMeta}>
              {[effort ? c(`глубина: ${effortLabel(effort, lang)}`, `effort: ${effortLabel(effort, lang)}`) : null,
                dm?.runtime === "astra-primary-v1" ? c("старый ход", "previous runtime") : null].filter(Boolean).join(" · ") || c("настройки кампании", "campaign settings")}
            </span>
          </Link>
        </nav>
        <header className={s.mobileTop}>
          <button type="button" className={`${r.iconBtn} ${s.menuButton}`} aria-label={c("Меню", "Menu")} aria-expanded={drawer} onClick={() => setDrawer(true)}>
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className={s.mobileTitle}>
            <b>{campaign.title}</b>
            <span>{[session?.title, place?.name].filter(Boolean).join(" · ") || active?.label}</span>
          </div>
          <MusicControl campaignId={campaign.id} compact />
        </header>
        <div className={s.main}>
          <header className={s.header}>
            <div className={s.crumbs}>
              <Link href={href("game")}>{campaign.title}</Link>
              {session && <><span aria-hidden="true">›</span><span>{number ? c(`Сессия ${number}`, `Session ${number}`) : session.title}</span></>}
              <span aria-hidden="true">›</span>
              <b>{active && active.id !== "game" ? active.label : place?.name ?? session?.title ?? c("Игра", "Game")}</b>
            </div>
            <div className={s.headerTools}>
              {clock && <span className={s.clock}>{clock}</span>}
              {dm && <span className={r.pill}>{shortModel}</span>}
              {/* The music stage: one small player control (mood, volume, mute, off, pin, skip). */}
              <MusicControl campaignId={campaign.id} />
              <Link className={r.iconBtn} href={href("saves")} aria-label={c("Сохранить игру", "Save game")} title={c("Сейвы", "Saves")}>
                <Save size={20} strokeWidth={1.6} aria-hidden="true" />
              </Link>
            </div>
          </header>
          <main id="main" tabIndex={-1} className={s.main} style={{ padding: 0 }}>
            {/* Previews supply their own sample art; the live app shows accepted subject visuals. */}
            {chrome?.href ? children : (
              <LiveImages data={data}>
                <VisualAutopilot data={data} refresh={snapshot!.refresh}>{children}</VisualAutopilot>
              </LiveImages>
            )}
          </main>
        </div>
        <nav className={s.tabbar} aria-label={c("Разделы", "Sections")}>
          {tabs.map((item) => (
            <Link key={item.id} href={href(item.id)} className={s.tab} aria-current={active?.id === item.id ? "page" : undefined}>
              <item.icon size={20} strokeWidth={1.6} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        {drawer && (
          <>
            <button type="button" className={r.drawerScrim} aria-label={c("Закрыть меню", "Close menu")} onClick={() => setDrawer(false)} />
            <div className={r.drawer} role="dialog" aria-modal="true" aria-label={c("Разделы кампании", "Campaign sections")} style={{ left: 0, right: "auto", borderLeft: 0, borderRight: "1px solid var(--line-strong)" }}>
              <div className={r.panelHead}>
                <span className={s.brandTitle}>{campaign.title}</span>
                <button type="button" className={r.iconBtn} aria-label={c("Закрыть меню", "Close menu")} onClick={() => setDrawer(false)}><X size={20} aria-hidden="true" /></button>
              </div>
              <div className={s.drawerLinks}>{all.map((item) => link(item, () => setDrawer(false)))}</div>
              <Link className={s.link} href={chrome?.libraryHref?.("campaigns") ?? "/campaigns"} onClick={() => setDrawer(false)}>
                <Library size={20} aria-hidden="true" /><span>{c("Все кампании", "All campaigns")}</span>
              </Link>
            </div>
          </>
        )}
      </div>
     </Music>
    </ClockContext.Provider>
  );
}
function NoMusic({ children }: { campaignId: string; children: ReactNode }) {
  return <>{children}</>;
}

export type LibraryScreenId = "campaigns" | "world-library" | "dm-craft" | "settings" | "menu";

export function LibraryShell({ children }: { children: ReactNode }) {
  const c = useCopy();
  const chrome = useChrome();
  const pathname = usePathname();
  // The workspace provider wraps the whole app; on previews it stays empty.
  const workspace = useWorkspaceData();
  const href = chrome?.libraryHref ?? ((screen: LibraryScreenId) => (screen === "menu" ? "/" : `/${screen}`));
  const current = chrome?.libraryCurrent ?? ((pathname.split("/").filter(Boolean)[0] ?? "menu") as LibraryScreenId);
  const items: { id: LibraryScreenId; label: string; icon: LucideIcon }[] = [
    { id: "campaigns", label: c("Кампании", "Campaigns"), icon: BookOpen },
    { id: "world-library", label: c("Миры", "Worlds"), icon: Globe },
    { id: "dm-craft", label: c("Мастерство Ведущего", "DM Craft"), icon: Feather },
    { id: "settings", label: c("Настройки", "Settings"), icon: Settings },
  ];
  const largeText = chrome?.largeText ?? workspace?.data?.preferences.largeText;
  // The home screen is the menu itself: no side menu or tab bar repeating its buttons, the card centred
  // in the window (owner, session 2: «оно раньше было по середине экрана»).
  if (current === "menu")
    return (
      <div className={`${s.menuApp} ${largeText ? "large-text" : ""}`}>
        <a className={s.skip} href="#main">{c("К содержимому", "Skip to content")}</a>
        <main id="main" tabIndex={-1} className={s.menuMain}>
          {children}
        </main>
      </div>
    );
  return (
    <div className={`${s.app} ${largeText ? "large-text" : ""}`}>
      <a className={s.skip} href="#main">{c("К содержимому", "Skip to content")}</a>
      <nav className={s.nav} aria-label={c("Главное меню", "Main menu")}>
        <Link className={s.brand} href={href("menu")}>
          <span className={s.brandEyebrow}>RPG Console</span>
          <span className={s.brandTitle}>{c("Библиотека историй", "Story library")}</span>
        </Link>
        <div className={s.links}>
          {items.map((item) => (
            <Link key={item.id} href={href(item.id)} className={s.link} aria-current={current === item.id ? "page" : undefined}>
              <item.icon size={20} strokeWidth={1.6} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <header className={s.mobileTop}>
        <span />
        <div className={s.mobileTitle}>
          <b>{c("Библиотека историй", "Story library")}</b>
          <span>{items.find((item) => item.id === current)?.label ?? "RPG Console"}</span>
        </div>
        <span />
      </header>
      <main id="main" tabIndex={-1} className={s.main}>
        {children}
      </main>
      <nav className={s.tabbar} aria-label={c("Главное меню", "Main menu")} style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {items.map((item) => (
          <Link key={item.id} href={href(item.id)} className={s.tab} aria-current={current === item.id ? "page" : undefined}>
            <item.icon size={20} strokeWidth={1.6} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
