"use client";
import { useRef, useState, FormEvent, useMemo, useEffect } from "react";

import Text, { type TextType } from "@/components/input/text/text";
import Select from "@/components/input/select/select";
import File, { type FileType } from "@/components/input/file/file";
import ImageUpload, {
  type ImageUploadType,
} from "@/components/input/image-upload/image.upload";
import Submit, { type SubmitType } from "@/components/button/submit";
import Dropdown from "@/components/common/dropdown/dropdown";

import { validateForm } from "@/utils/validator";
import { showNotificationMessage } from "@/utils/message";

export default function ComponentsTest() {
  const textRef = useRef<TextType>(null);
  const fileRef = useRef<FileType>(null);
  const imageUploadRef = useRef<ImageUploadType>(null);
  const submitRef = useRef<SubmitType>(null);

  const [textValue, setTextValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [fileValue, setFileValue] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const options = [
    { id: "0", value: "value 1" },
    { id: "1", value: "value 2" },
    { id: "2", value: "value 3" },
    { id: "3", value: "value 4" },
    { id: "4", value: "value 5" },
    { id: "5", value: "value 6" },
    { id: "6", value: "value 7" },
  ];

  const [isFetching, setIsFetching] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm(e.target as HTMLFormElement)) {
      return;
    }

    setIsFetching(true);

    setTimeout(() => {
      setIsFetching(false);
      showNotificationMessage({
        message: "처리되었습니다.",
        messageType: "success",
      });
    }, 1000);
  };

  useEffect(() => {
    submitRef.current?.setFetchState(isFetching);
  }, [isFetching]);

  return (
    <section className="w-full mb-12">
      <p className="text-2xl font-semibold text-gray-500">Components</p>
      <hr className="mt-4" />
      <div className="w-full mt-5">
        <form noValidate onSubmit={onSubmit}>
          <div className="mb-6">
            <Dropdown position="left">
              <button
                type="button"
                className="text-gray-500 dark:text-gray-300 flex items-center justify-center rounded-full p-2 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-gray-700"
              >
                <span className="icon mr-1">
                  <i className="material-icons !text-3xl">expand_more</i>
                </span>
                <span className="font-semibold">Dropdown Custom</span>
              </button>
              <ul className="w-[180px] py-1.5 px-2">
                <li className="hover:bg-gray-100 dark:hover:bg-gray-500/50">
                  <a
                    className="anchor-has-icon undraggable !py-2 !pl-2 !pr-3 !text-sm"
                    onClick={() => alert("UPDATE!")}
                  >
                    <span className="icon mr-1.5">
                      <i className="material-icons md-18">edit</i>
                    </span>
                    <span>기능 1</span>
                  </a>
                </li>
                <li className="hover:bg-gray-100 dark:hover:bg-gray-500/50">
                  <a
                    className="anchor-has-icon undraggable !py-2 !pl-2 !pr-3 !text-sm"
                    onClick={() => alert("DELETE!")}
                  >
                    <span className="icon mr-1.5">
                      <i className="material-icons md-18">delete</i>
                    </span>
                    <span>기능 2</span>
                  </a>
                </li>
                <li className="hover:bg-gray-100 dark:hover:bg-gray-500/50">
                  <a
                    className="anchor-has-icon undraggable !py-2 !pl-2 !pr-3 !text-sm"
                    onClick={() => alert("FAVORITE!")}
                  >
                    <span className="icon mr-1.5">
                      <i className="material-icons md-18">favorite</i>
                    </span>
                    <span>기능 3</span>
                  </a>
                </li>
                <li className="hover:bg-gray-100 dark:hover:bg-gray-500/50">
                  <a
                    className="anchor-has-icon undraggable !py-2 !pl-2 !pr-3 !text-sm"
                    onClick={() => alert("HELP!")}
                  >
                    <span className="icon mr-1.5">
                      <i className="material-icons md-18">help</i>
                    </span>
                    <span>기능 4</span>
                  </a>
                </li>
              </ul>
            </Dropdown>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 sm:grid-cols-1 mb-6">
            <div className="block">
              <Text
                ref={textRef}
                labelText="TEXT"
                placeholder="TEXT를 입력해주세요"
                value={textValue}
                onChange={setTextValue}
                required={{
                  isRequired: true,
                  invalidMessage: "필수입력값입니다.",
                }}
                min={2}
                max={10}
              />
            </div>
            <div className="block">
              <Select
                labelText="SELECT"
                value={selectValue}
                onChange={setSelectValue}
                defaultOption={{ id: "", value: "값을 선택해주세요" }}
                options={options}
                required={{
                  isRequired: true,
                  invalidMessage: "필수입력값입니다.",
                }}
              />
            </div>
            <div className="block">
              <File
                ref={fileRef}
                labelText="FILE"
                onChange={setFileValue}
                required={{
                  isRequired: true,
                  invalidMessage: "필수입력값입니다.",
                }}
              />
            </div>
            <div className="block">
              <ImageUpload
                ref={imageUploadRef}
                labelText="IMAGE"
                imageFile={imageFile}
                setImageFile={setImageFile}
              />
            </div>
          </div>

          <div className="block lg:w-[250px] sm:w-full">
            <Submit
              ref={submitRef}
              buttonText="Submit Button"
              buttonClass="button is-primary"
            />
          </div>
        </form>
      </div>
    </section>
  );
}
