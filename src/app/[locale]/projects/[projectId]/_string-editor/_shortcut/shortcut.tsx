import Image from "next/image";
import { forwardRef } from "react";

import { isMacintosh } from "@/utils/validator";

import { useTranslations } from "next-intl";

import "./style.css";
import MacShift from "@/assets/mac-shift.svg";
import MacCommand from "@/assets/mac-command.svg";

const Shortcut = forwardRef((props: any, ref) => {
  // i18n translate key
  const t = useTranslations(
    "PROJECT_DETAIL.STRING_EDITOR.FUNCTIONS.SHORTCUTS.SHORTCUT_LIST"
  );

  return (
    <div className="shortcut-wrapper">
      <label className="label">{t("LABEL")}</label>
      <div className="shortcut-group">
        <div className="shortcut-list">
          <div className="shortcut">
            <span className="description">{t("SHORTCUT_1")}</span>
            <div className="keyboards">
              {isMacintosh() ? (
                <span className="keyboard is-mac">
                  <Image src={MacCommand} alt="command" />
                </span>
              ) : (
                <span className="keyboard is-win">Ctrl</span>
              )}
              <span className="keyboard">S</span>
            </div>
          </div>
          <div className="shortcut">
            <span className="description">{t("SHORTCUT_2")}</span>
            <div className="keyboards">
              {isMacintosh() ? (
                <span className="keyboard is-mac">
                  <Image src={MacCommand} alt="command" />
                </span>
              ) : (
                <span className="keyboard is-win">Ctrl</span>
              )}
              <span className="keyboard">D</span>
            </div>
          </div>
          <div className="shortcut">
            <span className="description">{t("SHORTCUT_3")}</span>
            <div className="keyboards">
              {isMacintosh() ? (
                <span className="keyboard is-mac">
                  <Image src={MacCommand} alt="command" />
                </span>
              ) : (
                <span className="keyboard is-win">Ctrl</span>
              )}
              <span className="keyboard">F</span>
            </div>
          </div>
          <div className="shortcut">
            <span className="description">{t("SHORTCUT_4")}</span>
            <div className="keyboards">
              {isMacintosh() ? (
                <>
                  <span className="keyboard is-mac">
                    <Image src={MacShift} alt="shift" />
                  </span>
                  <span className="keyboard is-mac">
                    <Image src={MacCommand} alt="command" />
                  </span>
                </>
              ) : (
                <>
                  <span className="keyboard is-win-shift">Shift</span>
                  <span className="keyboard is-win">Ctrl</span>
                </>
              )}
              <span className="keyboard">F</span>
            </div>
          </div>
        </div>
        <div className="shortcut-list">
          <div className="shortcut">
            <span className="description">{t("SHORTCUT_5")}</span>
            <div className="keyboards">
              {isMacintosh() ? (
                <>
                  <span className="keyboard is-mac">
                    <Image src={MacCommand} alt="command" />
                  </span>
                  <span className="keyboard">
                    <i className="material-icons md-18">arrow_left</i>
                  </span>
                  <span className="keyboard">
                    <i className="material-icons md-18">arrow_right</i>
                  </span>
                </>
              ) : (
                <>
                  <span className="keyboard is-win">Ctrl</span>
                  <span className="keyboard">
                    <i className="material-icons md-18 rotate-180">
                      arrow_right_alt
                    </i>
                  </span>
                  <span className="keyboard">
                    <i className="material-icons md-18">arrow_right_alt</i>
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="shortcut">
            <span className="description">{t("SHORTCUT_8")}</span>
            <div className="keyboards">
              {isMacintosh() ? (
                <>
                  <span className="keyboard is-mac">
                    <Image src={MacShift} alt="shift" />
                  </span>
                  <span className="keyboard is-mac">
                    <Image src={MacCommand} alt="command" />
                  </span>
                </>
              ) : (
                <>
                  <span className="keyboard is-win-shift">Shift</span>
                  <span className="keyboard is-win">Ctrl</span>
                </>
              )}
              <span className="keyboard">X</span>
            </div>
          </div>
          <div className="shortcut">
            <span className="description">{t("SHORTCUT_6")}</span>
            <div className="keyboards">
              {isMacintosh() ? (
                <>
                  <span className="keyboard is-mac">
                    <Image src={MacShift} alt="shift" />
                  </span>
                  <span className="keyboard is-mac">
                    <Image src={MacCommand} alt="command" />
                  </span>
                </>
              ) : (
                <>
                  <span className="keyboard is-win-shift">Shift</span>
                  <span className="keyboard is-win">Ctrl</span>
                </>
              )}
              <span className="keyboard">C</span>
            </div>
          </div>
          <div className="shortcut">
            <span className="description">{t("SHORTCUT_7")}</span>
            <div className="keyboards">
              {isMacintosh() ? (
                <>
                  <span className="keyboard is-mac">
                    <Image src={MacShift} alt="shift" />
                  </span>
                  <span className="keyboard is-mac">
                    <Image src={MacCommand} alt="command" />
                  </span>
                </>
              ) : (
                <>
                  <span className="keyboard is-win-shift">Shift</span>
                  <span className="keyboard is-win">Ctrl</span>
                </>
              )}
              <span className="keyboard">E</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Shortcut.displayName = "Shortcut";
export default Shortcut;
