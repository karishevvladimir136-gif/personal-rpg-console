// Fix run E (item 81): the session close of the synthetic sample — the current session ended and digested, in the short
// form («что было» in a few lines) or the long one (the ending cards). Preview-only content.
import type { CampaignSnapshot, SessionEnding } from "../../persistence/contracts.ts";
import { PREVIEW_IDS as I } from "./stage5-fixture.ts";

export function previewEnded(snapshot: CampaignSnapshot, form: SessionEnding["form"]): CampaignSnapshot {
  const ending: SessionEnding = {
    version: 1, form, turns: form === "cards" ? 34 : 11, playMinutes: form === "cards" ? 255 : 58,
    lines: form === "short" ? ["«Бабка» готова к вылету: левый двигатель дышит, правый кашляет.", "Изольда сняла перстень-печать и следит за сердечником Г-7.", "Мэг советует верить клятве, а не Изольде."] : [],
    cards: form === "cards" ? [
      { entityId: I.meg, name: "Мэг Рыжая", where: "на борту «Бабки»", standing: "прикрывает тебе спину", fate: "Держит слово и револьвер наготове — до самой Женевы." },
      { entityId: I.urzul, name: "Урзул Железный Бок", where: "у котлов «Бабки»", standing: "верен", fate: "Чинит правый двигатель и ворчит, что тот кашляет к беде." },
      { entityId: I.wolf, name: "Вольф Кесслер", where: "неизвестно", standing: "должен тебе жизнь", fate: "Ушёл в туман за Корнелиусом и не вернулся к утру." },
      { entityId: I.isolde, name: "Изольда Вэйл", where: "у трапа", standing: "под клятвой, но себе на уме", fate: "Перстня-печати больше нет; куда он делся — неизвестно." },
      { entityId: null, name: "Экипаж «Звезды Атлантики»", where: "в Лиссабоне", standing: "благодарны", fate: "Спасены; капитан обещал не забыть." },
    ] : [],
    threads: ["Где перстень-печать Изольды", "Корнелиус на свободе", "Долг Тиаго — он попросит услугу", "Ещё два сердечника для Узора Семи", "Правый двигатель «Бабки»"],
    channel: "донесение начальнику порта",
  };
  return {
    ...snapshot,
    sessions: snapshot.sessions.map((row) => row.id !== I.session7 ? row : {
      ...row, status: "closed" as const, title: "Перед вылетом",
      recap: "«Бабка» стоит на швартовах в пещере Альварешей, курс — Женева. На кону — сердечник Г-7 в твоей торбе и клятва Изольды. Впереди перелёт, в котором кто-нибудь обязательно будет стрелять.",
      stinger: "Начальнику порта доложили: ночью у пещеры Альварешей видели чужой дирижабль без огней. Он ушёл на север, к перевалам.",
      ending,
    }),
  };
}
