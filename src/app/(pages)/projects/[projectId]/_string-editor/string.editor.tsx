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
import Translator from "./_translator/translator";

import String, { bindString } from "@/types/string";

import { callApi } from "@/utils/common";
import { showConfirmMessage, showNotificationMessage } from "@/utils/message";
import { type LayoutState, type LayoutAction } from "@/reducers/layout.reducer";
import {
  type PreferenceState,
  type PreferenceAction,
} from "@/reducers/preference.reducer";

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
  layoutState: LayoutState;
  layoutDispatch: Dispatch<LayoutAction>;
  preferenceState: PreferenceState;
  preferenceDispatch: Dispatch<PreferenceAction>;
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
    layoutState,
    layoutDispatch,
    preferenceState,
    preferenceDispatch,
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
      // 자동이동 옵션이 켜져있다면
      if (preferenceState.autoMove) {
        moveString(false);
      }
    });
  };

  // string 이동 핸들링
  const handleMove = (isForward: boolean) => {
    // 편집된 정보가 존재한다면 & 자동이동 옵션이 꺼져있다면
    if (isEdited && !preferenceState.autoMove) {
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
    if (string)
      router.replace(`/projects/${projectId}?strings=${string.stringNumber}`);
  };

  // 초기화
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
    if (layoutState.showStringList) {
      stringEditorWrapperRef.current?.classList.remove("is-expand");
    } else {
      stringEditorWrapperRef.current?.classList.add("is-expand");
    }
  }, [layoutState.showStringList]);

  useEffect(() => {
    if (layoutState.stringEditorMode === "horizontal") {
      stringEditorMainRef.current?.classList.remove("is-vertical");
    } else {
      stringEditorMainRef.current?.classList.add("is-vertical");
    }
  }, [layoutState.stringEditorMode]);

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
        <header className="string-editor-header">
          <a className="string-number" onClick={handleResetScroll}>
            STRING {currentString?.stringNumber}
          </a>
          <div className="string-editor-functions">
            <Dropdown position="right">
              <a className="anchor-has-icon undraggable">
                <span className="icon">
                  <i className="material-icons md-18">space_dashboard</i>
                </span>
                <span>Layout</span>
              </a>
              <ul className="px-4 py-3.5" role="none">
                <li className="mb-2" role="menuitem">
                  <label className="label !text-xs">String List</label>
                  <label className="toggle">
                    <input
                      id="switch"
                      type="checkbox"
                      className="toggle-input"
                      checked={layoutState.showStringList}
                      onChange={(e: any) => {
                        layoutDispatch({
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
                          checked={
                            layoutState.stringEditorMode === "horizontal"
                          }
                          onChange={(e: any) => {
                            layoutDispatch({
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
                          checked={layoutState.stringEditorMode === "vertical"}
                          onChange={(e: any) => {
                            layoutDispatch({
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
                <span>Preferences</span>
              </a>
              <ul className="w-[230px] px-4 py-3.5" role="none">
                <li className="mb-2" role="menuitem">
                  <label className="label !text-xs">Editor Preference</label>
                  <label className="toggle">
                    <input
                      id="switch"
                      type="checkbox"
                      className="toggle-input"
                      checked={preferenceState.autoMove}
                      onChange={(e: any) => {
                        preferenceDispatch({
                          type: "autoMove",
                          payload: e.target.checked,
                        });
                      }}
                    />
                    <div className="trigger" />
                    <div className="leading-4 undraggable">
                      <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        자동이동
                      </label>
                      <p className="text-xs text-gray-400 dark:text-gray-300">
                        String 데이터 저장 시 자동으로 다음 항목으로 이동
                      </p>
                    </div>
                  </label>
                </li>
                <li role="menuitem">
                  <label className="toggle">
                    <input
                      id="switch"
                      type="checkbox"
                      className="toggle-input"
                      checked={preferenceState.skipCompleted}
                      onChange={(e: any) => {
                        preferenceDispatch({
                          type: "skipCompleted",
                          payload: e.target.checked,
                        });
                      }}
                    />
                    <div className="trigger" />
                    <div className="leading-4 undraggable">
                      <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        건너뛰기
                      </label>
                      <p className="text-xs text-gray-400 dark:text-gray-300">
                        String 변경 시 완료된 항목은 건너뛰기
                      </p>
                    </div>
                  </label>
                </li>
              </ul>
            </Dropdown>
          </div>
        </header>
        <div className="string-editor-main" ref={stringEditorMainRef}>
          <Translator
            originalText={currentString?.originalText}
            translatedText={translatedText}
            setTranslatedText={setTranslatedText}
          />
        </div>
        <footer className="string-editor-footer">
          <button
            type="button"
            disabled={moveButtonState[0]}
            onClick={() => handleMove(true)}
            className="button move-button"
          >
            PREV
          </button>
          <Submit
            ref={submitRef}
            buttonClass="button is-success"
            buttonText="SAVE"
          />
          <button
            type="button"
            disabled={moveButtonState[1]}
            onClick={() => handleMove(false)}
            className="button move-button"
          >
            NEXT
          </button>
        </footer>
      </form>
    </div>
  );
});

StringEditor.displayName = "StringEditor";
export default StringEditor;
