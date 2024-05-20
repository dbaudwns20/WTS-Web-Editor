"use client";

import { useRef, useEffect, useCallback, useState } from "react";

import { clearMessageBox } from "@/utils/message";

import "./style.css";

type NotificationProps = {
  message?: string;
  position?: "left" | "center" | "right";
  messageType?: "info" | "success" | "warning" | "danger";
  timeout?: number;
};

export default function Notification(props: NotificationProps) {
  const {
    message = "empty message",
    position = "center",
    messageType = "is-info",
    timeout = 3000,
  } = props;

  // ref
  const wrapper = useRef<HTMLDivElement>(null);
  const notification = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  // values
  const [icon, setIcon] = useState<string>("info");
  const [isClose, setIsCode] = useState<boolean>(false);

  // 자동 닫기
  const close = () => {
    setIsCode(true);
    setTimeout(() => {
      clearMessageBox();
    }, 400);
  };

  // 자동 닫기 타임아웃 설정
  const setAutoCloseTimeout = useCallback(() => {
    timeoutRef.current = window.setTimeout(() => {
      close();
    }, timeout);
  }, [timeout]);

  // 수동 닫기
  const manualClose = () => {
    clearTimeout(timeoutRef.current!);
    close();
  };

  // props 로 받은 position 으로 notification 의 위치 지정
  const setPosition = useCallback(() => {
    if (wrapper.current!.classList.length > 1) {
      const lastClass: string = wrapper.current!.classList[1];
      wrapper.current!.classList.remove(lastClass);
    }
    wrapper.current!.classList.add(`is-${position}`);
  }, [position]);

  // props 로 받은 messageType 으로 클래스와 아이콘 정의
  const setMessageType = useCallback(() => {
    if (notification.current!.classList.length > 1) {
      const lastClass: string = notification.current!.classList[1];
      notification.current!.classList.remove(lastClass);
    }
    notification.current!.classList.add(`is-${messageType}`);
    switch (messageType) {
      case "success":
        setIcon("check_circle");
        break;
      case "danger":
        setIcon("error");
        break;
      case "warning":
        setIcon("warning");
        break;
      default:
        setIcon("notifications");
        break;
    }
  }, [messageType]);

  useEffect(() => {
    if (isClose) notification.current!.classList.add("fade-out");
  }, [isClose]);

  useEffect(() => {
    setPosition();
    setMessageType();
    // 타임아웃 설정
    setAutoCloseTimeout();
    // unmount
    return () => {
      // 컴포넌트가 unmount 될 때 타임아웃 클리어
      clearTimeout(timeoutRef.current!);
    };
  }, [setPosition, setMessageType, setAutoCloseTimeout]);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-10">
      <div className="notification-wrapper" ref={wrapper}>
        <div
          className="notification"
          ref={notification}
          onMouseOver={() => clearTimeout(timeoutRef.current!)}
          onMouseLeave={() => setAutoCloseTimeout()}
        >
          <div className="notification-content">
            <span className="icon">
              <i className="material-icons">{icon}</i>
            </span>
            <span className="message">{message}</span>
          </div>
          <button className="notification-close-button" onClick={manualClose}>
            <span className="icon">
              <i className="material-icons">close</i>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
