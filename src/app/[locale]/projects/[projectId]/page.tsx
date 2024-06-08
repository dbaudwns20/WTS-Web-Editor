"use client";

import "./style.css";

import {
  useEffect,
  useState,
  useRef,
  useReducer,
  Reducer,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/navigation";
import Image from "next/image";

import Project, { bindProject } from "@/types/project";
import String from "@/types/string";
import { getLocaleTextByValue } from "@/types/locale";

import {
  type LayoutState,
  type LayoutAction,
  layoutInitState,
  layoutReducer,
} from "@/reducers/layout.reducer";
import {
  type PreferenceState,
  type PreferenceAction,
  preferenceInitState,
  preferenceReducer,
} from "@/reducers/preference.reducer";
import {
  type PreviewAction,
  type PreviewState,
  previewInitState,
  previewReducer,
} from "@/reducers/preview.reducer";

import StringList, { StringListType } from "./_string-list/string.list";
import StringEditor, { StringEditorType } from "./_string-editor/string.editor";
import UpdateProjectModal from "./_update-project-modal/update.project.modal";
import UploadWtsModal from "./_upload-wts-modal/upload.wts.modal";
import DownloadWtsModal from "./_download-wts-modal/download.wts.modal";
import Dropdown from "@/components/common/dropdown/dropdown";

import { showNotificationMessage, showConfirmMessage } from "@/utils/message";
import { callApi, convertDateToString, DATE_FORMAT } from "@/utils/common";

import Hotkeys from "react-hot-keys";

export default function ProjectDetail() {
  // params
  const { projectId } = useParams();
  // router
  const router = useRouter();

  // refs
  const projectInfoSectionRef = useRef<HTMLSelectElement>(null);
  const stringListRef = useRef<StringListType>(null);
  const stringEditorRef = useRef<StringEditorType>(null);

  // keys
  const [stringListKey, setStringListKey] = useState<number>(0);

  // values
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUploadWtsModalOpen, setIsUploadWtsModalOpen] = useState(false);
  const [isDownloadWtsModalOpen, setIsDownloadWtsModalOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [stringGroup, setStringGroup] = useState<(String | null)[]>([]);

  // 레이아웃 reducer
  const [layoutState, layoutDispatch] = useReducer<
    Reducer<LayoutState, LayoutAction>
  >(layoutReducer, layoutInitState);
  // 옵션 reducer
  const [preferenceState, preferenceDispatch] = useReducer<
    Reducer<PreferenceState, PreferenceAction>
  >(preferenceReducer, preferenceInitState);
  // 미리보기 reducer
  const [previewState, previewDispatch] = useReducer<
    Reducer<PreviewState, PreviewAction>
  >(previewReducer, previewInitState);

  // 프로젝트 가져오기
  const getProject = async () => {
    const response = await callApi(`/api/projects/${projectId}`);
    // onError
    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });

      // 메인화면으로 이동
      router.push("/");
      return;
    }
    setProject(bindProject(response.data));
  };

  // 프로젝트 삭제 핸들링
  const handleDeleteProject = () => {
    showConfirmMessage({
      message: "delete this project?",
      buttons: [
        {
          label: "CANCEL",
          onClick: null,
        },
        {
          label: "OK",
          class: "info",
          onClick: () => deleteProject(),
        },
      ],
    });
  };

  // 프로젝트 삭제
  const deleteProject = async () => {
    const response = await callApi(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    // onError
    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    showNotificationMessage({
      message: "deleted.",
      messageType: "success",
    });

    // 메인화면으로 이동
    router.push("/");
  };

  // string editor 에서 호출 용
  const handleResetScroll = () => {
    stringListRef.current?.setStringListScrollPosition();
  };

  // string list component 에서 호출 용
  const handleUpdateString = async (isDraft: boolean = false) => {
    await stringEditorRef.current?.updateString(isDraft);
  };

  // 함수 호출 후 처리
  const completeFunction = (callbacks: Function) => {
    // 콜백함수 호출
    callbacks();
    // 프로젝트 재조회
    getProject();
  };

  // LocalStorage에 저장된 값 반영
  const applyLocalStorageData = () => {
    const storedLayout = localStorage.getItem("layout");
    if (storedLayout) {
      const parsedLayout = JSON.parse(storedLayout);
      layoutDispatch({
        type: "showStringList",
        payload: parsedLayout.showStringList,
      });
      layoutDispatch({
        type: "stringEditorMode",
        payload: parsedLayout.stringEditorMode,
      });
    }
    const storedPreference = localStorage.getItem("preference");
    if (storedPreference) {
      const parsedPreference = JSON.parse(storedPreference);
      preferenceDispatch({
        type: "skipCompleted",
        payload: parsedPreference.skipCompleted,
      });
      preferenceDispatch({
        type: "autoMove",
        payload: parsedPreference.autoMove,
      });
    }
  };

  // string content 높이 재조정
  const setStringContentSectionHeight = useCallback(() => {
    const projectInfoSectionHeight: number =
      projectInfoSectionRef.current!.clientHeight;
    const mainHeight: number = document.querySelector(".main")!.clientHeight;

    // string list section 높이 지정
    stringListRef.current!.componentElement!.style.height = `${
      mainHeight - projectInfoSectionHeight - 32 // -2rem
    }px`;
  }, []);

  useEffect(() => {
    // 자동이동 설정이 변경될 경우 string list 리로드
    setStringListKey((pre) => pre + 1);
  }, [preferenceState.skipCompleted]);

  useEffect(() => {
    if (isLoading) return;
    setStringContentSectionHeight();
  }, [isLoading, stringListKey, setStringContentSectionHeight]);

  useEffect(() => {
    if (project) setIsLoading(false);
  }, [project]);

  useEffect(() => {
    getProject();
    applyLocalStorageData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //
  const executeShortcutCommand = (
    keyName: string,
    e: KeyboardEvent,
    handle: any
  ) => {
    e.preventDefault();
    e.stopPropagation();

    switch (keyName) {
      case "alt+right":
        stringEditorRef.current?.handleMove(false);
        break;
      case "alt+left":
        stringEditorRef.current?.handleMove(true);
        break;
      case "alt+s":
        stringEditorRef.current?.updateString(false);
        break;
      case "alt+d":
        // 미완료 상태인 경우만 저장
        if (!stringGroup[1]?.completedAt)
          stringEditorRef.current?.updateString(true);
        break;
      case "alt+f":
        // 목록 창이 닫혀있다면 열기
        if (!layoutState.showStringList) {
          layoutDispatch({
            type: "showStringList",
            payload: true,
          });
        }
        // focus
        setTimeout(() => stringListRef.current?.setIsShowSearch((pre) => !pre));
        break;
      case "alt+c":
        stringEditorRef.current?.sync();
        break;
      case "alt+r":
        stringEditorRef.current?.reset();
        break;
      case "alt+q":
        if (stringListRef.current?.query) {
          setStringListKey((prev) => prev + 1);
        }
        break;
    }
  };

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Hotkeys
            keyName="alt+s,alt+d,alt+f,alt+c,alt+r,alt+right,alt+left,alt+q"
            onKeyDown={executeShortcutCommand}
            allowRepeat={false}
            filter={() => true}
          >
            <section
              ref={projectInfoSectionRef}
              className="project-info-section"
            >
              <div className="project-info-wrapper">
                <div className="project-info">
                  <figure className="image-wrapper">
                    <Image
                      className="image"
                      src={project!.projectImage.url}
                      alt={project!.projectImage.pathname}
                      width={500}
                      height={500}
                      priority={true}
                    />
                  </figure>
                  <div className="info-wrapper">
                    <p className="title">{project?.title}</p>
                    <div className="tag-group">
                      <span className="tag locale">
                        {getLocaleTextByValue(project!.locale)}
                      </span>
                      {project!.version ? (
                        <span className="tag version">v{project!.version}</span>
                      ) : (
                        <></>
                      )}
                      <span className="tag progress">{`${project?.process}% Translated`}</span>
                    </div>
                    <div className="button-group">
                      <button
                        type="button"
                        className="download-button"
                        onClick={() => setIsDownloadWtsModalOpen(true)}
                      >
                        <span className="tag download">
                          <span className="icon mr-0.5">
                            <i className="material-icons md-18">download</i>
                          </span>
                          <span className="text-sm font-semibold">
                            Download
                          </span>
                        </span>
                      </button>
                      {project?.source ? (
                        <a
                          className="source-link"
                          href={project!.source!}
                          target="_blank"
                        >
                          <span className="tag source">
                            <span className="icon mr-0.5">
                              <i className="material-icons md-18">launch</i>
                            </span>
                            <span className="text-sm font-semibold">
                              Source Link
                            </span>
                          </span>
                        </a>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div className="last-edited-wrapper">
                    <div className="last-edited">
                      <span className="flex items-center">
                        <span className="icon mr-0.5">
                          <i className="material-icons md-18 text-gray-400">
                            update
                          </i>
                        </span>
                        <span className="text-xs text-gray-400">
                          Last Edited
                        </span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {`${convertDateToString(
                          project!.updatedAt,
                          DATE_FORMAT.DATE_TIME
                        )}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="functions">
                  <Dropdown position="right">
                    <button type="button" className="more-button">
                      <span className="icon">
                        <i className="material-icons !text-3xl">more_vert</i>
                      </span>
                    </button>
                    <ul className="w-[180px] py-1.5 px-2">
                      <li className="hover:bg-gray-100 dark:hover:bg-gray-500/50 duration-200">
                        <a
                          className="anchor-has-icon undraggable !py-2 !pl-2 !pr-3 !text-sm"
                          onClick={() => setIsUpdateModalOpen(true)}
                        >
                          <span className="icon mr-1.5">
                            <i className="material-icons md-18">edit</i>
                          </span>
                          <span>Update</span>
                        </a>
                      </li>
                      <li className="hover:bg-gray-100 dark:hover:bg-gray-500/50 duration-200">
                        <a
                          className="anchor-has-icon undraggable !py-2 !pl-2 !pr-3 !text-sm"
                          onClick={handleDeleteProject}
                        >
                          <span className="icon mr-1.5">
                            <i className="material-icons md-18">delete</i>
                          </span>
                          <span>Delete</span>
                        </a>
                      </li>
                      <li className="hover:bg-gray-100 dark:hover:bg-gray-500/50 duration-200">
                        <a
                          className="anchor-has-icon undraggable !py-2 !pl-2 !pr-3 !text-sm"
                          onClick={() => setIsUploadWtsModalOpen(true)}
                        >
                          <span className="icon mr-1.5">
                            <i className="material-icons md-18">file_upload</i>
                          </span>
                          <span>Upload WTS</span>
                        </a>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>
            </section>
            <section className="string-content-section">
              <StringList
                key={stringListKey}
                ref={stringListRef}
                projectId={projectId as string}
                setStringGroup={setStringGroup}
                isEdited={isEdited}
                showStringList={layoutState.showStringList}
                skipCompleted={preferenceState.skipCompleted}
                setStringListKey={setStringListKey}
                handleUpdateString={handleUpdateString}
              />
              <StringEditor
                ref={stringEditorRef}
                projectId={projectId as string}
                stringGroup={stringGroup}
                setStringGroup={setStringGroup}
                isEdited={isEdited}
                setIsEdited={setIsEdited}
                layoutState={layoutState}
                layoutDispatch={layoutDispatch}
                preferenceState={preferenceState}
                preferenceDispatch={preferenceDispatch}
                previewState={previewState}
                previewDispatch={previewDispatch}
                handleResetScroll={handleResetScroll}
                completeFunction={completeFunction}
              />
            </section>
            {isUpdateModalOpen ? (
              <UpdateProjectModal
                project={project!}
                setStringListKey={setStringListKey}
                completeFunction={completeFunction}
                closeModal={setIsUpdateModalOpen}
              />
            ) : (
              <></>
            )}
            {isUploadWtsModalOpen ? (
              <UploadWtsModal
                setStringListKey={setStringListKey}
                completeFunction={completeFunction}
                closeModal={setIsUploadWtsModalOpen}
              />
            ) : (
              <></>
            )}
            {isDownloadWtsModalOpen ? (
              <DownloadWtsModal
                completeFunction={completeFunction}
                closeModal={setIsDownloadWtsModalOpen}
              />
            ) : (
              <></>
            )}
          </Hotkeys>
        </>
      )}
    </>
  );
}