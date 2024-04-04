"use client";

import { showNotificationMessage } from "@/utils/message";

export default function Test() {
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
    <div className="py-8">
      <section className="w-full p-5">
        <p className="text-2xl font-semibold text-gray-500">Notifications</p>
        <hr className="mt-4" />
        <div className="w-full flex mt-5">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white text-md font-bold p-2 rounded-lg mr-2"
            onClick={info}
          >
            info default
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white text-md font-bold p-2 rounded-lg mr-2"
            onClick={success}
          >
            success 10 second
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-md font-bold p-2 rounded-lg mr-2"
            onClick={warning}
          >
            warning right
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white text-md font-bold p-2 rounded-lg"
            onClick={danger}
          >
            danger left
          </button>
        </div>
      </section>
    </div>
  );
}
