import type { ReactNode } from "react";
import { Button } from "../ui";
import styles from "./foundation-loop.module.css";

export function TextField({
  label,
  value,
  onChange,
  maxLength = 120,
  pattern,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  pattern?: string;
}) {
  return (
    <label className="field">
      {label}
      <input
        required
        value={value}
        maxLength={maxLength}
        pattern={pattern}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function NumberField({
  label,
  value,
  onChange,
  max = 1_000_000,
  min = 0,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  step?: number;
}) {
  return (
    <label className="field">
      {label}
      <input
        required
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) =>
          onChange(e.target.value === "" ? NaN : Number(e.target.value))
        }
      />
    </label>
  );
}
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  required = true,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      {label}
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((row) => (
          <option key={row.id} value={row.id}>
            {row.label}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
export function RowEditor({
  title,
  remove,
  children,
}: {
  title: string;
  remove?: { label: string; action: () => void };
  children: ReactNode;
}) {
  return (
    <details className={styles.editor}>
      <summary>{title}</summary>
      <div className={styles.editorBody}>
        {children}
        {remove && (
          <Button onClick={remove.action} label={`${remove.label}: ${title}`}>
            {remove.label}
          </Button>
        )}
      </div>
    </details>
  );
}
