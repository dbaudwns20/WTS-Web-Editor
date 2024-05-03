"use client";

import "./style.css";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import Project from "@/types/project";
import String from "@/types/string";
import { getLangTextByValue } from "@/types/language";

import StringList from "./_string-list/string.list";
import StringContent from "./_string-content/string.content";
import {
  BgImage,
  getBgImageById,
} from "@/app/(pages)/_project-card/background.image";

import { showNotificationMessage } from "@/utils/message";
import { callApi, convertDateToString, DATE_FORMAT } from "@/utils/common";

export default function ProjectDetail() {
  // params
  const { projectId } = useParams();
  // router
  const router = useRouter();

  // values
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [project, setProject] = useState<Project | null>(null);
  const [currentString, setCurrentString] = useState<String | null>(null);
  const image: BgImage = getBgImageById(2);

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

  // 프로젝트 삭제
  const deleteProject = async () => {
    if (confirm("Are you sure?")) {
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
    }
  };

  useEffect(() => {
    getProject();
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
                  </div>
                  <p className="last-updated">
                    <span className="material-icons-outlined">history</span>
                    {convertDateToString(
                      project!.lastUpdated,
                      DATE_FORMAT.DATE_TIME
                    )}
                  </p>
                </div>
              </div>
              <div className="flex justify-center items-end gap-2">
                <button
                  type="button"
                  className="w-full bg-blue-500 p-2 rounded-lg text-white font-semibold h-fit text-sm"
                >
                  EDIT
                </button>
                <button
                  type="button"
                  onClick={deleteProject}
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
          <section className="string-content-section">
            <StringList
              projectId={projectId as string}
              setCurrentString={setCurrentString}
            />
            <StringContent
              projectId={projectId as string}
              currentString={currentString}
            />
          </section>
        </>
      )}
    </>
  );
}
