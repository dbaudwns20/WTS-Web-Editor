"use client";
import { useRef, useState, FormEvent } from "react";

import Text, { type TextType } from "@/components/input/text/text";

import { validateForm } from "@/utils/validator";

export default function ComponentsTest() {
  const textRef = useRef<TextType>(null);
  const [textValue, setTextValue] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm(e.target as HTMLFormElement)) {
      return;
    }
  };

  return (
    <section className="w-full mb-12">
      <p className="text-2xl font-semibold text-gray-500">Components</p>
      <hr className="mt-4" />
      <div className="w-full mt-5 grid grid-cols-2 gap-10">
        {/* <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              id="label"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="레이블을 입력햐주세요"
            />
          </div>
          <div>
            <input
              type="text"
              id="placeholder"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="레이블을 입력햐주세요"
            />
          </div>
          <div>
            <div className="flex items-center w-full">
              <div className="flex items-center flex-grow">
                <input
                  id="default-radio-1"
                  type="radio"
                  value=""
                  name="default-radio"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="default-radio-1"
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  True
                </label>
              </div>
              <div className="flex items-center flex-grow">
                <input
                  checked
                  id="default-radio-2"
                  type="radio"
                  value=""
                  name="default-radio"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="default-radio-2"
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  False
                </label>
              </div>
            </div>
          </div>
        </div> */}

        <form className="grid gap-4" noValidate onSubmit={onSubmit}>
          <div className="block">
            <Text
              ref={textRef}
              labelText="TEXT"
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
          <div>
            <button type="submit" className="button is-primary w-[250px]">
              Submit
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
