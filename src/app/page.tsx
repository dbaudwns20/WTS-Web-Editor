"use client";

import { useRef, useState, ChangeEvent } from "react";

import { Language, getLangOptions } from "@/types/language";
import { WtsString } from "@/types/wts.string";

import Modal from "@/components/common/modal";
import Select from "@/components/input/select/select";
import Text, { type TextType } from "@/components/input/text/text";
import Submit, { type SubmitType } from "@/components/button/submit";

import { validateForm } from "@/utils/validator";
import { readWtsFile } from "@/utils/wts";

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
    try {
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
    } catch (error) {
      console.log(error);
    } finally {
      submitRef.current?.setFetchState(false);
    }
  };

  const handleUploadWtsFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file: File = event.currentTarget.files![0];
    submitRef.current?.setFetchState(true);
    try {
      setWtsStringList(readWtsFile(file));
    } catch (error: any) {
      console.log(error);
      alert(error.message);
    } finally {
      submitRef.current?.setFetchState(false);
    }
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
          <div className="block">
            <label className="label is-required" htmlFor="dropzone-file">
              WTS FILE
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  required
                  onChange={handleUploadWtsFile}
                />
              </label>
            </div>
          </div>
          <div className="block text-center">
            <Submit ref={submitRef} buttonText="CREATE" />
          </div>
        </form>
      </Modal>
    </>
  );
}
