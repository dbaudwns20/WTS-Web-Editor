import { createElement } from "react";
import { Root, createRoot } from "react-dom/client";

import Notification from "@/components/message/notification/notification";

let messageBox: Root | null;

type NotificationOptions = {
  message: string;
  messageType: "success" | "warning" | "danger" | "info";
  position?: "left" | "center" | "right";
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

export function showNotificationMessage(options: NotificationOptions) {
  // create root
  setMessageBox();

  // component render
  messageBox!.render(createElement(Notification, options));
}
