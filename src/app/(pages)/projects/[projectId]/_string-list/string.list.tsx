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
import { showNotificationMessage, showConfirmMessage } from "@/utils/message";

const defaultPageInfo: PageInfo = {
  offset: 10,
  currentPage: 1,
  totalPage: 1,
  totalCount: 0,
};

type StringListProps = {
  projectId: string;
  setStringGroup: Dispatch<SetStateAction<(String | null)[]>>;
  isEdited: boolean;
};

type _String = String & { index: number; isActive: boolean };

export type StringListType = {
  getStringList: () => void;
};

const StringList = forwardRef((props: StringListProps, ref) => {
  const { projectId, setStringGroup, isEdited } = props;

  const searchParams = useSearchParams();
  const router = useRouter();

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    getStringList,
  }));

  // refs
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

  const handleMove = (stringGroup: (_String | null)[]) => {
    // 편집된 상태인 경우
    if (isEdited) {
      showConfirmMessage({
        title: "Warning",
        message: "Changes exist. Would you like to save?",
        buttons: [
          {
            label: "Ignore",
            class: "default",
            onClick: () => replaceCurrentString(stringGroup),
          },
          {
            label: "Save",
            class: "success",
            onClick: () => {
              const form: HTMLFormElement = document.querySelector(
                ".string-editor-form"
              )!;
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
              replaceCurrentString(stringGroup);
            },
          },
        ],
      });
    } else {
      replaceCurrentString(stringGroup);
    }
  };

  const replaceCurrentString = useCallback(
    (stringGroup: (_String | null)[]) => {
      if (!stringGroup[1]) return;
      const string: _String = stringGroup[1];
      setStringGroup(stringGroup);
      setCurrentIndex(string.index);
      router.replace(`/projects/${projectId}?strings=${string.stringNumber}`);
    },
    [projectId, router, setStringGroup]
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

  const defineStringGroup = useCallback((): (_String | null)[] => {
    let stringGroup: (_String | null)[] = [null, stringList[0], null];
    if (stringList.length > 1) {
      if (currentStringNumber === -1) {
        stringGroup[2] = stringList[1];
      } else {
        for (let i = 0; i < stringList.length; i++) {
          if (stringList[i].stringNumber === currentStringNumber) {
            stringGroup = [
              stringList[i - 1] ?? null,
              stringList[i],
              stringList[i + 1] ?? null,
            ];
            break;
          }
        }
      }
    }
    return stringGroup;
  }, [stringList, currentStringNumber]);

  useEffect(() => {
    if (stringList.length === 0) return;
    // string group 정의
    const stringGroup: (_String | null)[] = defineStringGroup();
    // string 설정
    replaceCurrentString(stringGroup);
    // 스크롤 위치 조정
    setStringListScrollPosition();
  }, [
    stringList,
    defineStringGroup,
    replaceCurrentString,
    setStringListScrollPosition,
  ]);

  // mount 시 스트링 리스트 조회
  useEffect(() => {
    getStringList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="string-list-wrapper">
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
            <span>STRINGS</span>
            <span>{currentIndex + " / " + pageInfo.totalCount}</span>
          </header>
          <div className="string-list" ref={stringListRef}>
            {stringList.map((string: _String) => {
              const isActive: boolean =
                string.stringNumber === currentStringNumber;
              return (
                <a
                  onClick={() => {
                    handleMove([
                      stringList[string.index - 1] ?? null,
                      string,
                      stringList[string.index + 1] ?? null,
                    ]);
                  }}
                  key={string.index}
                  className={isActive ? "string is-active" : "string"}
                >
                  <p className="number">
                    <span>STRING {string.stringNumber}</span>
                    {string.isCompleted ? (
                      <span className="complete">COMPLETE</span>
                    ) : (
                      <></>
                    )}
                  </p>
                  <p className="content">
                    {string.isCompleted
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
