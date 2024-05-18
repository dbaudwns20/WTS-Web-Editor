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
import Dropdown from "@/components/common/dropdown/dropdown";

import String, { bindString } from "@/types/string";

import { callApi } from "@/utils/common";
import { showConfirmMessage, showNotificationMessage } from "@/utils/message";
import { ViewState, ViewAction } from "@/reducers/view.reducer";

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
  viewState: ViewState;
  viewDispatch: Dispatch<ViewAction>;
  handleResetScroll: () => void;
  completeFunction: (...arg: any) => void;
};

const StringEditor = forwardRef((props: StringEditorProps, ref) => {
  const {
    projectId,
    stringGroup,
    setStringGroup,
    isEdited,
    setIsEdited,
    viewState,
    viewDispatch,
    handleResetScroll,
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
  const stringEditorMainRef = useRef<HTMLDivElement>(null);
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
    if (!translatedText) {
      showNotificationMessage({
        message: "The value is empty!",
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

  const resetTranslateText = () => {
    setTranslatedText(
      currentString?.translatedText ? currentString.translatedText : ""
    );
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
    if (viewState.showStringList) {
      stringEditorWrapperRef.current?.classList.remove("is-expand");
    } else {
      stringEditorWrapperRef.current?.classList.add("is-expand");
    }
  }, [viewState.showStringList]);

  useEffect(() => {
    if (viewState.stringEditorMode === "horizontal") {
      stringEditorMainRef.current?.classList.remove("is-vertical");
    } else {
      stringEditorMainRef.current?.classList.add("is-vertical");
    }
  }, [viewState.stringEditorMode]);

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
        <div className="string-editor-header">
          <a className="string-number" onClick={handleResetScroll}>
            STRING {currentString?.stringNumber}
          </a>
          <div className="string-editor-functions">
            <a
              className="anchor-has-icon undraggable"
              onClick={resetTranslateText}
            >
              <span className="icon">
                <i className="material-icons md-18">refresh</i>
              </span>
              <span>Reset</span>
            </a>
            <Dropdown position="right">
              <a className="anchor-has-icon undraggable">
                <span className="icon">
                  <i className="material-icons md-18">space_dashboard</i>
                </span>
                <span>Layout</span>
              </a>
              <ul className="px-4 py-3.5" role="none">
                <li className="py-1 mb-1" role="menuitem">
                  <label className="label !text-xs">String List</label>
                  <label className="toggle">
                    <input
                      id="switch"
                      type="checkbox"
                      className="toggle-input"
                      checked={viewState.showStringList}
                      onChange={(e: any) => {
                        viewDispatch({
                          type: "showStringList",
                          payload: e.target.checked,
                        });
                      }}
                    />
                    <div className="trigger" />
                    <p className="text-gray-400 text-xs undraggable">
                      String 목록 보이기
                    </p>
                  </label>
                </li>
                <li>
                  <label className="label !text-xs">Editor View</label>
                  <ul className="grid w-full gap-3 grid-cols-2">
                    <li>
                      <div className="view-mode">
                        <input
                          type="radio"
                          id="horizontal-view"
                          value="horizontal"
                          checked={viewState.stringEditorMode === "horizontal"}
                          onChange={(e: any) => {
                            viewDispatch({
                              type: "stringEditorMode",
                              payload: e.target.value,
                            });
                          }}
                        />
                        <label htmlFor="horizontal-view">
                          <span className="icon">
                            <i className="material-icons-outlined md-18">
                              view_agenda
                            </i>
                          </span>
                          <span className="text-xs">Horizontal</span>
                        </label>
                      </div>
                    </li>
                    <li>
                      <div className="view-mode">
                        <input
                          type="radio"
                          id="vertical-view"
                          value="vertical"
                          checked={viewState.stringEditorMode === "vertical"}
                          onChange={(e: any) => {
                            viewDispatch({
                              type: "stringEditorMode",
                              payload: e.target.value,
                            });
                          }}
                        />
                        <label htmlFor="vertical-view">
                          <span className="icon">
                            <i className="material-icons-outlined md-18 rotate-90">
                              view_agenda
                            </i>
                          </span>
                          <span className="text-xs">Vertical</span>
                        </label>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </Dropdown>
            <Dropdown position="right">
              <a className="anchor-has-icon undraggable">
                <span className="icon">
                  <i className="material-icons md-18">settings</i>
                </span>
                <span>Settings</span>
              </a>
              <ul className="px-4 py-3.5" role="none">
                <li role="menuitem">
                  <label className="toggle">
                    <input
                      id="switch"
                      type="checkbox"
                      className="peer sr-only"
                      checked={viewState.showStringList}
                      onChange={(e: any) => {
                        viewDispatch({
                          type: "showStringList",
                          payload: e.target.checked,
                        });
                      }}
                    />
                    <label htmlFor="switch" className="hidden" />
                    <div
                      className="trigger
                                 peer
                                 peer-checked:border-2
                                 peer-checked:after:translate-x-full
                               peer-checked:bg-sky-400
                               peer-checked:border-sky-300
                               peer-checked:after:border-white"
                    />
                    <p className="text-gray-500 text-xs undraggable">
                      저장 후 다음 String 으로 이동
                    </p>
                  </label>
                </li>
                <li role="menuitem">
                  <label className="toggle">
                    <input
                      id="switch"
                      type="checkbox"
                      className="peer sr-only"
                      checked={viewState.showStringList}
                      onChange={(e: any) => {
                        viewDispatch({
                          type: "showStringList",
                          payload: e.target.checked,
                        });
                      }}
                    />
                    <label htmlFor="switch" className="hidden" />
                    <div
                      className="trigger
                                 peer
                                 peer-checked:border-2
                                 peer-checked:after:translate-x-full
                               peer-checked:bg-sky-400
                               peer-checked:border-sky-300
                               peer-checked:after:border-white"
                    />
                    <p className="text-gray-500 text-xs undraggable">
                      완료된 String 건너뛰기
                    </p>
                  </label>
                </li>
                <li role="menuitem">
                  <label className="toggle">
                    <input
                      id="switch"
                      type="checkbox"
                      className="peer sr-only"
                      checked={viewState.showStringList}
                      onChange={(e: any) => {
                        viewDispatch({
                          type: "showStringList",
                          payload: e.target.checked,
                        });
                      }}
                    />
                    <label htmlFor="switch" className="hidden" />
                    <div
                      className="trigger
                                 peer
                                 peer-checked:border-2
                                 peer-checked:after:translate-x-full
                               peer-checked:bg-sky-400
                               peer-checked:border-sky-300
                               peer-checked:after:border-white"
                    />
                    <p className="text-gray-500 text-xs undraggable">
                      String 이동 시 자동저장
                    </p>
                  </label>
                </li>
              </ul>
            </Dropdown>
          </div>
        </div>
        <div className="string-editor-main" ref={stringEditorMainRef}>
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
        </div>
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
