"use client";
import { useLanguage } from "@/components/language-context";

import { useEffect, useId, useRef, type ReactNode } from "react";
import {
  Coffee,
  Utensils,
  LogOut,
  ArrowRight,
  Backpack,
  BookOpen,
  Bookmark,
  Briefcase,
  Check,
  ChevronRight,
  CircleHelp,
  Coins,
  Compass,
  Crosshair,
  FileText,
  Flame,
  FlaskConical,
  Image as ImageIcon,
  Map,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Package,
  ScrollText,
  Send,
  Settings,
  Shield,
  Shirt,
  Sparkles,
  Swords,
  UserRound,
  Users,
  X,
  Zap,
  Mail,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Coffee,
  Utensils,
  Exit: LogOut,
  camp: Flame,
  campaigns: Compass,
  game: Compass,
  character: UserRound,
  inventory: Backpack,
  party: Users,
  "dm-chat": MessageSquare,
  journal: BookOpen,
  map: Map,
  world: FlaskConical,
  library: FileText,
  gallery: ImageIcon,
  sessions: ScrollText,
  saves: Bookmark,
  settings: Settings,
  ArrowRight,
  Bookmark,
  Briefcase,
  Check,
  ChevronRight,
  CircleHelp,
  Coins,
  Crosshair,
  FileText,
  Flame,
  FlaskConical,
  Image: ImageIcon,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Package,
  Send,
  Shield,
  Shirt,
  Sparkles,
  Swords,
  UserRound,
  Users,
  X,
  Zap,
  Mail,
  BookOpen,
  ScrollText,
};
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const Component = icons[name] || CircleHelp;
  return <Component size={size} strokeWidth={1.5} aria-hidden="true" />;
}

// Art-only windows into the supplied mockups. The interface itself is real HTML.
const artwork: Record<
  string,
  { file: string; size?: [number, number]; box: string }
> = {
  city: { file: "01_game", box: "255 70 985 370" },
  james: { file: "01_game", box: "1273 84 91 100" },
  figure: { file: "02_character_inventory", box: "686 104 261 746" },
  jinn: { file: "06_session_recap", box: "1050 484 152 106" },
  letter: { file: "06_session_recap", box: "1050 223 150 100" },
  symbol: { file: "06_session_recap", box: "1050 620 150 97" },
  meeting: { file: "06_session_recap", box: "1050 354 153 105" },
  lab: { file: "04_evidence_board", box: "868 596 173 120" },
  unknown: { file: "04_evidence_board", box: "629 247 136 123" },
  coast: { file: "05_map_travel", box: "784 806 151 91" },
  chicago: { file: "05_map_travel", box: "431 806 150 91" },
  denver: { file: "05_map_travel", box: "608 806 152 91" },
  moon: {
    file: "03_campaigns_library",
    size: [1672, 941],
    box: "220 319 318 190",
  },
  space: {
    file: "03_campaigns_library",
    size: [1672, 941],
    box: "220 537 318 191",
  },
  car: { file: "02_character_inventory", box: "1107 803 160 91" },
  map: { file: "05_map_travel", box: "239 161 921 584" },
};
const artLabels: Record<string, string> = {
  city: "New York",
  james: "James",
  figure: "James",
  jinn: "Jinn",
  letter: "The Letter",
  symbol: "The Symbol",
  meeting: "The meeting",
  lab: "Convergence Labs",
  unknown: "Unknown Sender",
  coast: "San Francisco",
  chicago: "Chicago",
  denver: "Denver",
  moon: "Ashes of the Moon",
  space: "Void and Dust",
  car: "Old Ford",
  map: "The Joined America",
};
export function Art({
  name = "city",
  className = "",
  label,
}: {
  name?: string;
  className?: string;
  label?: string;
}) {
  const { t } = useLanguage();
  const art = artwork[name] || artwork.city;
  const clipId = useId();
  const [x, y, width, height] = art.box.split(" ").map(Number);
  return (
    <svg
      className={`art ${className}`}
      viewBox={art.box}
      preserveAspectRatio={
        name === "figure" ? "xMidYMid meet" : "xMidYMid slice"
      }
      role="img"
      aria-label={label || t(artLabels[name] || "Scene artwork")}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
      </defs>
      <image
        clipPath={`url(#${clipId})`}
        href={`/art/${art.file}.png`}
        width={art.size?.[0] || 1586}
        height={art.size?.[1] || 992}
      />
    </svg>
  );
}
export function Button({
  children,
  onClick,
  primary,
  className = "",
  disabled,
  type = "button",
  label,
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  label?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`button ${primary ? "primary" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
export function Panel({
  children,
  title,
  action,
  className = "",
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-heading">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Tabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="tabs" aria-label={t("View options")}>
      {options.map((option) => (
        <button
          key={option}
          aria-pressed={value === option}
          className={value === option ? "active" : ""}
          onClick={() => onChange(option)}
        >
          {t(option)}
        </button>
      ))}
    </div>
  );
}
export function Badge({
  children,
  green,
}: {
  children: ReactNode;
  green?: boolean;
}) {
  return <span className={`badge ${green ? "green" : ""}`}>{children}</span>;
}
export function Meter({
  label,
  value,
  color,
  percent = 100,
}: {
  label: string;
  value: string;
  color: string;
  percent?: number;
}) {
  return (
    <div className="meter">
      <div>
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="meter-track">
        <span style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={titleId}
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onKeyDown={(event) => {
        // A nested item dialog owns its keyboard interaction; its parent stash
        // must not also trap Tab or react to the same Escape/cancel event.
        event.stopPropagation();
        if (event.key !== "Tab") return;
        const dialog = event.currentTarget;
        const controls = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            "button, [href], input, select, textarea, summary, [tabindex]",
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            element.getClientRects().length > 0,
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (!first || !last) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <h2 id={titleId}>{title}</h2>
        <Button label={t("Close dialog")} onClick={onClose}>
          <Icon name="X" />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
