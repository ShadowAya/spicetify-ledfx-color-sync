import React from "react";
import { AnyInputProps } from "./SettingsModal";
import styles from "./SettingsModal.module.scss";
import { titles } from "./SettingsModal";
const cn = Spicetify.classnames;

interface FieldProps extends AnyInputProps {
  value: string | null;
}

export default function Field({ objKey, value, setFn, error }: FieldProps) {
  return (
    <div className={styles.inputContainer}>
      <label>{titles[objKey]}</label>
      <input
        className={cn(styles.input, styles.field, "main-dropDown-dropDown")}
        type="text"
        value={error ?? value ?? ""}
        onChange={(e) => setFn(objKey, e.target.value)}
      />
    </div>
  );
}

interface SimpleFieldProps {
  label: string;
  value: string | null;
  setValue: (value: string) => void;
}

export function SimpleField({ value, label, setValue }: SimpleFieldProps) {
  return (
    <div className={styles.inputContainer}>
      <label>{label}</label>
      <input
        className={cn(styles.input, styles.field, "main-dropDown-dropDown")}
        type="text"
        value={value ?? ""}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

interface StaticFieldProps {
  label: string;
  value: string | null;
}

export function StaticField({ value, label }: StaticFieldProps) {
  return (
    <div className={styles.inputContainer}>
      <label>{label}</label>
      <input
        className={cn(
          styles.input,
          styles.field,
          styles.staticField,
          "main-dropDown-dropDown"
        )}
        type="text"
        value={value ?? ""}
        readOnly
      />
    </div>
  );
}
