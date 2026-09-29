"use client";
import { useMemo, useState } from "react";
import type {
  AdventureCatalog,
  NewHeroResult,
  PublicWorld,
} from "../../lib/adventures/contracts";
import type {
  BootstrapTransport,
  CreationInput,
} from "../../lib/adventures/bootstrap-contracts";
import type { CampaignSnapshot } from "../../lib/persistence/contracts";
import type { AdventureTransport } from "../../lib/adventures/client";
import {
  parseCreationProposal,
  parseOpeningProposal,
} from "../../lib/adventures/bootstrap-validation";
import { NewCampaignForm } from "./new-campaign";
import { AdventuresPanel } from "../adventures/adventures-panel";
import { useLanguage } from "../language-context";
import styles from "../adventures/adventures.module.css";
const id = (n: number) =>
  `40000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const ignore = () => {};
function scripted(language: "en" | "ru", orbital: boolean) {
  const ru = language === "ru";
  const world: PublicWorld = {
    id: id(1),
    versionId: id(2),
    version: 1,
    title: orbital
      ? ru
        ? "Орбитальная граница Юпитера"
        : "Jupiter orbital frontier"
      : ru
        ? "Открытые дороги"
        : "Open roads",
    premise: orbital
      ? ru
        ? "Человеческие поселения и станции около Юпитера."
        : "Human settlements and stations around Jupiter."
      : ru
        ? "Мир обычных странников и поселений."
        : "A world of ordinary travellers and settlements.",
    packVersionIds: [],
  };
  let catalog: AdventureCatalog = {
    campaignId: id(3),
    timeline: { timelineId: id(4), epoch: 1 },
    revision: 1,
    runtimeRevision: 1,
    expectedHeadId: id(5),
    worldBinding: { worldId: world.id, worldVersion: 1, title: world.title },
    activeAdventureId: null,
    adventures: [],
    history: [],
    canChange: true,
    detachedPlayable: false,
    requiresOpening: true,
  };
  let protagonist: CreationInput | null = null,
    openingText = "",
    place = "";
  const result: NewHeroResult = {
    requestId: id(6),
    campaignId: id(3),
    heroId: id(7),
  };
  const worlds = { worlds: [world], packs: [] };
  const usage = {
    model: "scripted-preview",
    inputTokens: 0,
    outputTokens: 0,
    latencyMs: 0,
  };
  const bootstrap: BootstrapTransport = {
    async proposeCharacter(input) {
      protagonist = input;
      const caps = [
        "navigation",
        "piloting",
        "dock negotiation",
        "careful observation",
        "навигация",
        "пилотирование",
        "наблюдение",
      ].filter((t) => input.description.includes(t));
      const limits = [
        "cannot cast spells",
        "no combat training",
        "не умею колдовать",
      ].filter((t) => input.description.includes(t));
      const proposal = parseCreationProposal(
        {
          schemaVersion: 1,
          capabilities: caps.map((text) => ({
            text,
            quote: input.description,
          })),
          limitations: limits.map((text) => ({
            text,
            quote: input.description,
          })),
          possessions: input.description.includes("compass")
            ? [
                {
                  name: "compass",
                  description: "",
                  quantity: 1,
                  quote: input.description,
                },
              ]
            : [],
          resources: [],
          questions: [],
        },
        input,
      );
      return {
        kind: "creation",
        draftId: input.requestId,
        input,
        proposal,
        usage,
      };
    },
    async createCharacter(input) {
      if (protagonist)
        protagonist = {
          ...protagonist,
          name: input.review.name,
          description: input.review.description,
        };
      return { ...result, requestId: input.requestId };
    },
    async proposeOpening(command) {
      place = orbital
        ? ru
          ? "Причал орбитальной станции"
          : "Orbital station dock"
        : ru
          ? "Площадь у дороги"
          : "Wayside square";
      openingText = orbital
        ? ru
          ? "На публичном табло шаттл снабжения отмечен как задержавшийся. Координатор причала рядом. Вы можете спросить о доступных записях или осмотреть причал."
          : "The public display marks the supply shuttle as overdue. A dock coordinator is nearby. You can ask about the available records or survey the dock."
        : ru
          ? "У доски объявлений устроитель работ готов обсудить обычную оплачиваемую работу. Условия ещё не согласованы. Вы можете спросить, осмотреться или уйти."
          : "Beside a notice board, a work organiser can discuss ordinary paid work. No terms have been agreed. You may ask, look around or leave.";
      const proposal = parseOpeningProposal({
        schemaVersion: 1,
        location: {
          name: place,
          description: orbital
            ? ru
              ? "Публичная зона прибытия с табло движения."
              : "Public arrivals area with a traffic display."
            : ru
              ? "Общественная площадь с доской объявлений."
              : "A public square with a notice board.",
        },
        situation: openingText,
        narration: openingText,
        actors: [
          {
            name: orbital
              ? ru
                ? "Координатор причала"
                : "Dock coordinator"
              : ru
                ? "Устроитель работ"
                : "Work organiser",
            description: ru
              ? "Доступен для обычного разговора."
              : "Available for ordinary conversation.",
            capabilities: [ru ? "обычный разговор" : "ordinary conversation"],
            limitations: [],
          },
        ],
        questions: [],
      });
      return {
        kind: "opening",
        draftId: command.input.requestId,
        command,
        proposal,
        usage,
      };
    },
    async startOpening(input) {
      openingText = input.review.narration!;
      place = input.review.location.name!;
      catalog = {
        ...catalog,
        requiresOpening: false,
        activeAdventureId: catalog.adventures[0].id,
        revision: catalog.revision + 1,
      };
      catalog.adventures[0] = {
        ...catalog.adventures[0],
        status: "active",
        version: 2,
        previousVersionId: catalog.adventures[0].versionId,
        versionId: id(20),
        start: { sceneId: id(21), worldMinutes: 0 },
      };
      catalog.history.push(catalog.adventures[0]);
      return { requestId: input.requestId, snapshot: structuredClone(catalog) };
    },
  };
  const transport: AdventureTransport = {
    worlds: async () => worlds,
    read: async () => structuredClone(catalog),
    createWorld: async () => {
      throw new Error("Choose the synthetic World.");
    },
    newHero: async () => {
      throw new Error("Compatibility starter is checked separately.");
    },
    send: async (command) => {
      if (command.action !== "prepare")
        throw new Error("Synthetic prepare only");
      const adventure = {
        id: id(8),
        versionId: id(9),
        previousVersionId: null,
        version: 1,
        campaignId: id(3),
        timelineId: id(4),
        worldId: world.id,
        worldVersion: 1,
        ...{
          title: command.input.title,
          premise: command.input.premise,
          pacing: command.input.pacing,
        },
        mode: "canon" as const,
        status: "prepared" as const,
        start: null,
        completion: null,
        summary: null,
        review: null,
        createdAt: "2026-09-28T12:00:00.000Z",
      };
      catalog = {
        ...catalog,
        revision: 2,
        runtimeRevision: 2,
        expectedHeadId: id(10),
        adventures: [adventure],
        history: [adventure],
      };
      return {
        requestId: command.input.requestId,
        snapshot: structuredClone(catalog),
      };
    },
  };
  return {
    worlds,
    transport,
    bootstrap,
    catalog: () => structuredClone(catalog),
    opening: () => ({ text: openingText, place, name: protagonist?.name }),
    snapshot: () =>
      ({
        campaign: {
          id: id(3),
          title: protagonist?.title ?? "Synthetic bootstrap",
          language,
        },
        timeline: catalog.timeline,
      }) as CampaignSnapshot,
  };
}
export function BootstrapPreview() {
  const { language, setLanguage } = useLanguage(),
    [orbital, setOrbital] = useState(false),
    [screen, setScreen] = useState("creation"),
    [revision, setRevision] = useState(0);
  const ru = language === "ru";
  const harness = useMemo(
    () => scripted(language, orbital),
    [language, orbital],
  );
  const sample = orbital
    ? ru
      ? "Независимый пилот: навигация, пилотирование, переговоры в доках."
      : "An independent cargo pilot with navigation, piloting and dock negotiation. I have no combat training."
    : ru
      ? "Неизвестный странник. Я умею вести наблюдение; не умею колдовать."
      : "An unknown wanderer. I know navigation and careful observation. I cannot cast spells. I carry a compass.";
  return (
    <div key={`${language}:${orbital}`} className={styles.form}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {ru ? "СИНТЕТИЧЕСКАЯ ПРОВЕРКА" : "SYNTHETIC REVIEW"}
          </span>
          <h1>
            {ru
              ? "Ваш герой. Ваше начало."
              : "Your protagonist. Your beginning."}
          </h1>
          <p>
            {ru
              ? "Демонстрация: без базы данных, платных запросов или реального приключения. Ответы заранее подготовлены."
              : "Demo only: no database, paid requests or real Adventure. Responses are scripted."}
          </p>
        </div>
        <div className={styles.actions}>
          <button
            onClick={() => {
              setLanguage(language === "en" ? "ru" : "en");
              setScreen("creation");
            }}
          >
            {language === "en" ? "Русский" : "English"}
          </button>
          <button
            onClick={() => {
              setOrbital((v) => !v);
              setScreen("creation");
            }}
          >
            {orbital ? (ru ? "Фэнтези" : "Fantasy") : ru ? "Юпитер" : "Jupiter"}
          </button>
        </div>
      </div>
      {screen === "creation" && (
        <>
          <p className={styles.muted}>
            {ru ? "Пример, который можно вставить:" : "Example to paste:"}{" "}
            {sample}
          </p>
          <NewCampaignForm
            key={`create:${revision}`}
            language={language}
            initialWorlds={harness.worlds}
            persistPending={false}
            transport={harness.transport}
            bootstrapTransport={harness.bootstrap}
            onDirty={ignore}
            onCancel={() => setRevision((v) => v + 1)}
            onCreated={async () => setScreen("adventures")}
          />
        </>
      )}
      {screen === "adventures" && (
        <AdventuresPanel
          snapshot={harness.snapshot()}
          language={language}
          initialWorlds={harness.worlds}
          initialCatalog={harness.catalog()}
          transport={harness.transport}
          bootstrapTransport={harness.bootstrap}
          persistPending={false}
          onDirty={ignore}
          onSaved={async () => setRevision((v) => v + 1)}
          onStarted={() => setScreen("game")}
        />
      )}
      {screen === "game" && (
        <section className={styles.panel}>
          <span className={styles.badge}>
            {ru ? "ИГРА · ТОЛЬКО ПРЕВЬЮ" : "GAME · PREVIEW ONLY"}
          </span>
          <h2>{harness.opening().place}</h2>
          <p className={styles.intro}>{harness.opening().text}</p>
          <p>{harness.opening().name} · World Logic</p>
          <p className={styles.muted}>
            {ru
              ? "Обычные действия проверены отдельно через авторитетный World Logic на одноразовой базе. Здесь действие не отправляется."
              : "Ordinary actions are separately tested through authoritative World Logic on a disposable database. This preview does not send an action."}
          </p>
          <div className={styles.actions}>
            <button
              onClick={() => {
                setScreen("creation");
                setOrbital((v) => !v);
              }}
            >
              {ru ? "Проверить другой мир" : "Review another world"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
