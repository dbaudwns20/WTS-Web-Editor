"use client";

import { useEffect, useState } from "react";
import Project, { bindProjects } from "@/types/project";
import { getLangTextByValue } from "@/types/lang";

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
      setProjectList(bindProjects(await response.json()));
    } catch (error) {
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
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-10 my-10 py-10">
      {projectList.map((project: Project) => {
        return (
          <article
            className="rounded-2xl shadow-lg h-48 w-full p-8"
            key={project.id}
          >
            <p className="text-2xl font-bold text-gray-500">{project.title}</p>
            <div className="flex justify-between">
              <p className="text-gray-500">
                {getLangTextByValue(project.lang)}
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
