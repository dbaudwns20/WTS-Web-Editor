import {
  useRef,
  forwardRef,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useImperativeHandle,
} from "react";
import { useRouter } from "@/navigation";

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
import {
  type PreviewState,
  type PreviewAction,
} from "@/reducers/preview.reducer";

import { useTranslations } from "next-intl";

export type StringEditorType = {
  updateString: (isDraft: boolean) => Promise<void>;
  handleMove: (isForward: boolean) => void;
  sync: () => void;
  reset: () => void;
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
  previewState: PreviewState;
  previewDispatch: Dispatch<PreviewAction>;
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
    previewState,
    previewDispatch,
    handleResetScroll,
    completeFunction,
  } = props;

  const router = useRouter();

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    updateString,
    handleMove,
    sync: translatorRef.current?.sync,
    reset: resetTranslateText,
    componentElement: stringEditorWrapperRef.current!,
  }));

  // i18n translate key
  const t = useTranslations("PROJECT_DETAIL.STRING_EDITOR");
  const et = useTranslations("ERROR");

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
        message: t("EMPTY_TRANSLATE_TEXT_MESSAGE"),
        messageType: "warning",
        position: "right",
      });
      return;
    }

    setIsFetching(true);
    // 이동 버튼 비활성화
    setMoveButtonState([true, true]);

    // formData 가공
    const formData: FormData = new FormData();
    formData.append("translatedText", translatedText);
    formData.append("isSaveDraft", isSaveDraft.toString());
    formData.append(
      "isCompleted",
      (currentString?.completedAt !== null).toString()
    );

    const response = await callApi(
      `/api/projects/${projectId}/strings/${currentString?.id}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    setIsFetching(false);
    // 이동 버튼 활성화
    setMoveButtonState([false, false]);

    // onError
    if (!response.success) {
      let message: string = response.message;
      if (response.errorCode) {
        message = et(response.errorCode, { arg: response.arg });
      }
      showNotificationMessage({
        message: message,
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
        message: t("SUCCESS_MESSAGE"),
        messageType: "success",
        position: "right",
      });
      // 편집 상태 해제
      setIsEdited(false);
      // 자동이동 옵션이 켜져있다면
      if (preferenceState.autoMove && !isSaveDraft) {
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
          label: t("CONFIRM.IGNORE_LABEL"),
          class: "default",
          onClick: () => moveString(isForward),
        },
        {
          label: t("CONFIRM.SAVE_DRAFT_LABEL"),
          class: "warning",
          onClick: async () => {
            // submit event 실행
            await updateString(true);
            // string 이동
            moveString(isForward);
          },
        },
        {
          label: t("CONFIRM.COMPLETE_LABEL"),
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
        title: t("CONFIRM.TITLE"),
        message: t("CONFIRM.MESSAGE"),
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
    // 미리보기 상태라면 불가
    if (previewState.translate) return;

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
                <span>{t("FUNCTIONS.LAYOUT.LABEL")}</span>
              </a>
              <ul className="px-4 py-3.5 w-52" role="none">
                <li className="mb-2" role="menuitem">
                  <label className="label !text-xs">
                    {t("FUNCTIONS.LAYOUT.STRING_LIST.LABEL")}
                  </label>
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
                      {t("FUNCTIONS.LAYOUT.STRING_LIST.TEXT")}
                    </p>
                  </label>
                </li>
                <li>
                  <label className="label !text-xs">
                    {t("FUNCTIONS.LAYOUT.EDITOR_VIEW.LABEL")}
                  </label>
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
                          <span className="text-xs">
                            {t("FUNCTIONS.LAYOUT.EDITOR_VIEW.HORIZONTAL")}
                          </span>
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
                          <span className="text-xs">
                            {t("FUNCTIONS.LAYOUT.EDITOR_VIEW.VERTICAL")}
                          </span>
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
                <span>{t("FUNCTIONS.PREFERENCES.LABEL")}</span>
              </a>
              <ul className="w-[230px] px-4 py-3.5" role="none">
                <li className="mb-2" role="menuitem">
                  <label className="label !text-xs">
                    {t("FUNCTIONS.PREFERENCES.EDITOR_PREFERENCE.LABEL")}
                  </label>
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
                        {t(
                          "FUNCTIONS.PREFERENCES.EDITOR_PREFERENCE.AUTO_MOVE.LABEL"
                        )}
                      </label>
                      <p className="text-xs text-gray-400 dark:text-gray-300">
                        {t(
                          "FUNCTIONS.PREFERENCES.EDITOR_PREFERENCE.AUTO_MOVE.TEXT"
                        )}
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
                        {t(
                          "FUNCTIONS.PREFERENCES.EDITOR_PREFERENCE.SKIP.LABEL"
                        )}
                      </label>
                      <p className="text-xs text-gray-400 dark:text-gray-300">
                        {t("FUNCTIONS.PREFERENCES.EDITOR_PREFERENCE.SKIP.TEXT")}
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
                <span>{t("FUNCTIONS.SHORTCUTS.LABEL")}</span>
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
            previewState={previewState}
            previewDispatch={previewDispatch}
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
            {t("BACK_BUTTON")}
          </button>
          <Submit
            ref={submitRef}
            buttonClass="button is-success"
            buttonText={t("COMPLETE_BUTTON")}
          />
          <button
            type="button"
            disabled={moveButtonState[1]}
            onClick={() => handleMove(false)}
            className="button move-button"
          >
            {t("NEXT_BUTTON")}
          </button>
        </footer>
      </form>
    </div>
  );
});

StringEditor.displayName = "StringEditor";
export default StringEditor;
