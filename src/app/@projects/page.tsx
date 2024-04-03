"use client";

import { useEffect, useState } from "react";

import Project, { bindProjectList } from "@/types/project";
import { getLangTextByValue } from "@/types/language";

import { showNotificationMessage } from "@/utils/message";

export default function ProjectSection() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getProjectList();
  }, []);

  const getProjectList = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/projects");
      setProjectList(bindProjectList(await response.json()));
    } catch (error) {
      // TODO Error Handling
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      await fetch("/api/projects/" + projectId, {
        method: "DELETE",
      });
      getProjectList();
    } catch (error) {
      // TODO Error Handling
      console.log(error);
    } finally {
      setIsLoading(false);
      showNotificationMessage({
        message: "프로젝트가 삭제되었습니다",
        messageType: "success",
      });
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-10 mb-10">
      {projectList.map((project: Project) => {
        return (
          <article
            className="rounded-2xl shadow-lg h-48 w-full p-8"
            key={project.id}
          >
            <p className="text-2xl font-bold text-gray-500">{project.title}</p>
            <div className="flex justify-between">
              <p className="text-gray-500">
                {getLangTextByValue(project.language)}
              </p>
            </div>
            <button
              className="bg-red-300 hover:bg-red-500"
              type="button"
              onClick={(e) => deleteProject(project.id)}
            >
              DELETE
            </button>
          </article>
        );
      })}
    </section>
  );
}
