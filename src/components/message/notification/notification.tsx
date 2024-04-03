"use client";

import { useRef, useEffect, useCallback, useState } from "react";

import { closeNotification } from "@/utils/message";

import "./style.css";

type NotificationProps = {
  message?: string;
  position?: "left" | "center" | "right";
  messageType?: string;
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

  // 자동 닫기
  const close = () => {
    notification.current!.className += " fade-out";
    setTimeout(() => {
      closeNotification();
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
    wrapper.current!.className = `wrapper is-${position}`;
  }, [position]);

  // props 로 받은 messageType 으로 클래스와 아이콘 정의
  const setMessageType = useCallback(() => {
    notification.current!.className = `notification is-${messageType}`;
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
    setPosition();
    setMessageType();
  }, [setPosition, setMessageType]);

  useEffect(() => {
    // 타임아웃 설정
    setAutoCloseTimeout();
    // unmount
    return () => {
      // 컴포넌트가 unmount 될 때 타임아웃 클리어
      clearTimeout(timeoutRef.current!);
    };
  }, [setAutoCloseTimeout]);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
      <div ref={wrapper}>
        <div
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
          <button className="close-btn" onClick={manualClose}>
            <span className="icon">
              <i className="material-icons">close</i>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
