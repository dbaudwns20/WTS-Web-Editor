"use client";

import "./style.css";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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

export default function ProjectStrings() {
  const router = useRouter();
  const params = useSearchParams();

  // refs
  const stringListRef = useRef<HTMLDivElement>(null);

  // values
  const { projectId } = useParams();
  const [stringList, setStringList] = useState<String[]>([]);
  const [string, setString] = useState<String>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);

  // 페이징 정보
  const [pageInfo, setPageInfo] = useState<PageInfo>(defaultPageInfo);
  // 정렬 정보
  const [orderInfo, setOrderInfo] = useState<OrderInfo>(defaultOrderInfo);

  // project 의 string list 조회
  const getStringList = useCallback(async () => {
    setIsLoading(true);

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
  }, []);

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

  const goStringNumber = () => {
    let stringNumber = params.get("strings");
    if (!stringNumber) {
      stringNumber = stringList[0].stringNumber.toString();
    }
    router.replace(`/projects/${projectId}?strings=${stringNumber}`);
  };

  useEffect(() => {
    // string list 가 정의되면 해당 string number 로 이동
    if (stringList.length === 0) return;
    // params 의 strings 의 값이 변경되면 string set
    setString(
      stringList.find(
        (string: String) =>
          string.stringNumber === Number(params.get("strings"))
      )
    );

    goStringNumber();
  }, [params, stringList]);

  // 스크롤이 맨 밑으로 갈 경우 추가 데이터 로딩
  useEffect(() => {
    const ref = stringListRef.current!;
    if (!ref) return;
    ref.addEventListener("scroll", handleScroll);
    return () => ref.removeEventListener("scroll", handleScroll);
  });

  //  mount 시 스트링 리스트 조회
  useEffect(() => {
    getStringList();
  }, [getStringList]);

  return (
    <section className="string-content-section">
      <div className="string-list-wrapper">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <svg
              className="animate-spin text-slate-300 w-[50px] h-[50px]"
              viewBox="0 0 24 24"
            >
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <>
            <header className="flex justify-between items-center border-b border-gray-300 py-2 px-2.5 text-gray-400 tracking-wide">
              <span className="text-xs">STRINGS</span>
              <span className="text-xs">
                {pageInfo.currentPage + " / " + pageInfo.totalPage}
              </span>
            </header>
            <div className="string-list" ref={stringListRef}>
              {stringList.map((string: String) => {
                return (
                  <Link
                    href={`/projects/${projectId}?strings=${string.stringNumber}`}
                    key={string.stringNumber}
                    className={
                      Number(params.get("strings")) === string.stringNumber
                        ? "string is-active"
                        : "string"
                    }
                  >
                    <label className="number">
                      STRING {string.stringNumber}
                    </label>
                    <p className="content">{string.originalText}</p>
                    {string.comment ? (
                      <span className="icon">
                        <i className="material-icons-outlined md-18">
                          sticky_note_2
                        </i>
                      </span>
                    ) : (
                      <></>
                    )}
                  </Link>
                );
              })}
              {isMoreLoading ? (
                <div className="w-full flex justify-center items-center h-14">
                  <svg
                    className="animate-spin text-slate-300 w-[30px] h-[30px]"
                    viewBox="0 0 24 24"
                  >
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : (
                <></>
              )}
            </div>
          </>
        )}
      </div>
      <div className="string-wrapper">
        <p className="text-lg font-semibold text-sky-500 mb-2">
          STRING {string?.stringNumber}
        </p>
        <div className="flex flex-col gap-4 h-full mb-4">
          <textarea
            className="w-full border border-gray-300 bg-gray-100 rounded-lg p-4 h-full text-lg text-gray-500"
            placeholder="Enter your text here..."
            readOnly
            tabIndex={-1}
            value={string?.originalText}
          ></textarea>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 h-full text-lg "
            placeholder="Enter your text here..."
          ></textarea>
        </div>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            className="w-full bg-gray-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
          >
            PREV
          </button>
          <button
            type="button"
            className="w-full bg-green-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
          >
            SAVE
          </button>
          <button
            type="button"
            className="w-full bg-gray-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
          >
            NEXT
          </button>
        </div>
      </div>
    </section>
  );
}
