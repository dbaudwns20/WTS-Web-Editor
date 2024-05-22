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

import String from "@/types/string";

export type TranslatorType = {
  setFocus: () => void;
  setDisabled: (val: boolean) => void;
  setHeight: () => void;
};

type TranslatorProps = {
  currentString: String | undefined;
  originalText: string | undefined;
  translatedText: string;
  setTranslatedText: Dispatch<SetStateAction<string>>;
  resetTranslateText: () => void;
  updateString: (isDraft: boolean) => Promise<void>;
};

const Translator = forwardRef((props: TranslatorProps, ref) => {
  const {
    currentString,
    originalText = "",
    translatedText = "",
    setTranslatedText,
    resetTranslateText,
    updateString,
  } = props;

  // refs
  const translatorRef = useRef<HTMLDivElement>(null);
  const originalTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const translateTextAreaRef = useRef<HTMLTextAreaElement>(null);

  // values
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    setFocus,
    setDisabled,
    setHeight,
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

  const copy = () => {
    if (isDisabled) return;
    setTranslatedText(originalText);
    setFocus();
  };

  const saveDraft = async () => {
    await updateString(true);
    setFocus();
  };

  const getFontSize = useCallback((textLength: number): string => {
    let fontSize: string = "text-2xl";
    if (textLength === 0) return fontSize;
    switch (true) {
      case textLength > 60:
        fontSize = "text-lg";
        break;
      case textLength > 30:
        fontSize = "text-xl";
        break;
      default:
        fontSize = "text-2xl";
        break;
    }
    return fontSize;
  }, []);

  const setHeight = useCallback((target: any) => {
    if (!target) {
      setHeight(originalTextAreaRef.current);
      setHeight(translateTextAreaRef.current);
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
    // textarea 높이 조정
    if (originalTextAreaRef.current) {
      // 폰트
      // const fontSize: string = getFontSize(originalText.length);
      // // translateTextAreaRef.current.classList 마지막 클래스를 fontSize 로 교체
      // const classList = originalTextAreaRef.current.classList;
      // classList.remove(classList[classList.length - 1]);
      // classList.add(fontSize);
      setHeight(originalTextAreaRef.current);
    }
  }, [originalText, getFontSize, setHeight]);

  useEffect(() => {
    // textarea 높이 조정
    if (translateTextAreaRef.current) {
      // 폰트
      // const fontSize: string = getFontSize(translatedText.length);
      // // translateTextAreaRef.current.classList 마지막 클래스를 fontSize 로 교체
      // const classList = translateTextAreaRef.current.classList;
      // classList.remove(classList[classList.length - 1]);
      // classList.add(fontSize);
      setHeight(translateTextAreaRef.current);
    }
  }, [translatedText, getFontSize, setHeight]);

  return (
    <>
      <div className="translator is-original-text">
        <header className="translator-header undraggable">Original Text</header>
        <textarea
          ref={originalTextAreaRef}
          className="original-text text-3xl"
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
                onClick={(e) => e.stopPropagation()}
              >
                <span className="icon">
                  <i className="material-icons-outlined md-18">sticky_note_2</i>
                </span>
                <span>Comment</span>
              </a>
            ) : (
              <></>
            )}
            <a
              className="anchor-has-icon undraggable"
              onClick={(e) => {
                e.stopPropagation();
                copy();
              }}
            >
              <span className="icon">
                <i className="material-icons md-18">content_copy</i>
              </span>
              <span>Copy</span>
            </a>
            <a
              className="anchor-has-icon undraggable"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="icon">
                <i className="material-icons-outlined md-18">remove_red_eye</i>
              </span>
              <span>Preview</span>
            </a>
          </div>
        </footer>
      </div>
      <div className="translator" ref={translatorRef} onClick={setFocus}>
        <header className="translator-header undraggable">
          Translate Text
        </header>
        <textarea
          ref={translateTextAreaRef}
          className="translate-text text-3xl"
          placeholder="번역할 내용을 입력하세요"
          spellCheck={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => setTranslatedText(e.target.value)}
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
                className="anchor-has-icon undraggable"
                onClick={(e) => {
                  e.stopPropagation();
                  saveDraft();
                }}
              >
                <span className="icon">
                  <i className="material-icons-outlined md-18">save_as</i>
                </span>
                <span>Save Draft</span>
              </a>
            )}
            <a
              className="anchor-has-icon undraggable"
              onClick={(e) => {
                e.stopPropagation();
                resetTranslateText();
              }}
            >
              <span className="icon">
                <i className="material-icons-outlined md-18">refresh</i>
              </span>
              <span>Reset</span>
            </a>
            <a
              className="anchor-has-icon undraggable"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="icon">
                <i className="material-icons-outlined md-18">remove_red_eye</i>
              </span>
              <span>Preview</span>
            </a>
          </div>
        </footer>
      </div>
    </>
  );
});

Translator.displayName = "Translator";
export default Translator;
