import { forwardRef, useEffect, useState, memo } from "react";

import "./style.css";

import String from "@/types/string";

import { callApi } from "@/utils/common";
import { showNotificationMessage } from "@/utils/message";

type StringContentType = {
  projectId: string;
  currentString: String | null;
};

const StringContent = forwardRef((props: StringContentType, ref) => {
  const { projectId, currentString } = props;
  const [translatedText, setTranslatedText] = useState<string>();

  useEffect(() => {
    if (currentString) {
      setTranslatedText(currentString?.translatedText);
    }
  }, [currentString]);

  const updateString = async (e: any) => {
    e.preventDefault();

    const response = await callApi(
      `/api/projects/${projectId}/strings/${currentString?.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          translatedText: translatedText,
          isCompleted: true,
        }),
      }
    );

    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    } else {
      showNotificationMessage({
        message: "저장되었습니다",
        messageType: "success",
        position: "right",
      });
      return;
    }
  };

  return (
    <div className="string-wrapper">
      <p className="text-lg font-semibold text-sky-500 mb-2">
        STRING {currentString?.stringNumber}
      </p>
      <form className="flex flex-col gap-4 h-full" onSubmit={updateString}>
        <textarea
          className="w-full border border-gray-300 bg-gray-100 rounded-lg p-4 h-full text-lg text-gray-500"
          placeholder="Enter your text here..."
          readOnly
          tabIndex={-1}
          value={currentString?.originalText}
        ></textarea>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-4 h-full text-lg "
          placeholder="Enter your text here..."
          onChange={(e) => setTranslatedText(e.target.value)}
          value={translatedText}
        ></textarea>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            className="w-full bg-gray-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
          >
            PREV
          </button>
          <button
            type="submit"
            className="w-full bg-green-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
          >
            SAVE
          </button>
          <button
            type="button"
            className="w-full bg-gray-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
          >
            NEXT
          </button>
        </div>
      </form>
    </div>
  );
});

StringContent.displayName = "StringContent";
export default memo(StringContent);
