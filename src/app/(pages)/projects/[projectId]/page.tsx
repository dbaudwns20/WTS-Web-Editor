"use client";

import "./style.css";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import Project from "@/types/project";
import String from "@/types/string";
import { getLangTextByValue } from "@/types/language";

import StringList, { StringListType } from "./_string-list/string.list";
import StringContent from "./_string-content/string.content";
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
  const stringContentSectionRef = useRef<HTMLDivElement>(null);
  const stringListRef = useRef<StringListType>(null);
  const stringContentRef = useRef(null);

  // values
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [project, setProject] = useState<Project | null>(null);
  const [stringGroup, setStringGroup] = useState<(String | null)[]>([]);
  const image: BgImage = getBgImageById(1);

  // 프로젝트 가져오기
  const getProject = async () => {
    setIsLoading(true);

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

    setProject(response.data);
    setIsLoading(false);
  };

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
      message: "삭제되었습니다",
      messageType: "success",
    });

    // 메인화면으로 이동
    router.push("/");
  };

  useEffect(() => {
    if (isLoading) return;

    const projectInfoSectionHeight: number = document.querySelector(
      ".project-info-section"
    )!.clientHeight;
    const mainHeight: number = document.querySelector(".main")!.clientHeight;

    // string content section 높이 지정
    stringContentSectionRef.current!.style.height = `${
      mainHeight - projectInfoSectionHeight - 32 // -2rem
    }px`;
  }, [isLoading]);

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
          <section className="project-info-section">
            <div className="wrapper">
              <div className="project-info">
                <figure className="image-wrapper">
                  <Image className="image" src={image.path} alt={image.name} />
                </figure>
                <div className="info-wrapper">
                  <p className="title">{project?.title}</p>
                  <div className="tag-group">
                    <span className="language">
                      {getLangTextByValue(project!.language)}
                    </span>
                    {project!.version ? (
                      <span className="version">v{project!.version}</span>
                    ) : (
                      <></>
                    )}
                    <span className="last-updated">
                      <span className="material-icons-outlined">history</span>
                      {convertDateToString(
                        project!.lastUpdated,
                        DATE_FORMAT.DATE_TIME
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-end gap-2">
                <button
                  type="button"
                  className="w-full bg-blue-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
                >
                  UPDATE
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  className="w-full bg-red-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
                >
                  REMOVE
                </button>
                <button
                  type="button"
                  className="w-full bg-sky-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
                >
                  UPLOAD
                </button>
                <button
                  type="button"
                  className="w-full bg-slate-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
                >
                  DOWNLOAD
                </button>
              </div>
            </div>
          </section>
          <section
            className="string-content-section"
            ref={stringContentSectionRef}
          >
            <StringList
              ref={stringListRef}
              projectId={projectId as string}
              setStringGroup={setStringGroup}
            />
            <StringContent
              ref={stringContentRef}
              projectId={projectId as string}
              stringGroup={stringGroup}
            />
          </section>
        </>
      )}
    </>
  );
}
