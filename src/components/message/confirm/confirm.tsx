"use client";

import { forwardRef, useRef, useEffect } from "react";

import "./style.css";

import { clearMessageBox, type FuncButton } from "@/utils/message";

type ConfirmProps = {
  messageRootId: string;
  title?: string;
  message: string;
  buttons: FuncButton[];
};

const Confirm = forwardRef((props: ConfirmProps, ref) => {
  const { messageRootId, title = "Confirm", message, buttons } = props;

  // refs
  const overlay = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  // 모달 닫기
  const closeConfirm = () => {
    overlay.current?.classList.add("is-hiding");
    setTimeout(() => {
      clearMessageBox(messageRootId);
    }, 200);
  };

  // 키 이벤트 등록
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConfirm();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown); // 실행 후 이벤트 제거
  });

  useEffect(() => {
    // mount 시 첫번째 버튼에 focus
    const buttonsEl = document.querySelector("#confirmButtons");
    (buttonsEl?.firstChild as HTMLElement).focus();
  }, []);

  return (
    <div ref={overlay} className="confirm-background">
      <div ref={wrapper} className="confirm">
        <header className="header">
          <p className="title">{title}</p>
          <button type="button" className="close-button" onClick={closeConfirm}>
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
            <div id="confirmButtons" className="buttons">
              {buttons.map((btn: FuncButton, idx) => {
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`button is-${btn.class}`}
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
