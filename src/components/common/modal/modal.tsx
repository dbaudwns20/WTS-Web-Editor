"use client";

import React, {
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
  useCallback,
  useRef,
  MouseEventHandler,
} from "react";

import "./style.css";

type ModalProps = {
  children: ReactNode;
  title?: string;
  isCloseOnOverlay?: boolean;
  setIsModalOpen?: Dispatch<SetStateAction<boolean>>;
  widthClass?: string;
};

export default function Modal(props: ModalProps) {
  const overlay = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  const {
    children,
    title = "Modal",
    isCloseOnOverlay = false,
    setIsModalOpen,
    widthClass = "",
  }: ModalProps = props;

  // 모달 닫기
  const closeModal = useCallback(() => {
    overlay.current?.classList.add("is-hiding");
    setTimeout(() => {
      overlay.current?.classList.remove("is-hiding");
      setIsModalOpen!(false);
    }, 200);
  }, [setIsModalOpen]);

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

  useEffect(() => {
    if (widthClass) {
      wrapper.current?.classList.add(widthClass);
    }
  }, [widthClass]);

  return (
    <div ref={overlay} className="modal-background" onClick={onClick}>
      <div ref={wrapper} className="modal">
        <header className="header">
          <p className="title">{title}</p>
          <button type="button" className="close-button" onClick={closeModal}>
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
        <hr />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
