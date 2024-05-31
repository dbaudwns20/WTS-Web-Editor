import {
  forwardRef,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent,
  Dispatch,
  SetStateAction,
} from "react";

import "./style.css";

import Text, { type TextType } from "@/components/input/text/text";
import Submit, { type SubmitType } from "@/components/button/submit";

import { type PageInfo } from "@/types/api.response";

import { showNotificationMessage } from "@/utils/message";

type Status = "none" | "complete" | "inProgress" | "update" | "";

type StringSearchProps = {
  keyword: string;
  setKeyword: Dispatch<SetStateAction<string>>;
  status: Status;
  setStatus: Dispatch<SetStateAction<Status>>;
  isShowSearch: boolean;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  setIsShowSearch: Dispatch<SetStateAction<boolean>>;
  setIsApplySearch: Dispatch<SetStateAction<boolean>>;
  setPageInfo: Dispatch<SetStateAction<PageInfo>>;
};

const StringSearch = forwardRef((props: StringSearchProps, ref) => {
  const {
    keyword,
    setKeyword,
    status,
    setStatus,
    query,
    setQuery,
    isShowSearch,
    setIsShowSearch,
    setIsApplySearch,
    setPageInfo,
  } = props;

  // refs
  const stringSearchWrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<TextType>();
  const submitRef = useRef<SubmitType>();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    status === value ? setStatus("") : setStatus(value as Status);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 키워드와 상태 둘 다 없는 경우 경고 메시지 표시
    if (!status && !keyword) {
      showNotificationMessage({
        message: "Please enter your keyword or status.",
        messageType: "warning",
      });
      focusKeyword();
      return;
    }

    // 검색창 숨기기 및 검색 적용 상태 설정
    setIsShowSearch(false);
    setIsApplySearch(true);

    // 쿼리 문자열 구성
    const newQuery = [];
    if (keyword) newQuery.push(`keyword=${keyword}`);
    if (status) newQuery.push(`status=${status}`);

    const strQuery: string = newQuery.join("&");

    // 쿼리 문자열이 있을 경우 페이지 정보 초기화 및 쿼리 설정
    if (strQuery.length > 0 && strQuery !== query) {
      setPageInfo({ currentPage: 1, offset: 10, totalCount: 0, totalPage: 1 });
      setQuery(strQuery);
    }
  };

  const focusKeyword = () => {
    searchRef?.current?.setFocus();
  };

  useEffect(() => {
    if (isShowSearch) {
      stringSearchWrapperRef?.current?.classList.add("is-active");
      focusKeyword();
    } else {
      stringSearchWrapperRef?.current?.classList.remove("is-active");
    }
  }, [isShowSearch]);

  return (
    <div className="string-search-wrapper" ref={stringSearchWrapperRef}>
      <form className="string-search" onSubmit={handleSubmit} noValidate>
        <div className="block">
          <Text
            ref={searchRef}
            value={keyword}
            labelText="KEYWORD"
            placeholder="keyword"
            invalidMsg="Please enter your keyword."
            onChange={setKeyword}
          />
        </div>
        <div className="block">
          <label className="label">STATUS</label>
          <div className="string-status-group">
            <div className="string-status">
              <input
                type="checkbox"
                id="none"
                value="none"
                checked={status === "none"}
                onChange={handleChange}
              />
              <label htmlFor="none">NONE</label>
            </div>
            <div className="string-status is-completed">
              <input
                type="checkbox"
                id="complete"
                value="complete"
                checked={status === "complete"}
                onChange={handleChange}
              />
              <label htmlFor="complete">COMPLETE</label>
            </div>
            <div className="string-status is-progress">
              <input
                type="checkbox"
                id="inProgress"
                value="inProgress"
                checked={status === "inProgress"}
                onChange={handleChange}
              />
              <label htmlFor="inProgress">IN PROGRESS</label>
            </div>
            <div className="string-status is-updated">
              <input
                type="checkbox"
                id="update"
                value="update"
                checked={status === "update"}
                onChange={handleChange}
              />
              <label htmlFor="update">UPDATE</label>
            </div>
          </div>
        </div>
        <div className="block">
          <Submit
            ref={submitRef}
            buttonText="SEARCH"
            buttonClass="button is-info"
          />
        </div>
      </form>
    </div>
  );
});

StringSearch.displayName = "StringSearch";
export default StringSearch;
