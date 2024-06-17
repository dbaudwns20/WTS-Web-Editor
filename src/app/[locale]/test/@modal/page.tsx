"use client";
import { useState } from "react";

import Modal from "@/components/common/modal/modal";

import { showConfirmMessage } from "@/utils/message";

export default function ModalTest() {
  const [showModalOne, setShowModalOne] = useState(false);
  const [showModalTwo, setShowModalTwo] = useState(false);

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
      <p className="text-2xl font-semibold text-gray-500">Modal</p>
      <hr className="mt-4" />
      <div className="w-full flex mt-5 gap-2">
        <button
          className="button is-primary"
          onClick={() => setShowModalOne(true)}
        >
          show Modal 1
        </button>
        <button
          className="button is-danger"
          onClick={() => setShowModalTwo(true)}
        >
          show Modal 2
        </button>
      </div>
      {showModalOne ? (
        <Modal
          title="Modal One"
          setIsModalOpen={setShowModalOne}
          isCloseOnOverlay={false}
        >
          <div className="p-6">
            <p className="mb-2">Esc 키를 누르면 모달이 닫힙니다.</p>
          </div>
        </Modal>
      ) : (
        <></>
      )}
      {showModalTwo ? (
        <Modal
          title="Modal Two"
          setIsModalOpen={setShowModalTwo}
          isCloseOnOverlay={true}
        >
          <div className="p-6">
            <p className="mb-2">오버레이영역을 클릭하면 모달이 닫힙니다.</p>
          </div>
        </Modal>
      ) : (
        <></>
      )}
    </section>
  );
}
