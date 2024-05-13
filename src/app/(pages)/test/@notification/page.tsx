"use client";

import { showNotificationMessage } from "@/utils/message";

export default function NotificationTest() {
  const info = () => {
    showNotificationMessage({
      message: "into message",
      messageType: "info",
    });
  };

  const success = () => {
    showNotificationMessage({
      message: "success message",
      messageType: "success",
      timeout: 6000,
    });
  };

  const warning = () => {
    showNotificationMessage({
      message: "warning message",
      messageType: "warning",
      position: "right",
    });
  };

  const danger = () => {
    showNotificationMessage({
      message: "danger message",
      messageType: "danger",
      position: "left",
    });
  };

  return (
    <section className="w-full mb-12">
      <p className="text-2xl font-semibold text-gray-500">Notifications</p>
      <hr className="mt-4" />
      <div className="w-full flex mt-5 gap-2">
        <button className="button is-info" onClick={info}>
          info default
        </button>
        <button className="button is-success" onClick={success}>
          success 10 second
        </button>
        <button className="button is-warning" onClick={warning}>
          warning right
        </button>
        <button className="button is-danger" onClick={danger}>
          danger left
        </button>
      </div>
    </section>
  );
}
