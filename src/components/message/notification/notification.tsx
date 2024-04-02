"use client";

import { useRef, useEffect, useCallback, useState } from "react";

import { closeNotification } from "@/utils/message";

import "./style.css";

type NotificationProps = {
  message?: string;
  position?: string;
  messageType?: string;
  timeout?: number;
};

export default function Notification(props: NotificationProps) {
  const {
    message = "empty message",
    position = "is-center",
    messageType = "is-info",
    timeout = 3000,
  } = props;

  // ref
  const wrapper = useRef<HTMLDivElement>(null);
  const notification = useRef<HTMLDivElement>(null);

  // values
  const [icon, setIcon] = useState("info");

  // 닫기
  const close = () => closeNotification();

  const setPosition = useCallback(() => {
    wrapper.current!.className = `wrapper ${position}`;
  }, [position]);

  const setMessageType = useCallback(() => {
    notification.current!.className = `notification ${messageType}`;
    switch (messageType) {
      case "is-success":
        setIcon("check_circle");
        break;
      case "is-danger":
        setIcon("error");
        break;
      case "is-warning":
        setIcon("warning");
        break;
      default:
        setIcon("info");
        break;
    }
  }, [messageType]);

  useEffect(() => {
    setPosition();
    setMessageType();

    setTimeout(() => {
      closeNotification();
    }, timeout);
  }, [setPosition, setMessageType, timeout]);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0">
      <div ref={wrapper}>
        <div ref={notification}>
          <div className="notification-content">
            <span className="icon">
              <i className="material-icons">{icon}</i>
            </span>
            <span className="message">{message}</span>
          </div>
          <button className="close-btn" onClick={close}>
            <span className="icon">
              <i className="material-icons">close</i>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
