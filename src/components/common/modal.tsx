"use client";

import React, {
  useEffect,
  useCallback,
  useRef,
  MouseEventHandler,
} from "react";

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  title?: string;
  isCloseOnOverlay?: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Modal(props: ModalProps) {
  const overlay: React.RefObject<HTMLDivElement> = useRef(null);
  const wrapper: React.RefObject<HTMLDivElement> = useRef(null);

  const {
    children,
    isOpen,
    title = "Modal",
    isCloseOnOverlay = false,
    setIsModalOpen,
  }: ModalProps = props;

  // 모달 닫기
  const closeModal = useCallback(
    () => setIsModalOpen!(false),
    [setIsModalOpen]
  );

  // Esc 키를 누르면 모달 닫기
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    },
    [closeModal]
  );

  // 외부영역을 클릭하면 모달 닫기
  const onClick: MouseEventHandler = useCallback(
    (e) => {
      if (
        (isCloseOnOverlay && e.target === overlay.current) ||
        e.target === wrapper.current
      ) {
        closeModal();
      }
    },
    [isCloseOnOverlay, closeModal, overlay, wrapper]
  );

  // 키 이벤트 등록
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown); // 실행 후 이벤트 제거
  }, [onKeyDown]);

  return (
    <div
      style={{ display: isOpen ? "block" : "none" }}
      ref={overlay}
      className="fixed z-10 left-0 right-0 top-0 bottom-0 mx-auto bg-black/60"
      onClick={onClick}
    >
      <div
        ref={wrapper}
        className="bg-white dark:bg-gray-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:w-10/12 max-sm:w-10/12 md:w-8/12 lg:w-1/3 rounded-lg"
      >
        <header className="flex justify-between items-center px-6 py-3">
          <p className="font-bold text-gray-500 text-xl">{title}</p>
          <button
            className="inline-flex
                       items-center
                       justify-center
                       rounded-full
                       p-1
                       text-gray-400
                       bg-gray-100
                       hover:text-gray-500
                       focus:outline-none
                       focus:ring-2
                       focus:ring-inset
                       focus:ring-blue-500
                       focus:border-blue-500"
            onClick={closeModal}
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>
        <hr className="border-gray-200 mx-5" />
        <div className="container -mb-1">{children}</div>
      </div>
    </div>
  );
}
