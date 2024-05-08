import {
  useRef,
  forwardRef,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter } from "next/navigation";

import "./style.css";

import Submit, { SubmitType } from "@/components/button/submit";

import String from "@/types/string";

import { callApi } from "@/utils/common";
import { showConfirmMessage, showNotificationMessage } from "@/utils/message";

export type StringEditorType = {
  projectId: string;
  stringGroup: (String | null)[];
  isEdited: boolean;
  setIsEdited: Dispatch<SetStateAction<boolean>>;
};

const StringEditor = forwardRef((props: StringEditorType, ref) => {
  const { projectId, stringGroup, isEdited, setIsEdited } = props;
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [translatedText, setTranslatedText] = useState<string>();
  const [currentString, setCurrentString] = useState<String>();
  const [moveButtonState, setMoveButtonState] = useState<boolean[]>([
    false,
    false,
  ]);

  const router = useRouter();

  // refs
  const stringContentFormRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef<SubmitType>(null);

  const updateString = async (e: any) => {
    e.preventDefault();

    // 변경사항이 없을 경우
    if (currentString?.translatedText === translatedText) {
      showNotificationMessage({
        message: "There are no changes.",
        messageType: "warning",
        position: "right",
      });
      return;
    }

    setIsFetching(true);

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

    setIsFetching(false);

    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    } else {
      showNotificationMessage({
        message: "Saved.",
        messageType: "success",
        position: "right",
      });

      setIsEdited(false);

      return;
    }
  };

  const handleMove = (isForward: boolean) => {
    // 편집된 정보가 존재한다면
    if (isEdited) {
      showConfirmMessage({
        title: "Warning",
        message: "Changes exist. Would you like to save?",
        buttons: [
          {
            label: "Ignore",
            class: "default",
            onClick: () => moveString(isForward),
          },
          {
            label: "Save",
            class: "success",
            onClick: () => {
              const form: HTMLFormElement = stringContentFormRef.current!;
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
              moveString(isForward);
            },
          },
        ],
      });
    } else {
      moveString(isForward);
    }
  };

  const moveString = (isForward: boolean) => {
    const string: String = isForward ? stringGroup[0]! : stringGroup[2]!;
    router.replace(`/projects/${projectId}?strings=${string.stringNumber}`);
  };

  useEffect(() => {
    // 변경사항 감지
    setIsEdited(translatedText !== currentString?.translatedText);
  }, [translatedText, currentString, setIsEdited]);

  useEffect(() => {
    if (stringGroup[1]) {
      // 편집할 string set
      setCurrentString(stringGroup[1]);
      // 번역할 string text set
      setTranslatedText(stringGroup[1].translatedText);
      // 이동 버튼 disabled 여부 set
      setMoveButtonState([!stringGroup[0], !stringGroup[2]]);
    }
  }, [stringGroup]);

  useEffect(() => {
    submitRef.current!.setFetchState(isFetching);
  }, [isFetching]);

  return (
    <div className="string-editor-wrapper">
      <form
        ref={stringContentFormRef}
        className="string-editor-form"
        onSubmit={updateString}
      >
        <div className="flex justify-between items-center mb-2">
          <p className="flex items-center text-xl font-semibold text-sky-500">
            STRING {currentString?.stringNumber}
          </p>
          <div className="flex gap-3 pr-1">
            <a className="text-xs text-gray-500 flex items-center">
              <span className="icon">
                <i className="material-icons md-18">refresh</i>
              </span>
              <span>Reset</span>
            </a>
            <a className="text-xs text-gray-500 flex items-center">
              <span className="icon">
                <i className="material-icons md-18">view_agenda</i>
              </span>
              <span>View Mode</span>
            </a>
            <a className="text-xs text-gray-500 flex items-center">
              <span className="icon">
                <i className="material-icons md-18">settings</i>
              </span>
              <span>Settings</span>
            </a>
          </div>
        </div>
        <textarea
          className="w-full border border-gray-300 bg-gray-100 rounded-lg p-4 h-full text-lg text-gray-500"
          placeholder="Enter your text here..."
          readOnly
          tabIndex={-1}
          value={currentString?.originalText}
        ></textarea>
        <textarea
          className="translate-textarea"
          placeholder="Enter your text here..."
          onChange={(e) => setTranslatedText(e.target.value)}
          value={translatedText}
        ></textarea>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            disabled={moveButtonState[0]}
            onClick={() => handleMove(true)}
            className="w-full bg-gray-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
          >
            PREV
          </button>
          <Submit
            ref={submitRef}
            buttonClass="w-full bg-green-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
            buttonText="SAVE"
          />
          <button
            type="button"
            disabled={moveButtonState[1]}
            onClick={() => handleMove(false)}
            className="w-full bg-gray-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
          >
            NEXT
          </button>
        </div>
      </form>
    </div>
  );
});

StringEditor.displayName = "StringEditor";
export default StringEditor;
