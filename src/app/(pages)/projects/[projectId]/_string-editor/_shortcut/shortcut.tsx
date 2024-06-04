import { forwardRef } from "react";

import { isMacintosh } from "@/utils/validator";

import "./style.css";

const Shortcut = forwardRef((props: any, ref) => {
  return (
    <div className="shortcut-wrapper">
      <label className="label">Shortcut Keys</label>
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
            <span className="description">저장</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">D</span>
            </div>
            <span className="description">임시 저장</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">F</span>
            </div>
            <span className="description">검색 열기 / 닫기</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">Q</span>
            </div>
            <span className="description">검색 조건 초기화</span>
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
            <span className="description">다음 String 으로 이동</span>
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
            <span className="description">이전 String 으로 이동</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">R</span>
            </div>
            <span className="description">초기화</span>
          </div>
          <div className="shortcut">
            <div className="keyboards">
              <span
                className={isMacintosh() ? `keyboard option` : `keyboard alt`}
              />
              <p className="plus" />
              <span className="keyboard">C</span>
            </div>
            <span className="description">동기화</span>
          </div>
        </div>
      </div>
    </div>
  );
});

Shortcut.displayName = "Shortcut";
export default Shortcut;
