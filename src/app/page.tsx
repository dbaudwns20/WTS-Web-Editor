"use client";

import { useRef, useState, ChangeEvent } from "react";

import { Language, getLangOptions } from "@/types/language";
import { WtsString } from "@/types/wts.string";

import Modal from "@/components/common/modal";
import Select from "@/components/input/select/select";
import Text, { type TextType } from "@/components/input/text/text";
import Submit, { type SubmitType } from "@/components/button/submit";
import File from "@/components/input/file/file";

import { validateForm } from "@/utils/validator";
import { readWtsFile } from "@/utils/wts";
import { showNotificationMessage } from "@/utils/message";

export default function RootPage() {
  // ref
  const titleRef = useRef<TextType>();
  const submitRef = useRef<SubmitType>();
  const fileRef = useRef<HTMLInputElement>();

  // values
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [language, setLanguage] = useState<Language | "">("");
  const [version, setVersion] = useState<string>("");
  const [wtsStringList, setWtsStringList] = useState<WtsString[]>([]);

  // 프로젝트 생성 모달창 열기
  const newProject = () => {
    setIsModalOpen(true);
    titleRef.current?.focus();
  };

  // 프로젝트 생성
  const createNewProject = async (e: any) => {
    e.preventDefault();

    if (!validateForm(e.target)) return;

    submitRef.current?.setFetchState(true);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        language: language,
        version: version,
        wtsStringList: wtsStringList,
      }),
    });

    const result = await response.json();

    if (result.success) {
      showNotificationMessage({
        message: "프로젝트가 생성되었습니다.",
        messageType: "success",
      });
    } else {
      showNotificationMessage({
        message: result.message,
        messageType: "danger",
      });
    }

    submitRef.current?.setFetchState(false);
  };

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

  const handleUploadWtsFile = (file: File) => {
    setWtsStringList(readWtsFile(file));
  };

  return (
    <>
      <div className="border border-grey-300 mx-10 my-10 px-10 py-10 text-center rounded-2xl">
        <p className="py-5">Logo Or Description</p>
      </div>
      <div className="mx-10 my-10">
        <div className="w-full flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white text-2xl font-bold p-5 rounded-lg"
            onClick={newProject}
          >
            CREATE NEW PROJECT
          </button>
        </div>
        <div className="w-full flex justify-center mt-5">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white text-md font-bold p-2 rounded-lg mr-2"
            onClick={info}
          >
            info
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white text-md font-bold p-2 rounded-lg mr-2"
            onClick={success}
          >
            success
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-md font-bold p-2 rounded-lg mr-2"
            onClick={warning}
          >
            warning
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white text-md font-bold p-2 rounded-lg"
            onClick={danger}
          >
            danger
          </button>
        </div>
      </div>
      <Modal
        title="New Project"
        isOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isCloseOnOverlay={false}
      >
        <form
          className="grid gap-6 md:grid-cols-1 p-6"
          onSubmit={createNewProject}
          noValidate
        >
          <div className="block">
            <Text
              ref={titleRef}
              value={title}
              labelText="TITLE"
              placeholder="Project Title"
              invalidMsg="Please enter your project title."
              isRequired={true}
              onChange={setTitle}
            />
          </div>
          <div className="block-group">
            <div className="block">
              <Select
                labelText="LANGUAGE"
                options={getLangOptions()}
                value={language}
                onChange={(val) => setLanguage(val)}
                invalidMsg="Please select your language."
                isRequired={true}
              />
            </div>
            <div className="block">
              <Text
                value={version}
                labelText="VERSION"
                placeholder="ex) 1.0.0"
                invalidMsg="Please enter your version."
                onChange={setVersion}
              />
            </div>
          </div>
          <div className="block">
            <File
              ref={fileRef}
              labelText="WTS FILE"
              onChange={handleUploadWtsFile}
              isRequired={true}
              accept=".wts"
              invalidMsg="Please upload your wts file."
            />
          </div>
          <div className="block text-center">
            <Submit ref={submitRef} buttonText="CREATE" />
          </div>
        </form>
      </Modal>
    </>
  );
}
