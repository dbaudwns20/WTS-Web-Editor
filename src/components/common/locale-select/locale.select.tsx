"use client";

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { usePathname, useRouter } from "@/navigation";

import "./style.css";

type LocaleSelectProps = {};

const LocaleSelect = forwardRef((props: LocaleSelectProps, ref) => {
  const {} = props;

  const pathname = usePathname();
  const router = useRouter();

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => {});

  // refs
  const localeSelectRef = useRef<HTMLButtonElement>(null);
  const localeSelectListRef = useRef<HTMLUListElement>(null);

  // values
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isOver, setIsOver] = useState<boolean>(false);

  // locale 변경
  const changeLocale = (locale: string) => {
    router.replace(pathname, { locale });
  };

  const closeLocaleSelectOption = useCallback(() => {
    if (!isOver && isExpanded) {
      localeSelectRef.current?.classList.remove("is-expanded");
      localeSelectListRef.current?.classList.remove("is-expanded");
      setIsExpanded(false);
    }
  }, [isOver, isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      localeSelectRef.current?.classList.add("is-expanded");
      localeSelectListRef.current?.classList.add("is-expanded");
    } else {
      localeSelectRef.current?.classList.remove("is-expanded");
      localeSelectListRef.current?.classList.remove("is-expanded");
    }
  }, [isExpanded]);

  useEffect(() => {
    // 전역 클릭 이벤트 설정
    window.addEventListener("click", closeLocaleSelectOption);
    return () => {
      window.removeEventListener("click", closeLocaleSelectOption);
    };
  });

  return (
    <div className="locale-select-wrapper">
      <button
        type="button"
        className="locale-select"
        ref={localeSelectRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
      >
        <span>한국어</span>
        <span className="icon">
          <i className="material-icons">expand_more</i>
        </span>
      </button>
      <ul
        className="locale-select-list"
        ref={localeSelectListRef}
        onMouseOver={() => setIsOver(true)}
        onMouseLeave={() => setIsOver(false)}
      >
        <li>
          <button
            type="button"
            className="locale-select-option is-active"
            onClick={() => changeLocale("ko")}
          >
            <span>한국어</span>
            <span className="icon">
              <i className="material-icons md-18">check</i>
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="locale-select-option"
            onClick={() => changeLocale("en")}
          >
            <span>English</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="locale-select-option"
            onClick={() => setIsExpanded(false)}
          >
            <span>일본어</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="locale-select-option"
            onClick={() => setIsExpanded(false)}
          >
            <span>스페인어</span>
          </button>
        </li>
      </ul>
    </div>
  );
});

LocaleSelect.displayName = "LocaleSelect";
export default LocaleSelect;
