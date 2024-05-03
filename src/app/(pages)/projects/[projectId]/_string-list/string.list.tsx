import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  memo,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import "./style.css";

import String, { bindStringList } from "@/types/string";
import { type PageInfo } from "@/types/pagination";

import { callApi } from "@/utils/common";
import { showNotificationMessage } from "@/utils/message";

const defaultPageInfo: PageInfo = {
  offset: 10,
  currentPage: 1,
  totalPage: 1,
  totalCount: 0,
};

type StringListProps = {
  projectId: string;
  setCurrentString: Dispatch<SetStateAction<String | null>>;
};

type _String = String & { index: number; isActive: boolean };

export type StringListType = {
  getStringList: () => void;
  getMoreStringList: () => void;
  setStringListScrollPosition: () => void;
};

const StringList = forwardRef((props: StringListProps, ref) => {
  const { projectId, setCurrentString } = props;

  const searchParams = useSearchParams();
  const router = useRouter();

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    getStringList,
    getMoreStringList,
    setStringListScrollPosition,
  }));

  // refs
  const stringListRef = useRef<HTMLDivElement>(null);

  // values
  const [stringList, setStringList] = useState<_String[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);
  const [isFirstRendering, setIsFirstRendering] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentStringNumber: number = searchParams.get("strings")
    ? Number(searchParams.get("strings"))
    : -1;

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

  const setStringListScrollPosition = () => {
    const node = stringListRef.current;
    if (!node) return;
    const children = node.children;
    let offsetTop: number = 0;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      if (child.classList.contains("is-active")) {
        // 스크롤 위치 계산
        offsetTop = child.offsetHeight * (i - 2);
        break;
      }
    }
    node.scrollTop = offsetTop;
  };

  const replaceCurrentString = useCallback(
    (string: _String) => {
      if (!string) return;
      router.replace(`/projects/${projectId}?strings=${string.stringNumber}`);
      setCurrentIndex(string.index);
      setCurrentString(string!);
    },
    [projectId, router, setCurrentString]
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

  useEffect(() => {
    if (stringList.length === 0 || isFirstRendering) return;
    const string = stringList.find((string: _String) => {
      if (currentStringNumber === -1) {
        return stringList[0];
      } else {
        if (string.stringNumber === currentStringNumber) return string;
      }
    });

    setIsFirstRendering(true);
    replaceCurrentString(string!);
    setStringListScrollPosition();
  }, [stringList, replaceCurrentString, isFirstRendering, currentStringNumber]);

  // mount 시 스트링 리스트 조회
  useEffect(() => {
    getStringList();
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
            <span>{currentIndex + " / " + pageInfo.totalCount}</span>
            <span>{currentIndex + " / " + pageInfo.totalCount}</span>
          </header>
          <div className="string-list" ref={stringListRef}>
            {stringList.map((string: _String) => {
              const isActive: boolean =
                string.stringNumber === currentStringNumber;
              return (
                <a
                  onClick={() => {
                    replaceCurrentString(string);
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
export default memo(StringList);
