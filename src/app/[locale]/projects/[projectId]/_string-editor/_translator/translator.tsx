import {
  SetStateAction,
  Dispatch,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
  useState,
} from "react";

import "./style.css";

import Preview from "./preview/preview";

import String from "@/types/string";

import {
  type PreviewState,
  type PreviewAction,
} from "@/reducers/preview.reducer";

import { showNotificationMessage } from "@/utils/message";
import { isMacintosh } from "@/utils/validator";

import { useTranslations } from "next-intl";

export type TranslatorType = {
  setFocus: () => void;
  setDisabled: (val: boolean) => void;
  setHeight: () => void;
  sync: () => void;
  copy: () => void;
};

type TranslatorProps = {
  currentString: String | undefined;
  originalText: string | undefined;
  translatedText: string;
  setTranslatedText: Dispatch<SetStateAction<string>>;
  resetTranslateText: () => void;
  previewState: PreviewState;
  previewDispatch: Dispatch<PreviewAction>;
  updateString: (isDraft: boolean) => Promise<void>;
  translateByAi: () => Promise<void>;
};

const Translator = forwardRef((props: TranslatorProps, ref) => {
  const {
    currentString,
    originalText = "",
    translatedText = "",
    setTranslatedText,
    resetTranslateText,
    previewState,
    previewDispatch,
    updateString,
    translateByAi,
  } = props;

  // i18n translate key
  const t = useTranslations("PROJECT_DETAIL.STRING_EDITOR.TRANSLATOR");

  // refs
  const translatorRef = useRef<HTMLDivElement>(null);
  const translatorOriginRef = useRef<HTMLDivElement>(null);
  const originalTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const translateTextAreaRef = useRef<HTMLTextAreaElement>(null);

  // values
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [showComment, setShowComment] = useState<boolean>(false);

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    setFocus,
    setDisabled,
    setHeight,
    sync,
    copy,
  }));

  const setDisabled = (val: boolean) => {
    setIsDisabled(val);
  };

  const setFocus = () => {
    if (isDisabled) return;
    translateTextAreaRef.current?.focus();
    handleFocus();
  };

  const handleFocus = () => {
    translatorRef.current?.classList.add("is-focused");
  };

  const handleBlur = () => {
    translatorRef.current?.classList.remove("is-focused");
  };

  // 복사
  const copy = async () => {
    await window.navigator.clipboard.writeText(originalText);
    showNotificationMessage({
      message: t("COPY_MESSAGE"),
      messageType: "info",
      position: "right",
      timeout: 1500,
    });
  };

  // 동기화
  const sync = () => {
    if (isDisabled || previewState.original) return;
    setTranslatedText(originalText);
    setFocus();
  };

  // 임시저장
  const saveDraft = async () => {
    await updateString(true);
    setFocus();
  };

  const doUseAi = async () => {
    await translateByAi();
    setFocus();
  };

  const getFontSizeClass = useCallback((textLength: number): string => {
    let fontSize: string = "text-3xl";
    if (textLength === 0) return fontSize;
    switch (true) {
      case textLength > 76:
        fontSize = "text-lg";
        break;
      case textLength > 51:
        fontSize = "text-xl";
        break;
      case textLength > 26:
        fontSize = "text-2xl";
        break;
      default:
        fontSize = "text-3xl";
        break;
    }
    return fontSize;
  }, []);

  const setHeight = useCallback((target: any) => {
    if (!target) {
      if (originalTextAreaRef.current) setHeight(originalTextAreaRef.current);
      if (translateTextAreaRef.current) setHeight(translateTextAreaRef.current);
    } else {
      target.style.height = "0px";
      const scrollHeight: number = target.scrollHeight;
      target.style.height = scrollHeight + "px";
    }
  }, []);

  useEffect(() => {
    if (isDisabled) {
      translatorRef.current?.classList.add("is-disabled");
    } else {
      translatorRef.current?.classList.remove("is-disabled");
    }
  }, [isDisabled]);

  useEffect(() => {
    if (originalTextAreaRef.current) {
      // textarea 높이 조정
      setHeight(originalTextAreaRef.current);
      // String 이 갱신될때 주석 숨기기
      setShowComment(false);
    }
  }, [originalText, setHeight]);

  useEffect(() => {
    if (translateTextAreaRef.current) {
      // textarea 높이 조정
      setHeight(translateTextAreaRef.current);
    }
  }, [translatedText, setHeight]);

  useEffect(() => {
    if (!previewState.translate) {
      setHeight(translateTextAreaRef.current);
      translatorRef.current?.classList.remove("is-preview");
    } else {
      translatorRef.current?.classList.add("is-preview");
    }
    if (!previewState.original) {
      setHeight(originalTextAreaRef.current);
      translatorOriginRef.current?.classList.remove("is-preview");
    } else {
      translatorOriginRef.current?.classList.add("is-preview");
    }
  }, [previewState, setHeight]);

  return (
    <>
      <div className="translator is-original-text" ref={translatorOriginRef}>
        {previewState.original ? (
          <Preview
            text={originalText}
            fontSizeClass={(() => getFontSizeClass(originalText.length))()}
            isOriginal={true}
            previewState={previewState}
            previewDispatch={previewDispatch}
          />
        ) : (
          <>
            <header className="translator-header undraggable">
              {t("ORIGINAL_TEXT")}
            </header>
            <textarea
              ref={originalTextAreaRef}
              className={`original-text ${getFontSizeClass(
                originalText.length
              )}`}
              spellCheck={false}
              readOnly
              tabIndex={-1}
              value={originalText}
              rows={1}
            />
            <footer className="translator-footer">
              <div className="translator-footer-functions">
                {currentString?.comment ? (
                  <a
                    className="anchor-has-icon undraggable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowComment(!showComment);
                    }}
                  >
                    <span className="icon">
                      <i className="material-icons-outlined md-18">
                        sticky_note_2
                      </i>
                    </span>
                    <span>{t("COMMENT")}</span>
                  </a>
                ) : (
                  <></>
                )}
                <a
                  className="anchor-has-icon undraggable"
                  onClick={(e) => {
                    e.stopPropagation();
                    doUseAi();
                  }}
                >
                  <span className="icon">
                    <i className="material-icons-outlined md-18 mr-1">
                      translate
                    </i>
                  </span>
                  <span>{t("AI_TRANSLATE")}</span>
                </a>
                <a
                  className="anchor-has-icon undraggable has-tooltip has-arrow"
                  data-tooltip={
                    isMacintosh() ? "⇧ + ⌘ + X" : "Shift + Ctrl + X"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    sync();
                  }}
                >
                  <span className="icon">
                    <i className="material-icons md-18">sync</i>
                  </span>
                  <span>{t("SYNC")}</span>
                </a>
                <a
                  className="anchor-has-icon undraggable has-tooltip has-arrow"
                  data-tooltip={
                    isMacintosh() ? "⇧ + ⌘ + C" : "Shift + Ctrl + C"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    copy();
                  }}
                >
                  <span className="icon">
                    <i className="material-icons md-18">content_copy</i>
                  </span>
                  <span>{t("COPY")}</span>
                </a>
                <a
                  className="anchor-has-icon undraggable"
                  onClick={(e) => {
                    e.stopPropagation();
                    previewDispatch({
                      type: "original",
                      payload: !previewState.original,
                    });
                  }}
                >
                  <span className="icon">
                    <i className="material-icons-outlined md-18">
                      remove_red_eye
                    </i>
                  </span>
                  <span>{t("PREVIEW")}</span>
                </a>
              </div>
            </footer>
            {showComment ? (
              <div className="comment">
                <header className="header">
                  <label className="label">{t("COMMENT")}</label>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setShowComment(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </header>
                <p className="content">{currentString?.comment}</p>
              </div>
            ) : (
              <></>
            )}
          </>
        )}
      </div>
      <div className="translator" ref={translatorRef} onClick={setFocus}>
        {previewState.translate ? (
          <Preview
            text={translatedText}
            fontSizeClass={(() => getFontSizeClass(translatedText.length))()}
            isOriginal={false}
            previewState={previewState}
            previewDispatch={previewDispatch}
          />
        ) : (
          <>
            <header className="translator-header undraggable">
              {t("TRANSLATE_TEXT")}
            </header>
            <textarea
              ref={translateTextAreaRef}
              className={`translate-text ${getFontSizeClass(
                translatedText.length
              )}`}
              placeholder={t("PLACEHOLDER")}
              spellCheck={false}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e: any) => setTranslatedText(e.target.value)}
              value={translatedText}
              maxLength={1000}
              rows={1}
              disabled={isDisabled}
            />
            <footer className="translator-footer">
              <div className="translator-footer-functions">
                {currentString?.completedAt ? (
                  <></>
                ) : (
                  <a
                    className="anchor-has-icon undraggable has-tooltip has-arrow"
                    data-tooltip={isMacintosh() ? "⌘ + D" : "Ctrl + D"}
                    onClick={(e) => {
                      e.stopPropagation();
                      saveDraft();
                    }}
                  >
                    <span className="icon">
                      <i className="material-icons-outlined md-18">save_as</i>
                    </span>
                    <span>{t("SAVE_DRAFT")}</span>
                  </a>
                )}
                <a
                  className="anchor-has-icon undraggable has-tooltip has-arrow"
                  data-tooltip={
                    isMacintosh() ? "⇧ + ⌘ + E" : "Shift + Ctrl + E"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    resetTranslateText();
                  }}
                >
                  <span className="icon">
                    <i className="material-icons-outlined md-18">refresh</i>
                  </span>
                  <span>{t("RESET")}</span>
                </a>
                <a
                  className="anchor-has-icon undraggable"
                  onClick={(e) => {
                    e.stopPropagation();
                    previewDispatch({
                      type: "translate",
                      payload: !previewState.translate,
                    });
                  }}
                >
                  <span className="icon">
                    <i className="material-icons-outlined md-18">
                      remove_red_eye
                    </i>
                  </span>
                  <span>{t("PREVIEW")}</span>
                </a>
              </div>
            </footer>
          </>
        )}
      </div>
    </>
  );
});

Translator.displayName = "Translator";
export default Translator;
