"use client";

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";

import { getPageLocaleList } from "@/types/locale";

import "./style.css";

type LocaleSelectProps = {};

const LocaleSelect = forwardRef((props: LocaleSelectProps, ref) => {
  const {} = props;

  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const searchParams = useSearchParams();

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => {});

  // refs
  const localeSelectRef = useRef<HTMLButtonElement>(null);
  const localeSelectListRef = useRef<HTMLUListElement>(null);

  // values
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isOver, setIsOver] = useState<boolean>(false);

  const localeList = () => {
    return getPageLocaleList().map((locale) => ({
      ...locale,
      isActive: locale.locale === currentLocale,
    }));
  };

  // locale 변경
  const changeLocale = (locale: string) => {
    let url: string = pathname;
    // strings param 이 존재하면 붙이기
    if (searchParams.has("strings")) {
      url += `?${searchParams.toString()}`;
    }
    router.replace(url, { locale });
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

  useEffect(() => {
    // 쿠키에 저장된 언어 와 현재 언어가 다른 경우
    // 쿠키에 저장된 언어로 반영한다
    const NEXT_LOCALE = document.cookie?.split("=")[1];
    if (NEXT_LOCALE && NEXT_LOCALE !== currentLocale) {
      router.replace(pathname, { locale: NEXT_LOCALE });
    }
  }, [currentLocale, router, pathname]);

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
        <span>{localeList().find((locale) => locale.isActive)?.text}</span>
        <span className="icon">
          <i className="material-icons md-18">language</i>
        </span>
      </button>
      <ul
        className="locale-select-list"
        ref={localeSelectListRef}
        onMouseOver={() => setIsOver(true)}
        onMouseLeave={() => setIsOver(false)}
      >
        {localeList().map((locale) => (
          <li key={locale.locale}>
            <button
              type="button"
              className={`locale-select-option ${
                locale.isActive ? "is-active" : ""
              }`}
              onClick={() => changeLocale(locale.locale)}
            >
              <span>{locale.text}</span>
              {locale.isActive && (
                <span className="icon">
                  <i className="material-icons md-18">check</i>
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});

LocaleSelect.displayName = "LocaleSelect";
export default LocaleSelect;
