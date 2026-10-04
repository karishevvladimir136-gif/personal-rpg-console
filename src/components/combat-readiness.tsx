"use client";

import { useEffect, useRef, useState } from "react";
import type { CombatReadinessConfirmation, CombatReadinessPerson, CombatReadinessProposal } from "@/lib/gameplay/combat-readiness";
import { combatReadinessNeeded, genericNpcBaseline, missingPlayerDefaults, suggestedWeaponIndex } from "@/lib/gameplay/combat-readiness";
import { confirmCombatReadiness, gameplayErrorMessage, loadCombatReadiness } from "@/lib/gameplay/client";
import { useLanguage } from "./language-context";
import { Button } from "./ui";

type Stat = "hp" | "attack" | "defense" | "skill";
const stats: Stat[] = ["hp", "attack", "defense", "skill"];
const labels: Record<Stat, string> = { hp: "HP", attack: "Attack", defense: "Defense", skill: "Skill" };
function missing(person: CombatReadinessPerson, stat: Stat) {
  return person[stat] === null;
}

export function CombatReadiness({ campaignId, runtimeRevision, onSaved }: { campaignId: string; runtimeRevision: number; onSaved: () => Promise<void> }) {
  const { t } = useLanguage();
  const [proposal, setProposal] = useState<CombatReadinessProposal | null>(null);
  const [player, setPlayer] = useState<Record<Stat, number>>({ ...missingPlayerDefaults });
  const [weaponIndex, setWeaponIndex] = useState<number | null>(null);
  const [damage, setDamage] = useState(2);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const attempt = useRef<CombatReadinessConfirmation | null>(null);
  const guard = useRef(false);
  useEffect(() => {
    let active = true;
    void loadCombatReadiness(campaignId).then((next) => {
      if (!active) return;
      setProposal(next);
      setPlayer({
        hp: next.hero.hp ?? missingPlayerDefaults.hp,
        attack: next.hero.attack ?? missingPlayerDefaults.attack,
        defense: next.hero.defense ?? missingPlayerDefaults.defense,
        skill: next.hero.skill ?? missingPlayerDefaults.skill,
      });
      const selected = suggestedWeaponIndex(next);
      setWeaponIndex(selected);
      setDamage(next.possessions.find((item) => item.index === selected)?.damage ?? 2);
    }).catch((cause) => { if (active) setError(gameplayErrorMessage(cause)); });
    return () => { active = false; };
  }, [campaignId, runtimeRevision]);
  if (!proposal) return error ? <p role="alert">{t(error)}</p> : null;
  const needed = combatReadinessNeeded(proposal);
  if (!needed && !saved) return null;
  const selected = proposal.possessions.find((item) => item.index === weaponIndex);
  const newlyPresent = [proposal.hero, ...proposal.npcs].filter((person) =>
    !proposal.configuration?.presentEntityIds.includes(person.id)).map((person) => person.name);
  const choose = (index: number | null) => {
    setWeaponIndex(index);
    setDamage(proposal.possessions.find((item) => item.index === index)?.damage ?? 2);
    attempt.current = null;
    setSaved(false);
  };
  return (
    <section className="combat-readiness">
      {needed && !saved && <p role="status">{t("Combat readiness needs one review")}</p>}
      <Button onClick={() => setOpen(!open)}>{t(open ? "Close combat review" : "Prepare this campaign for combat")}</Button>
      {open && <form onSubmit={async (event) => {
        event.preventDefault();
        if (guard.current) return;
        guard.current = true;
        setBusy(true);
        setError("");
        const input: CombatReadinessConfirmation = attempt.current ?? {
          requestId: crypto.randomUUID(),
          proposal,
          player: {
            hp: missing(proposal.hero, "hp") ? player.hp : null,
            attack: missing(proposal.hero, "attack") ? player.attack : null,
            defense: missing(proposal.hero, "defense") ? player.defense : null,
            skill: missing(proposal.hero, "skill") ? player.skill : null,
          },
          weaponIndex,
          weaponDamage: selected ? damage : null,
        };
        attempt.current = input;
        try {
          await confirmCombatReadiness(campaignId, input);
          attempt.current = null;
          setSaved(true);
          setOpen(false);
          await onSaved();
          setProposal(await loadCombatReadiness(campaignId));
        } catch (cause) {
          setError(gameplayErrorMessage(cause));
        } finally {
          guard.current = false;
          setBusy(false);
        }
      }}>
        <p className="muted">{t("Review these small Console Basic mechanics. They are house defaults, not facts inferred from the story. Nothing is saved until you approve.")}</p>
        <fieldset disabled={busy} className="persistence-fields">
          <strong>{proposal.hero.name}</strong>
          {stats.map((stat) => <label key={stat}>
            {t(labels[stat])} {missing(proposal.hero, stat)
              ? <><input type="number" required min={stat === "hp" || stat === "defense" ? 1 : -20} max={stat === "hp" ? 10000 : stat === "defense" ? 40 : 20} value={player[stat]} onChange={(event) => {
                setPlayer({ ...player, [stat]: Number(event.target.value) });
                attempt.current = null;
              }} /> {t("proposed; editable")}</>
              : <span>{proposal.hero[stat]} · {t("already saved; preserved")}</span>}
          </label>)}
          {proposal.npcs.map((npc) => <div key={npc.id}>
            <strong>{npc.name}</strong>
            <p className="muted">{t("Visible person · generic house baseline for missing combat values")}</p>
            <ul>{stats.map((stat) => <li key={stat}>{t(labels[stat])}: {npc[stat] ?? genericNpcBaseline[stat]} {npc[stat] === null ? t("proposed") : t("already saved; preserved")}</li>)}</ul>
          </div>)}
          <label>{t("Approved starting weapon")}
            <select value={weaponIndex ?? ""} onChange={(event) => choose(event.target.value ? Number(event.target.value) : null)}>
              <option value="">{t("None; unarmed combat remains available")}</option>
              {proposal.possessions.filter((item) => (item.currentQuantity ?? item.quantity) > 0).map((item) =>
                <option key={item.index} value={item.index}>{item.name}</option>)}
            </select>
          </label>
          {selected && <div>
            <p>{selected.name} · {t("quantity")}: {selected.currentQuantity ?? selected.quantity} · {selected.itemId ? t("existing Inventory item") : t("add from approved creation review")} · {t("equip in hand")}</p>
            {proposal.handItem && proposal.handItem.id !== selected.itemId && <p>{t("Unequip current hand item")}: {proposal.handItem.name}</p>}
            <label>{t("Weapon damage")}
              {selected.damage !== null
                ? <span>{selected.damage} · {t("already saved; preserved")}</span>
                : <input type="number" required min={1} max={20} value={damage} onChange={(event) => { setDamage(Number(event.target.value)); attempt.current = null; }} />}
            </label>
          </div>}
          <p className="muted">{t("Combat profile: Console Basic")}. {newlyPresent.length ? `${t("Add as present")}: ${newlyPresent.join(", ")}.` : t("Present people are already configured.")} {!proposal.configuration?.controlledEntityIds.includes(proposal.hero.id) ? `${t("Add as controlled")}: ${proposal.hero.name}.` : ""} {t("Existing values stay as saved.")}</p>
          {error && <p role="alert">{t(error)} {t("If records changed, refresh Game to load the latest values.")}</p>}
          <Button type="submit" disabled={busy}>{t(busy ? "Saving…" : "Approve combat readiness")}</Button>
        </fieldset>
      </form>}
      {saved && <p role="status">{t("Combat readiness saved. Return to your action in Game.")}</p>}
    </section>
  );
}
