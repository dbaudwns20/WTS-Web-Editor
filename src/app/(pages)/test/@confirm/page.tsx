"use client";

import { showConfirmMessage } from "@/utils/message";

export default function ConfirmTest() {
  const confirm = () => {
    showConfirmMessage({
      title: "확인 창",
      message: `메시지를 입력해주세요.<br/> Esc 키로 창을 닫을 수 있습니다.`,
      buttons: [
        {
          label: "success",
          class: "success",
          onClick: null,
        },
        {
          label: "danger",
          class: "danger",
          onClick: null,
        },
        {
          label: "warning",
          class: "warning",
          onClick: null,
        },
        {
          label: "info",
          class: "info",
          onClick: null,
        },
        {
          label: "default",
          onClick: null,
        },
      ],
    });
  };

  return (
    <section className="w-full mb-12">
      <p className="text-2xl font-semibold text-gray-500">Confirm</p>
      <hr className="mt-4" />
      <div className="w-full flex mt-5">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white text-md font-bold p-2 rounded-lg mr-2"
          onClick={confirm}
        >
          show confirm dialog
        </button>
      </div>
    </section>
  );
}
