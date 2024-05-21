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

export type TranslatorType = {
  setFocus: () => void;
  setDisabled: () => void;
};

type TranslatorProps = {
  originalText: string | undefined;
  translatedText: string;
  setTranslatedText: Dispatch<SetStateAction<string>>;
  stringEditorMode: string;
  resetTranslateText: () => void;
};

const Translator = forwardRef((props: TranslatorProps, ref) => {
  const {
    originalText = "",
    translatedText = "",
    setTranslatedText,
    stringEditorMode,
    resetTranslateText,
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
  }));

  const setDisabled = () => {
    setIsDisabled((pre) => !pre);
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

  useEffect(() => {
    if (isDisabled) {
      translateTextAreaRef.current?.classList.add("is-disabled");
    } else {
      translateTextAreaRef.current?.classList.remove("is-disabled");
    }
  }, [isDisabled]);

  useEffect(() => {
    // textarea 높이 조정
    if (originalTextAreaRef.current) {
      // 폰트
      const fontSize: string = getFontSize(originalText.length);
      // translateTextAreaRef.current.classList 마지막 클래스를 fontSize 로 교체
      const classList = originalTextAreaRef.current.classList;
      classList.remove(classList[classList.length - 1]);
      classList.add(fontSize);
      originalTextAreaRef.current!.style.height = "0px";
      originalTextAreaRef.current!.style.height =
        originalTextAreaRef.current!.scrollHeight + "px";
    }
  }, [originalText, getFontSize, stringEditorMode]);

  useEffect(() => {
    // textarea 높이 조정
    if (translateTextAreaRef.current) {
      // 폰트
      const fontSize: string = getFontSize(translatedText.length);
      // translateTextAreaRef.current.classList 마지막 클래스를 fontSize 로 교체
      const classList = translateTextAreaRef.current.classList;
      classList.remove(classList[classList.length - 1]);
      classList.add(fontSize);
      // 초기화
      translateTextAreaRef.current.style.height = "0px";
      // 높이 재조정
      const scrollHeight: number = translateTextAreaRef.current!.scrollHeight;
      translateTextAreaRef.current!.style.height = scrollHeight + "px";
    }
  }, [translatedText, getFontSize, stringEditorMode]);

  return (
    <>
      <div className="translator is-original-text">
        <header className="translator-header">Original Text</header>
        <textarea
          ref={originalTextAreaRef}
          className="original-text text-2xl"
          spellCheck={false}
          readOnly
          tabIndex={-1}
          value={originalText}
          rows={1}
        />
        <footer className="translator-footer">
          <div className="translator-footer-functions">
            <a
              className="anchor-has-icon undraggable"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="icon">
                <i className="material-icons-outlined md-18">sticky_note_2</i>
              </span>
              <span>Comment</span>
            </a>
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
        <header className="translator-header">Translate Text</header>
        <textarea
          ref={translateTextAreaRef}
          className="translate-text text-2xl"
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
            <a
              className="anchor-has-icon undraggable"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="icon">
                <i className="material-icons-outlined md-18">save_as</i>
              </span>
              <span>Save Draft</span>
            </a>
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
