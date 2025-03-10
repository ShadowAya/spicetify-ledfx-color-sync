import React from "react";
import { AnyInputProps } from "./SettingsModal";
import styles from "./SettingsModal.module.scss";
import { titles } from "./SettingsModal";
const cn = Spicetify.classnames;

interface ToggleProps extends AnyInputProps {
  value: boolean;
}

export default function Toggle({ objKey, value, setFn }: ToggleProps) {
  return (
    <div className={styles.toggle}>
      <input
        type="checkbox"
        checked={value === true}
        onChange={(e) => setFn(objKey, e.target.checked)}
      />
      <label>{titles[objKey]}</label>
    </div>
  );
}
