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
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import Project, { bindProject } from "@/types/project";
import String from "@/types/string";
import { getLangTextByValue } from "@/types/language";

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

import StringList, { StringListType } from "./_string-list/string.list";
import StringEditor, { StringEditorType } from "./_string-editor/string.editor";
import UpdateProjectModal from "./_update-project-modal/update.project.modal";
import Dropdown from "@/components/common/dropdown/dropdown";
import {
  BgImage,
  getBgImageById,
} from "@/app/(pages)/_project-card/background.image";

import { showNotificationMessage, showConfirmMessage } from "@/utils/message";
import { callApi, convertDateToString, DATE_FORMAT } from "@/utils/common";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [stringGroup, setStringGroup] = useState<(String | null)[]>([]);
  const image: BgImage = getBgImageById(1);

  // 레이아웃 reducer
  const [layoutState, layoutDispatch] = useReducer<
    Reducer<LayoutState, LayoutAction>
  >(layoutReducer, layoutInitState);
  // 옵션 reducer
  const [preferenceState, preferenceDispatch] = useReducer<
    Reducer<PreferenceState, PreferenceAction>
  >(preferenceReducer, preferenceInitState);

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

  // 프로젝트 업데이트
  const updateProject = () => setIsModalOpen(true);

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
    // string content 높이 재조정
    setStringContentSectionHeight();
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <section ref={projectInfoSectionRef} className="project-info-section">
            <div className="project-info-wrapper">
              <div className="project-info">
                <figure className="image-wrapper">
                  <Image className="image" src={image.path} alt={image.name} />
                </figure>
                <div className="info-wrapper">
                  <p className="title">{project?.title}</p>
                  <div className="tag-group">
                    <span className="tag language">
                      {getLangTextByValue(project!.language)}
                    </span>
                    {project!.version ? (
                      <span className="tag version">v{project!.version}</span>
                    ) : (
                      <></>
                    )}
                    <span className="tag updated-at">
                      <span className="icon">
                        <i className="material-icons md-18">history</i>
                      </span>
                      <span className="text-sm font-semibold">
                        {convertDateToString(
                          project!.updatedAt,
                          DATE_FORMAT.DATE_TIME
                        )}
                      </span>
                    </span>
                  </div>
                  {project?.source ? (
                    <a
                      className="resource-link"
                      href={project!.source!}
                      target="_blank"
                    >
                      <span className="tag resource">
                        <span className="icon">
                          <i className="material-icons md-18">link</i>
                        </span>
                        <span className="text-sm font-semibold">
                          Resource Link
                        </span>
                      </span>
                    </a>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className="functions">
                <Dropdown position="right">
                  <a className="more-button">
                    <span className="icon">
                      <i className="material-icons !text-3xl">more_vert</i>
                    </span>
                  </a>
                  <ul className="w-[180px] py-1.5 px-2">
                    <li className="hover:bg-gray-100 duration-200">
                      <a
                        className="anchor-has-icon undraggable !py-2 !pl-2 !pr-3 !text-sm"
                        onClick={updateProject}
                      >
                        <span className="icon mr-1.5">
                          <i className="material-icons md-18">edit</i>
                        </span>
                        <span>Update</span>
                      </a>
                    </li>
                    <li className="hover:bg-gray-100 duration-200">
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
                    <li className="hover:bg-gray-100 duration-200">
                      <a
                        className="anchor-has-icon undraggable !py-2 !pl-2 !pr-3 !text-sm"
                        onClick={handleDeleteProject}
                      >
                        <span className="icon mr-1.5">
                          <i className="material-icons md-18">file_upload</i>
                        </span>
                        <span>Patch WTS</span>
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
              handleResetScroll={handleResetScroll}
              completeFunction={completeFunction}
            />
          </section>
          {isModalOpen ? (
            <UpdateProjectModal
              project={project!}
              setStringListKey={setStringListKey}
              completeFunction={completeFunction}
              closeModal={setIsModalOpen}
            />
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
}
