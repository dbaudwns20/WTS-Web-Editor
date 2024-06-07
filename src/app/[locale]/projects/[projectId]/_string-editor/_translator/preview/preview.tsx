import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  Dispatch,
  MouseEvent,
} from "react";

import "./style.css";

import {
  type PreviewState,
  type PreviewAction,
} from "@/reducers/preview.reducer";

import { parseToHtml } from "@/utils/wts";

type PreviewProps = {
  text: string;
  fontSizeClass: string;
  isOriginal: boolean;
  previewState: PreviewState;
  previewDispatch: Dispatch<PreviewAction>;
};

const Preview = forwardRef((props: PreviewProps, ref) => {
  const { text, fontSizeClass, isOriginal, previewState, previewDispatch } =
    props;

  // refs
  const previewRef = useRef<HTMLDivElement>(null);

  // values
  const [parseText, setParseText] = useState<string>("");

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    previewDispatch({
      type: isOriginal ? "original" : "translate",
      payload: isOriginal ? !previewState.original : !previewState.translate,
    });
  };

  useEffect(() => {
    setParseText(parseToHtml(text));
  }, [text]);

  return (
    <>
      <header className="preview-header undraggable">Preview Mode</header>
      <div
        ref={previewRef}
        className={`preview ${fontSizeClass}`}
        dangerouslySetInnerHTML={{ __html: parseText }}
      />
      <footer className="preview-footer">
        <div className="preview-footer-functions">
          <a className="anchor-has-icon undraggable" onClick={handleClick}>
            <span className="icon">
              <i className="material-icons-outlined md-18">visibility_off</i>
            </span>
            <span>Exit Preview</span>
          </a>
        </div>
      </footer>
    </>
  );
});

Preview.displayName = "Preview";
export default Preview;
