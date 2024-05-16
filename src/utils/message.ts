import { createElement } from "react";
import { Root, createRoot } from "react-dom/client";

import Notification from "@/components/message/notification/notification";
import Confirm from "@/components/message/confirm/confirm";

let messageBox: Root | null;

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

function setMessageBox() {
  if (messageBox) clearMessageBox();
  messageBox = createRoot(document.getElementById("message-box")!);
}

export function clearMessageBox() {
  if (!messageBox) return;
  messageBox!.unmount();
}

export function showNotificationMessage(options: NotificationOptions) {
  // create root
  setMessageBox();

  // component render
  messageBox!.render(createElement(Notification, options));
}

export async function showConfirmMessage(options: ConfirmOptions) {
  // create root
  setMessageBox();

  // component render
  messageBox!.render(createElement(Confirm, options));
}
