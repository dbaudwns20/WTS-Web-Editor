import { SetStateAction, Dispatch, forwardRef } from "react";

type TranslatorProps = {
  originalText: string | undefined;
  translatedText: string;
  setTranslatedText: Dispatch<SetStateAction<string>>;
};

const Translator = forwardRef((props: TranslatorProps, ref) => {
  const { originalText = "", translatedText = "", setTranslatedText } = props;

  return (
    <>
      <div className="h-full w-full border border-gray-300 bg-gray-100 rounded-lg px-3 relative">
        <header className="pt-3 mb-1.5 text-xs text-gray-400 font-semibold">
          Original Text
        </header>
        <textarea
          className="w-full h-fit text-lg text-gray-500 bg-gray-100 resize-none font-bold"
          readOnly
          contentEditable="true"
          tabIndex={-1}
          value={originalText}
        />
        <footer className="w-full absolute bottom-2 right-0 px-3">
          <div className="flex item-center justify-end">
            <a className="anchor-has-icon undraggable">
              <span className="icon">
                <i className="material-icons-outlined md-18">sticky_note_2</i>
              </span>
              <span>Comment</span>
            </a>
            <a className="anchor-has-icon undraggable">
              <span className="icon">
                <i className="material-icons md-18">content_copy</i>
              </span>
              <span>Copy</span>
            </a>
            <a className="anchor-has-icon undraggable">
              <span className="icon">
                <i className="material-icons-outlined md-18">remove_red_eye</i>
              </span>
              <span>Preview</span>
            </a>
          </div>
        </footer>
      </div>
      <div className="h-full w-full border border-gray-300 rounded-lg px-3 relative">
        <header className="pt-3 mb-1.5 text-xs text-gray-400 font-semibold">
          Translate Text
        </header>
        <textarea
          className="w-full text-lg text-gray-500 resize-none"
          placeholder="Enter your text here..."
          onChange={(e) => setTranslatedText(e.target.value)}
          value={translatedText}
        />
        <footer className="w-full absolute bottom-2 right-0 px-3">
          <div className="flex item-center justify-end">
            <a className="anchor-has-icon undraggable">
              <span className="icon">
                <i className="material-icons-outlined md-18">refresh</i>
              </span>
              <span>Reset</span>
            </a>
            <a className="anchor-has-icon undraggable">
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
