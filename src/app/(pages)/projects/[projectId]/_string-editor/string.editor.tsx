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

import Submit, { type SubmitType } from "@/components/button/submit";
import Dropdown from "@/components/common/dropdown/dropdown";
import Translator, { type TranslatorType } from "./_translator/translator";
import Shortcut from "./_shortcut/shortcut";

import String, { bindString } from "@/types/string";

import { callApi } from "@/utils/common";
import {
  type FuncButton,
  showConfirmMessage,
  showNotificationMessage,
} from "@/utils/message";
import { type LayoutState, type LayoutAction } from "@/reducers/layout.reducer";
import {
  type PreferenceState,
  type PreferenceAction,
} from "@/reducers/preference.reducer";

export type StringEditorType = {
  updateString: (isDraft: boolean) => Promise<void>;
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
  const translatorRef = useRef<TranslatorType>(null);

  // values
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [currentString, setCurrentString] = useState<String>();
  const [moveButtonState, setMoveButtonState] = useState<boolean[]>([
    false,
    false,
  ]);

  // String update
  const updateString = async (isSaveDraft: boolean = false) => {
    // 번역 텍스트가 없을 경우
    if (!translatedText) {
      showNotificationMessage({
        message: "The value is empty!",
        messageType: "warning",
        position: "right",
      });
      return;
    }

    setIsFetching(true);
    // 이동 버튼 비활성화
    setMoveButtonState([true, true]);

    const response = await callApi(
      `/api/projects/${projectId}/strings/${currentString?.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          translatedText: translatedText,
          isSaveDraft: isSaveDraft,
          isCompleted: currentString?.completedAt !== null,
        }),
      }
    );

    setIsFetching(false);
    // 이동 버튼 활성화
    setMoveButtonState([false, false]);

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
      // 편집기 focus
      translatorRef.current?.setFocus();
    });
  };

  // string 이동 핸들링
  const handleMove = (isForward: boolean) => {
    // 편집된 정보가 존재한다면
    if (isEdited) {
      const buttons: FuncButton[] = [
        {
          label: "Ignore",
          class: "default",
          onClick: () => moveString(isForward),
        },
        {
          label: "Save Draft",
          class: "warning",
          onClick: async () => {
            // submit event 실행
            await updateString(true);
            // string 이동
            moveString(isForward);
          },
        },
        {
          label: "Complete",
          class: "success",
          onClick: async () => {
            // submit event 실행
            await updateString();
            // string 이동
            moveString(isForward);
          },
        },
      ];

      // 완료 여부로 임시저장 버튼 제거
      if (currentString?.completedAt) {
        buttons.splice(1, 1);
      }

      showConfirmMessage({
        title: "Warning",
        message: "Changes exist. Would you like to save?",
        buttons: buttons,
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
    // 편집기 focus
    translatorRef.current?.setFocus();
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
      // 편집기 focus
      translatorRef.current?.setFocus();
    }
  }, [stringGroup]);

  useEffect(() => {
    if (layoutState.showStringList) {
      stringEditorWrapperRef.current?.classList.remove("is-expand");
    } else {
      stringEditorWrapperRef.current?.classList.add("is-expand");
    }
    // 편집기 focus
    translatorRef.current?.setFocus();
  }, [layoutState.showStringList]);

  useEffect(() => {
    if (layoutState.stringEditorMode === "horizontal") {
      stringEditorMainRef.current?.classList.remove("is-vertical");
    } else {
      stringEditorMainRef.current?.classList.add("is-vertical");
    }
    // 편집기 높이 재설정
    translatorRef.current?.setHeight();
    // 편집기 focus
    translatorRef.current?.setFocus();
  }, [layoutState.stringEditorMode]);

  useEffect(() => {
    // submit 버튼 fetching
    submitRef.current!.setFetchState(isFetching);
    // translator 비활성화
    translatorRef.current!.setDisabled(isFetching);
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
              <ul className="px-4 py-3.5 w-52" role="none">
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
            <Dropdown position="right">
              <a className="anchor-has-icon undraggable">
                <span className="icon">
                  <i className="material-icons md-18">keyboard_alt</i>
                </span>
                <span>Shortcuts</span>
              </a>
              <Shortcut />
            </Dropdown>
          </div>
        </header>
        <div className="string-editor-main" ref={stringEditorMainRef}>
          <Translator
            ref={translatorRef}
            currentString={currentString}
            originalText={currentString?.originalText}
            translatedText={translatedText}
            setTranslatedText={setTranslatedText}
            resetTranslateText={resetTranslateText}
            updateString={updateString}
          />
        </div>
        <footer className="string-editor-footer">
          <button
            type="button"
            disabled={moveButtonState[0]}
            onClick={() => handleMove(true)}
            className="button move-button"
          >
            BACK
          </button>
          <Submit
            ref={submitRef}
            buttonClass="button is-success"
            buttonText="COMPLETE"
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
