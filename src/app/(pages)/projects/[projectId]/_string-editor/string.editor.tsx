import {
  useRef,
  forwardRef,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useImperativeHandle,
} from "react";
import { useRouter } from "next/navigation";

import "./style.css";

import Submit, { SubmitType } from "@/components/button/submit";

import String, { bindString } from "@/types/string";

import { callApi } from "@/utils/common";
import { showConfirmMessage, showNotificationMessage } from "@/utils/message";

export type StringEditorType = {
  updateString: () => Promise<void>;
  componentElement: HTMLElement;
};

type StringEditorProps = {
  projectId: string;
  stringGroup: (String | null)[];
  setStringGroup: Dispatch<SetStateAction<(String | null)[]>>;
  isEdited: boolean;
  setIsEdited: Dispatch<SetStateAction<boolean>>;
  completeFunction: (...arg: any) => void;
};

const StringEditor = forwardRef((props: StringEditorProps, ref) => {
  const {
    projectId,
    stringGroup,
    setStringGroup,
    isEdited,
    setIsEdited,
    completeFunction,
  } = props;

  const router = useRouter();

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    updateString,
    componentElement: stringEditorWrapperRef.current!,
  }));

  // refs
  const stringEditorWrapperRef = useRef<HTMLDivElement>(null);
  const stringEditorFormRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef<SubmitType>(null);

  // values
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [currentString, setCurrentString] = useState<String>();
  const [moveButtonState, setMoveButtonState] = useState<boolean[]>([
    false,
    false,
  ]);

  // String update
  const updateString = async () => {
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
        }),
      }
    );

    setIsFetching(false);

    // onError
    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    const newString: String = bindString(response.data);

    // string group 갱신
    setStringGroup([
      stringGroup[0],
      Object.assign(stringGroup[1] as String, newString),
      stringGroup[2],
    ]);

    // 성공 처리
    completeFunction(() => {
      showNotificationMessage({
        message: "Saved.",
        messageType: "success",
        position: "right",
      });
      // 편집 상태 해제
      setIsEdited(false);
    });
  };

  // string 이동 핸들링
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
            onClick: async () => {
              // submit event 실행
              await updateString();
              // string 이동
              moveString(isForward);
            },
          },
        ],
      });
    } else {
      moveString(isForward);
    }
  };

  // string 이동
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
      setTranslatedText(
        stringGroup[1].translatedText ? stringGroup[1].translatedText : ""
      );
      // 이동 버튼 disabled 여부 set
      setMoveButtonState([!stringGroup[0], !stringGroup[2]]);
    }
  }, [stringGroup]);

  useEffect(() => {
    submitRef.current!.setFetchState(isFetching);
  }, [isFetching]);

  return (
    <div className="string-editor-wrapper" ref={stringEditorWrapperRef}>
      <form
        ref={stringEditorFormRef}
        className="string-editor-form"
        onSubmit={(e) => {
          e.preventDefault();
          updateString();
        }}
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