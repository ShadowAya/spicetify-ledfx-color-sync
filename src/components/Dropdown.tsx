import React from "react";
import { ConfigObj } from "../config/config";
import { AnyInputProps, titles } from "./SettingsModal";
import styles from "./SettingsModal.module.scss";
const cn = Spicetify.classnames;

interface DropdownProps extends AnyInputProps {
  value: string | null;
  originalValue: string | null;
  options: {
    title: string;
    subtitle?: string;
    value: string;
  }[];
  noNull?: boolean;
  label?: string;
}

const isEmptyString = (str: string | null): str is "" => str === "";

export default function Dropdown({
  objKey,
  value,
  originalValue,
  options,
  setFn,
  error,
  noNull,
  label,
}: DropdownProps) {
  const optionsValues = options.map((v) => v.value);

  const set = (key: keyof ConfigObj, value: string | null | "") => {
    if (isEmptyString(value)) {
      if (originalValue && !optionsValues.includes(originalValue))
        setFn(objKey, originalValue);
      else setFn(objKey, null);
      return;
    }
    setFn(key, value);
  };

  return (
    <div className={styles.inputContainer}>
      <label>{label || titles[objKey]}</label>
      {error ? (
        <input
          className={cn(styles.input, "main-dropDown-dropDown")}
          type="text"
          style={{ opacity: 0.6 }}
          value={error}
          disabled
        />
      ) : (
        <select
          className={cn(styles.input, "main-dropDown-dropDown")}
          value={value && optionsValues.includes(value) ? value : ""}
          onChange={(e) => set(objKey, e.target.value)}
        >
          {!noNull && <option value=""></option>}
          {options.map((v) => (
            <option value={v.value}>
              <span>
                {v.title} {v.subtitle && <>({v.subtitle})</>}
              </span>
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
