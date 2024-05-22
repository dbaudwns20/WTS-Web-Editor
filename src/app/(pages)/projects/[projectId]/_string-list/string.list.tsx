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
import { useRouter, useSearchParams } from "next/navigation";

import "./style.css";

import String, { bindStringList } from "@/types/string";
import { type PageInfo } from "@/types/pagination";

import { callApi } from "@/utils/common";
import {
  showNotificationMessage,
  showConfirmMessage,
  FuncButton,
} from "@/utils/message";

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
  handleUpdateString: (isDraft: boolean) => Promise<void>;
};

type _String = String & { index: number; isActive: boolean };

export type StringListType = {
  setStringListScrollPosition: () => void;
  componentElement: HTMLElement;
};

const StringList = forwardRef((props: StringListProps, ref) => {
  const {
    projectId,
    setStringGroup,
    isEdited,
    showStringList,
    skipCompleted,
    handleUpdateString,
  } = props;

  const searchParams = useSearchParams();
  const router = useRouter();

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    setStringListScrollPosition,
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

    const response = await callApi(
      `/api/projects/${projectId}/strings?offset=${
        pageInfo.offset
      }&currentPage=${pageInfo.currentPage + 1}&sort=stringNumber&order=ASC`
    );

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
    const options = { top: offsetTop };
    // 최초엔 즉시 이동
    if (isFirst.current) {
      Object.assign(options, { behavior: "smooth" });
    } else {
      isFirst.current = true;
    }
    node.scrollTo(options);
  }, [currentStringNumber]);

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
    let stringGroup: (_String | null)[] = [null, stringList[0], null];

    if (stringList.length <= 1) return stringList[0];

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
    if (stringList.length === 0) return;
    // string group 정의
    const string: _String = setGroupAndGetCurrent();
    // string 설정
    replaceCurrentString(string);
    // 스크롤 위치 조정
    setStringListScrollPosition();
  }, [
    stringList,
    setGroupAndGetCurrent,
    replaceCurrentString,
    setStringListScrollPosition,
  ]);

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

  // mount 시 스트링 리스트 조회
  useEffect(() => {
    getStringList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="string-list-wrapper" ref={stringWrapperRef}>
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
          <header className="string-list-header">
            <span>{currentIndex + " / " + pageInfo.totalCount}</span>
          </header>
          <div className="string-list" ref={stringListRef}>
            {stringList.map((string: _String) => {
              const isActive: boolean =
                string.stringNumber === currentStringNumber;
              return (
                <a
                  onClick={() => handleMove(string)}
                  key={string.index}
                  className={isActive ? "string is-active" : "string"}
                >
                  <p className="number">
                    <span>STRING {string.stringNumber}</span>
                    {(() => {
                      if (!string.completedAt && !string.updatedAt) {
                        return <></>;
                      } else if (string.completedAt) {
                        if (string.completedAt >= string.updatedAt!) {
                          return <span className="complete">COMPLETE</span>;
                        } else {
                          return <span className="update">UPDATE</span>;
                        }
                      } else if (string.updatedAt) {
                        if (string.updatedAt > string.createdAt) {
                          return (
                            <span className="in-progress">IN PROGRESS</span>
                          );
                        }
                      }
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
                </a>
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
    </div>
  );
});

StringList.displayName = "StringList";
export default StringList;
