import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  SetStateAction,
  Dispatch,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

import "./style.css";

import String, { bindStringList } from "@/types/string";
import { type PageInfo, type OrderInfo } from "@/types/pagination";

import { callApi } from "@/utils/common";
import { showNotificationMessage } from "@/utils/message";

const defaultPageInfo: PageInfo = {
  offset: 10,
  currentPage: 1,
  totalPage: 1,
  totalCount: 0,
};

const defaultOrderInfo: OrderInfo = {
  sort: "stringNumber",
  order: "ASC",
};

type StringListProps = {
  projectId: string;
  lastModifiedStringNumber?: number;
  setCurrentString: Dispatch<SetStateAction<String | null>>;
};

export type StringListType = {
  getStringList: () => void;
  getMoreStringList: () => void;
};

const StringList = forwardRef((props: StringListProps, ref) => {
  const { projectId, lastModifiedStringNumber, setCurrentString } = props;

  const router = useRouter();

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    getStringList,
    getMoreStringList,
  }));

  // refs
  const stringListRef = useRef<HTMLDivElement>(null);

  // values
  const [stringList, setStringList] = useState<String[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);
  const [stringNumber, setStringNumber] = useState<number>(0);

  // 페이징 정보
  const [pageInfo, setPageInfo] = useState<PageInfo>(defaultPageInfo);
  // 정렬 정보
  const [orderInfo, setOrderInfo] = useState<OrderInfo>(defaultOrderInfo);

  // project 의 string list 조회
  const getStringList = async () => {
    setIsLoading(true);

    if (lastModifiedStringNumber !== -1) {
    }

    const response = await callApi(
      `/api/projects/${projectId}/strings?offset=${pageInfo.offset}&currentPage=${pageInfo.currentPage}&sort=${orderInfo.sort}&order=${orderInfo.order}`
    );

    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    setPageInfo(response.pageInfo);
    setStringList(bindStringList(response.data));

    setIsLoading(false);
  };

  const getMoreStringList = async () => {
    setIsMoreLoading(true);

    const response = await callApi(
      `/api/projects/${projectId}/strings?offset=${
        pageInfo.offset
      }&currentPage=${pageInfo.currentPage + 1}&sort=${orderInfo.sort}&order=${
        orderInfo.order
      }`
    );

    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    setPageInfo(response.pageInfo);
    setStringList((pre) => pre!.concat(bindStringList(response.data)));

    setIsMoreLoading(false);
  };

  const handleScroll = () => {
    const scrollHeight = stringListRef.current!.scrollHeight;
    const scrollTop = stringListRef.current!.scrollTop;
    const clientHeight = stringListRef.current!.clientHeight;
    if (
      scrollTop + clientHeight >= scrollHeight &&
      pageInfo.currentPage < pageInfo.totalPage &&
      !isMoreLoading
    ) {
      getMoreStringList();
    }
  };

  const replaceCurrentString = useCallback(
    (string: String) => {
      if (!string) return;
      router.replace(`/projects/${projectId}?strings=${string.stringNumber}`);
      setStringNumber(string.stringNumber);
      setCurrentString(string);
    },
    [projectId, router, setCurrentString]
  );

  // 스크롤이 맨 밑으로 갈 경우 추가 데이터 로딩
  useEffect(() => {
    const ref = stringListRef.current!;
    if (!ref) return;
    ref.addEventListener("scroll", handleScroll);
    return () => ref.removeEventListener("scroll", handleScroll);
  });

  useEffect(() => {
    if (stringList.length === 0) return;

    const string = stringList.find((string: String) => {
      if (lastModifiedStringNumber === -1) {
        return stringList[0];
      } else {
        if (string.stringNumber === lastModifiedStringNumber) return string;
      }
    });

    replaceCurrentString(string!);
  }, [stringList, lastModifiedStringNumber, replaceCurrentString]);

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
            <span>STRINGS</span>
            <span>{pageInfo.currentPage + " / " + pageInfo.totalPage}</span>
          </header>
          <div className="string-list" ref={stringListRef}>
            {stringList.map((string: String) => {
              return (
                <a
                  onClick={() => {
                    replaceCurrentString(string);
                  }}
                  key={string.stringNumber}
                  className={
                    stringNumber === string.stringNumber
                      ? "string is-active"
                      : "string"
                  }
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
