import { forwardRef } from "react";

import { isMacintosh } from "@/utils/validator";

import { useTranslations } from "next-intl";

import "./style.css";

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
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">S</span>
            </div>
            <span className="description">{t("SHORTCUT_1")}</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">D</span>
            </div>
            <span className="description">{t("SHORTCUT_2")}</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">F</span>
            </div>
            <span className="description">{t("SHORTCUT_3")}</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">Q</span>
            </div>
            <span className="description">{t("SHORTCUT_4")}</span>
          </div>
        </div>
        <div className="shortcut-list">
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">
                <i className="material-icons md-18">
                  {isMacintosh() ? `arrow_right` : `arrow_right_alt`}
                </i>
              </span>
            </div>
            <span className="description">{t("SHORTCUT_5")}</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">
                <i
                  className={`material-icons md-18${
                    isMacintosh() ? "" : " rotate-180"
                  }`}
                >
                  {isMacintosh() ? `arrow_left` : `arrow_right_alt`}
                </i>
              </span>
            </div>
            <span className="description">{t("SHORTCUT_6")}</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">R</span>
            </div>
            <span className="description">{t("SHORTCUT_7")}</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">C</span>
            </div>
            <span className="description">{t("SHORTCUT_8")}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

Shortcut.displayName = "Shortcut";
export default Shortcut;
