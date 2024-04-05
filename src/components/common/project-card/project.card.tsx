import {
  forwardRef,
  useRef,
  useImperativeHandle,
  MouseEvent,
  useState,
} from "react";
import Image from "next/image";

import "./style.css";

import { getLangTextByValue } from "@/types/language";
import { type BgImage, getRandomBgImage } from "./background.image";

import { convertDateToString } from "@/utils/common";
import type Project from "@/types/project";

type ProjectProps = {
  project: Project;
  onDeleteProject: (projectId: string) => void;
};

const ProjectCard = forwardRef((props: ProjectProps, ref) => {
  const { project, onDeleteProject } = props;

  useImperativeHandle(ref, () => {});

  const projectRef = useRef<HTMLDivElement>(null);

  // values
  const [bgImage, setBgImage] = useState<BgImage>(getRandomBgImage());
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleDeleteProject = (
    event: MouseEvent<HTMLButtonElement>,
    projectId: string
  ) => {
    event.stopPropagation();

    onDeleteProject(projectId);
  };

  return (
    <article ref={projectRef} className="project">
      {isCompleted ? <span className="complete">COMPLETE</span> : <></>}
      <Image className="image" src={bgImage?.path} alt={bgImage?.name} />
      <div className="project-content">
        <p className="title">{project.title}</p>
        <div className="project-content-between">
          <div className="tag-group">
            <span className="language">
              {getLangTextByValue(project.language)}
            </span>
            {project.version ? (
              <span className="version">v{project.version}</span>
            ) : (
              <></>
            )}
          </div>
          <p className="date-created">
            <span className="material-icons-outlined">schedule</span>
            {convertDateToString(project.dateCreated)}
          </p>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-md">
          <div className="bg-primary p-0.5 text-center text-xs font-medium leading-none text-primary-100">
            25%
          </div>
        </div>
      </div>
    </article>
  );
});

ProjectCard.displayName = "Project";
export default ProjectCard;
