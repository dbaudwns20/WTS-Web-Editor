"use client";

import "./style.css";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import Project, { bindProject } from "@/types/project";
import String from "@/types/string";
import { getLangTextByValue } from "@/types/language";

import StringList, { StringListType } from "./_string-list/string.list";
import StringEditor, { StringEditorType } from "./_string-editor/string.editor";
import UpdateProjectModal from "./_update-project-modal/update.project.modal";
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

  // string list component 에서 호출 용
  const handleUpdateString = async () => {
    await stringEditorRef.current?.updateString();
  };

  // 함수 호출 후 처리
  const completeFunction = (callbacks: Function) => {
    // 콜백함수 호출
    callbacks();
    // 프로젝트 재조회
    getProject();
  };

  useEffect(() => {
    if (isLoading) return;

    const projectInfoSectionHeight: number =
      projectInfoSectionRef.current!.clientHeight;
    const mainHeight: number = document.querySelector(".main")!.clientHeight;

    // string list section 높이 지정
    stringListRef.current!.componentElement!.style.height = `${
      mainHeight - projectInfoSectionHeight - 32 // -2rem
    }px`;
  }, [isLoading, stringListKey]);

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
              <div className="buttons">
                <button
                  type="button"
                  onClick={updateProject}
                  className="button is-info"
                >
                  UPDATE
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  className="button is-danger"
                >
                  REMOVE
                </button>
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
              handleUpdateString={handleUpdateString}
            />
            <StringEditor
              ref={stringEditorRef}
              projectId={projectId as string}
              stringGroup={stringGroup}
              setStringGroup={setStringGroup}
              isEdited={isEdited}
              setIsEdited={setIsEdited}
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
