"use client";

import { forwardRef, useRef, useEffect } from "react";

import "./style.css";

import { clearMessageBox, type FuncButton } from "@/utils/message";

type ConfirmProps = {
  title?: string;
  message: string;
  buttons: FuncButton[];
};

const Confirm = forwardRef((props: ConfirmProps, ref) => {
  const { title = "Confirm", message, buttons } = props;

  // refs
  const overlay = useRef(null);
  const wrapper = useRef(null);

  // 모달 닫기
  const closeConfirm = () => {
    clearMessageBox();
  };

  // 키 이벤트 등록
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConfirm();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown); // 실행 후 이벤트 제거
  });

  return (
    <div ref={overlay} className="confirm-background is-active">
      <div ref={wrapper} className="confirm">
        <header className="header">
          <p className="title">{title}</p>
          <button className="close-button" onClick={closeConfirm}>
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
        <div className="content">
          <p
            className="message"
            dangerouslySetInnerHTML={{ __html: message }}
          ></p>
          <div className="buttons-wrapper">
            <div className="buttons">
              {buttons.map((btn: FuncButton, idx) => {
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`func-button is-${btn.class}`}
                    onClick={() => {
                      if (btn.onClick) btn.onClick();
                      closeConfirm();
                    }}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Confirm.displayName = "Confirm";
export default Confirm;
