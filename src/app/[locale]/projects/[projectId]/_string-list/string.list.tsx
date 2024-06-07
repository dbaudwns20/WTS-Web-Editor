import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/navigation";

import "./style.css";

import StringSearch from "./_string-search/string.search";

import String, { bindStringList } from "@/types/string";
import { type PageInfo } from "@/types/api.response";

import { callApi } from "@/utils/common";
import {
  showNotificationMessage,
  showConfirmMessage,
  FuncButton,
} from "@/utils/message";
import { PerfectScrollbar } from "@/types/perfect.scrollbar";

const defaultPageInfo: PageInfo = {
  currentPage: 1,
  offset: 10,
  totalCount: 0,
  totalPage: 1,
};

type StringListProps = {
  projectId: string;
  setStringGroup: Dispatch<SetStateAction<(String | null)[]>>;
  isEdited: boolean;
  showStringList: boolean;
  skipCompleted: boolean;
  setStringListKey: Dispatch<SetStateAction<number>>;
  handleUpdateString: (isDraft: boolean) => Promise<void>;
};

type _String = String & { index: number; isActive: boolean };
type Status = "unedited" | "complete" | "inProgress" | "update" | "";

export type StringListType = {
  setStringListScrollPosition: () => void;
  setIsShowSearch: Dispatch<SetStateAction<boolean>>;
  query: string;
  componentElement: HTMLElement;
};

