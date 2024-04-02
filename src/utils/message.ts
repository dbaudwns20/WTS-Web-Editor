import { createElement } from "react";
import { Root, createRoot } from "react-dom/client";

import Notification from "@/components/message/notification/notification";

export enum MESSAGE_TYPE {
  SUCCESS = "is-success",
  WARNING = "is-warning",
  DANGER = "is-danger",
  INFO = "is-info",
}

let messageBox: Root | null;

type NotificationOptions = {
  message: string;
  timeout?: number;
};

function setMessageBox() {
  if (messageBox) return;
  messageBox = createRoot(document.getElementById("message-box")!);
}

export function closeNotification() {
  if (!messageBox) return;
  messageBox!.unmount();
  messageBox = null;
}

export function showNotificationMessage(
  type: MESSAGE_TYPE,
  options: NotificationOptions
) {
  // create root
  setMessageBox();

  // component render
  messageBox!.render(
    createElement(Notification, {
      ...options,
      messageType: type,
    })
  );
}
