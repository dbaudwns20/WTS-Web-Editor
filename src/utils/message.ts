/**
 * 메시지 출력 유틸
 * - Notification, Confirm
 * - 각 종류별 메시지는 1개만 존재할 수 있다.
 */

import { createElement } from "react";
import { Root, createRoot } from "react-dom/client";

import Notification from "@/components/message/notification/notification";
import Confirm from "@/components/message/confirm/confirm";

import { generateRandomText } from "@/utils/common";

const messageMap: Map<string, Root> = new Map<string, Root>();

type NotificationOptions = {
  message: string;
  messageType: "success" | "warning" | "danger" | "info";
  position?: "left" | "center" | "right";
  timeout?: number;
};

export type FuncButton = {
  label: string;
  class?: "success" | "warning" | "danger" | "info" | "default";
  onClick: Function | null;
};

type ConfirmOptions = {
  title?: string;
  message: string;
  buttons: FuncButton[];
};

type MessageType = "notification" | "confirm";

function removeExistingMessage(messageType: MessageType) {
  const target: string =
    messageType === "notification" ? "notification" : "confirm";
  Array.from(messageMap.keys()).forEach((key) => {
    if (key.startsWith(target)) {
      clearMessageBox(key);
    }
  });
}

function setMessageBox(messageRootId: string): HTMLDivElement {
  const messageBox: HTMLDivElement = document.createElement("div");
  messageBox.setAttribute("id", messageRootId);
  document.getElementById("message-box")!.appendChild(messageBox);
  return messageBox;
}

export function clearMessageBox(messageRootId: string) {
  const messageRoot: Root | undefined = messageMap.get(messageRootId);
  if (messageRoot) {
    // 해당 메시지 루트 언마운트
    messageRoot.unmount();
    // 메시지 id 로 생성된 div 삭제
    document.getElementById(messageRootId)?.remove();
    // Map 에서 삭제
    messageMap.delete(messageRootId);
  }
}

export function showNotificationMessage(options: NotificationOptions) {
  // 같은 유형의 메시지가 있다면 제거
  removeExistingMessage("notification");
  // id 정의
  const messageRootId: string = `notification_${generateRandomText()}`;
  // root 생성
  const root: Root = createRoot(setMessageBox(messageRootId));
  // 컴포넌트 렌더링
  root.render(
    createElement(Notification, {
      ...options,
      ...{ messageRootId },
    })
  );
  // Map 에 저장
  messageMap.set(messageRootId, root);
}

export async function showConfirmMessage(options: ConfirmOptions) {
  // 같은 유형의 메시지가 있다면 제거
  removeExistingMessage("confirm");
  // id
  const messageRootId: string = `confirm_${generateRandomText()}`;
  // root 생성
  const root: Root = createRoot(setMessageBox(messageRootId));
  // 컴포넌트 렌더링
  root.render(
    createElement(Confirm, {
      ...options,
      ...{ messageRootId },
    })
  );
  // Map 에 저장
  messageMap.set(messageRootId, root);
}