const StringList = forwardRef((props: StringListProps, ref) => {
  const {
    projectId,
    setStringGroup,
    isEdited,
    showStringList,
    skipCompleted,
    setStringListKey,
    handleUpdateString,
  } = props;

  const searchParams = useSearchParams();
  const router = useRouter();

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    setStringListScrollPosition,
    setIsShowSearch,
    query,
    componentElement: stringWrapperRef.current!,
  }));

  // refs
  const stringWrapperRef = useRef<HTMLDivElement>(null);
  const stringListRef = useRef<HTMLDivElement>(null);

  // values
  const [stringList, setStringList] = useState<_String[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentStringNumber: number = searchParams.get("strings")
    ? Number(searchParams.get("strings"))
    : -1;
  const isFirst = useRef(false);

  // 페이징 정보
  const [pageInfo, setPageInfo] = useState<PageInfo>(defaultPageInfo);

  // 검색조건 창 활성화 여부
  const [isShowSearch, setIsShowSearch] = useState<boolean>(false);
  // 키워드
  const [keyword, setKeyword] = useState<string>("");
  // 상태
  const [status, setStatus] = useState<Status>("");
  // 검색 쿼리
  const [query, setQuery] = useState<string>("");
  // 검색조건 적용중 여부
  const [isApplySearch, setIsApplySearch] = useState<boolean>(false);

  let scrollbar = useRef<PerfectScrollbar | null>(null);

  // project 의 string list 조회
  const getStringList = async () => {
    setIsLoading(true);

    let url: string = `/api/projects/${projectId}/strings?offset=${pageInfo.offset}&currentPage=${pageInfo.currentPage}&sort=stringNumber&order=ASC`;
    // 마지막 수정 string number 가 존재할 경우
    if (currentStringNumber !== -1) {
      url += `&lastModifiedStringNumber=${currentStringNumber}`;
    }
    // 자동이동 설정 옵션이 켜져있는 경우
    if (skipCompleted) {
      url += "&skipCompleted=true";
    }
    if (query) {
      url += "&" + query;
    }

    const response = await callApi(url);

    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    setPageInfo(response.pageInfo);
    setStringList(() => {
      let idx: number = 1;
      const result: _String[] = [];
      bindStringList(response.data).forEach((string: String) => {
        result.push({
          ...string,
          ...{
            index: idx,
            isActive: string.stringNumber === currentStringNumber,
          },
        });
        idx++;
      });
      return result;
    });
    setIsLoading(false);
  };

  const getMoreStringList = async () => {
    setIsMoreLoading(true);

    let url: string = `/api/projects/${projectId}/strings?offset=${
      pageInfo.offset
    }&currentPage=${pageInfo.currentPage + 1}&sort=stringNumber&order=ASC`;

    // 자동이동 설정 옵션이 켜져있는 경우
    if (skipCompleted) {
      url += "&skipCompleted=true";
    }
    if (query) {
      url += "&" + query;
    }

    const response = await callApi(url);

    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    setPageInfo(response.pageInfo);
    setStringList(() => {
      const result: _String[] = stringList;
      let idx: number = result[result.length - 1].index + 1;
      bindStringList(response.data).forEach((string: String) => {
        result.push({
          ...string,
          ...{
            index: idx,
            isActive: false,
          },
        });
        idx++;
      });
      return result;
    });

    setIsMoreLoading(false);
  };

  const setStringListScrollPosition = useCallback(() => {
    const node = stringListRef.current;
    if (!node) return;
    const children = node.children;
    let offsetTop: number = 0;
    for (let i = 0; i < children.length; i++) {
      // 마지막인 경우
      if (i === children.length - 1 && currentStringNumber !== -1) {
        offsetTop = node.scrollHeight;
        break;
      }
      const child = children[i] as HTMLElement;
      if (child.classList.contains("is-active")) {
        // 스크롤 위치 계산
        offsetTop = child.offsetHeight * (i - 1);
        break;
      }
    }
    // 최초엔 즉시 이동
    if (isFirst.current) {
      // 부드러운 스크롤 함수 호출
      scrollbar.current?.smoothScroll(node, offsetTop, 300);
    } else {
      isFirst.current = true;
      node.scrollTop = offsetTop;
    }
    // perfect 스크롤바 적용
    if (scrollbar.current?.perfectScrollbar) {
      scrollbar.current.destroy();
      scrollbar.current = null;
    }
    scrollbar.current = new PerfectScrollbar(node);
  }, [currentStringNumber, scrollbar]);

  const handleMove = (string: _String) => {
    // 편집된 상태인 경우
    if (isEdited) {
      const buttons: FuncButton[] = [
        {
          label: "Ignore",
          class: "default",
          onClick: () => replaceCurrentString(string),
        },
        {
          label: "Save Draft",
          class: "warning",
          onClick: async () => {
            await handleUpdateString(true);
            replaceCurrentString(string);
          },
        },
        {
          label: "Complete",
          class: "success",
          onClick: async () => {
            await handleUpdateString(false);
            replaceCurrentString(string);
          },
        },
      ];

      // 완료 여부로 임시저장 버튼 제거
      if (stringList[currentIndex - 1].completedAt) {
        buttons.splice(1, 1);
      }

      showConfirmMessage({
        title: "Warning",
        message: "Changes exist. Would you like to save?",
        buttons: buttons,
      });
    } else {
      replaceCurrentString(string);
    }
  };

  const replaceCurrentString = useCallback(
    (string: _String) => {
      if (!string) return;
      setCurrentIndex(string.index);
      router.replace(`/projects/${projectId}?strings=${string.stringNumber}`);
    },
    [projectId, router]
  );

  // 스크롤이 맨 밑으로 갈 경우 추가 데이터 로딩
  useEffect(() => {
    const node = stringListRef.current;
    if (!node) return;

    const handleScroll = () => {
      const scrollHeight = node.scrollHeight;
      const scrollTop = node.scrollTop;
      const clientHeight = node.clientHeight;

      if (
        scrollTop + clientHeight >= scrollHeight &&
        pageInfo.currentPage < pageInfo.totalPage &&
        !isMoreLoading
      ) {
        getMoreStringList();
      }
    };

    node.addEventListener("scroll", handleScroll);
    return () => {
      node.removeEventListener("scroll", handleScroll);
    };
  });

  const setGroupAndGetCurrent = useCallback((): _String => {
    let stringGroup: (_String | null)[] = [null, stringList[0] ?? null, null];

    if (stringList.length <= 1) {
      setStringGroup(stringGroup);
      return stringList[0];
    }

    const findNextIncomplete = (
      startIndex: number,
      direction: 1 | -1
    ): _String | null => {
      let result: _String | null = null;
      for (
        let i = startIndex;
        i >= 0 && i < stringList.length;
        i += direction
      ) {
        if (!stringList[i].completedAt) {
          result = stringList[i];
          break;
        }
      }
      return result;
    };

    if (skipCompleted) {
      if (currentStringNumber === -1) {
        stringGroup[2] = findNextIncomplete(1, 1);
      } else {
        const currentStringIndex: number = stringList.findIndex(
          (string) => string.stringNumber === currentStringNumber
        );
        if (currentStringIndex !== -1) {
          stringGroup[0] = findNextIncomplete(currentStringIndex - 1, -1);
          stringGroup[1] = stringList[currentStringIndex];
          stringGroup[2] = findNextIncomplete(currentStringIndex + 1, 1);
        }
      }
    } else {
      if (currentStringNumber === -1) {
        stringGroup[2] = stringList[1];
      } else {
        const currentStringIndex: number = stringList.findIndex(
          (string) => string.stringNumber === currentStringNumber
        );
        if (currentStringIndex !== -1) {
          stringGroup = [
            stringList[currentStringIndex - 1] ?? null,
            stringList[currentStringIndex],
            stringList[currentStringIndex + 1] ?? null,
          ];
        }
      }
    }
    // set stringGroup
    setStringGroup(stringGroup);
    // return string
    return stringGroup[1]!;
  }, [stringList, currentStringNumber, skipCompleted, setStringGroup]);

  useEffect(() => {
    // string group 정의
    const string: _String = setGroupAndGetCurrent();
    // string 설정
    replaceCurrentString(string);
    // 스크롤 위치 조정
    setStringListScrollPosition();
  }, [
    setGroupAndGetCurrent,
    replaceCurrentString,
    setStringListScrollPosition,
  ]);

  useEffect(() => {
    // 추가 조회 시 StringGroup 다시 설정
    setGroupAndGetCurrent();
  }, [isMoreLoading, setGroupAndGetCurrent]);

  useEffect(() => {
    // string list 숨김여부
    if (showStringList) {
      stringWrapperRef.current?.classList.remove("is-hide");
      // string list 보이기 후 스크롤 위치 이동
      setStringListScrollPosition();
    } else {
      stringWrapperRef.current?.classList.add("is-hide");
    }
  }, [showStringList, setStringListScrollPosition]);

  // query 변경 시 스트링 리스트 조회
  useEffect(() => {
    getStringList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="string-list-wrapper" ref={stringWrapperRef}>
      <>
        <header className="string-list-header">
          {pageInfo.totalCount === 0 ? (
            <>{isLoading ? <span>Loading...</span> : <span>No Result</span>}</>
          ) : (
            <span>{currentIndex + " / " + pageInfo.totalCount}</span>
          )}
          <div className="button-group">
            {isApplySearch ? (
              <button
                type="button"
                className="string-search-button has-tooltip has-arrow"
                data-tooltip="검색조건 초기화"
                onClick={() => setStringListKey((prev) => prev + 1)}
              >
                <span className="icon">
                  <i className="material-icons-outlined md-18">refresh</i>
                </span>
              </button>
            ) : (
              <></>
            )}
            <button
              type="button"
              className="string-search-button has-tooltip has-arrow"
              data-tooltip={isShowSearch ? "검색 닫기" : "검색 열기"}
              onClick={() => setIsShowSearch(!isShowSearch)}
            >
              <span className="icon">
                <i className="material-icons-outlined md-18">
                  {isShowSearch ? "close" : "search"}
                </i>
              </span>
            </button>
          </div>
        </header>
        {isLoading ? (
          <div className="is-loading">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : (
          <>
            <StringSearch
              keyword={keyword}
              setKeyword={setKeyword}
              status={status}
              setStatus={setStatus}
              isShowSearch={isShowSearch}
              setIsShowSearch={setIsShowSearch}
              query={query}
              setQuery={setQuery}
              setIsApplySearch={setIsApplySearch}
              setPageInfo={setPageInfo}
            />
            <div className="string-list" ref={stringListRef}>
              {stringList.map((string: _String) => {
                const isActive: boolean =
                  string.stringNumber === currentStringNumber;
                return (
                  <article
                    onClick={() => handleMove(string)}
                    key={string.index}
                    className={isActive ? "string is-active" : "string"}
                  >
                    <p className="number">
                      <span>STRING {string.stringNumber}</span>
                      {(() => {
                        if (!string.completedAt && !string.updatedAt) {
                          return <></>;
                        }
                        if (string.completedAt) {
                          if (string.completedAt >= string.updatedAt!) {
                            return <span className="complete">COMPLETE</span>;
                          }
                          return <span className="update">UPDATE</span>;
                        }
                        if (
                          string.updatedAt &&
                          string.updatedAt > string.createdAt
                        ) {
                          return (
                            <span className="in-progress">IN PROGRESS</span>
                          );
                        }
                        return <></>;
                      })()}
                    </p>
                    <p className="content">
                      {string.completedAt
                        ? string.translatedText
                        : string.originalText}
                    </p>
                    {string.comment ? (
                      <span className="icon">
                        <i className="material-icons-outlined md-18">
                          sticky_note_2
                        </i>
                      </span>
                    ) : (
                      <></>
                    )}
                  </article>
                );
              })}
              {isMoreLoading ? (
                <div className="is-more-loading">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              ) : (
                <></>
              )}
            </div>
          </>
        )}
      </>
    </div>
  );
});

StringList.displayName = "StringList";
export default StringList;
