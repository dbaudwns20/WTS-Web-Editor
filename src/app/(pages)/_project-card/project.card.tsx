import { forwardRef, useImperativeHandle, useMemo } from "react";
import Image from "next/image";

import "./style.css";

import { getLangTextByValue } from "@/types/language";
import { type BgImage, getRandomBgImage } from "./background.image";

import { convertDateToString } from "@/utils/common";
import type Project from "@/types/project";

type ProjectProps = {
  project: Project;
};

const ProjectCard = forwardRef((props: ProjectProps, ref) => {
  const { project } = props;

  useImperativeHandle(ref, () => {});

  // values
  const bgImage: BgImage = useMemo(() => getRandomBgImage(), []);
  const isCompleted: boolean = project.process === "100" ? true : false;

  return (
    <article className="project">
      {isCompleted ?? <span className="complete">COMPLETE</span>}
      <Image className="image" src={bgImage?.path} alt={bgImage?.name} />
      <div className="project-content">
        <p className="title">{project.title}</p>
        <div className="project-content-between">
          <div className="tag-group">
            <span className="language">
              {getLangTextByValue(project.language)}
            </span>
            {project.version ? (
              <span className="version">{"v" + project.version}</span>
            ) : (
              <></>
            )}
          </div>
          <p className="date-created">
            <span className="material-icons-outlined">schedule</span>
            {convertDateToString(project.lastUpdated)}
          </p>
        </div>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={Number(project.process)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {isCompleted ? (
            <>
              <p className="percent">COMPLETE</p>
              <div className="progress is-completed"></div>
            </>
          ) : (
            <>
              <p className="percent">{project.process}%</p>
              {project.process === "0" ? (
                <div className="progress"></div>
              ) : (
                <div
                  className="progress is-proceeding"
                  style={{
                    width: `${project.process}%`,
                  }}
                ></div>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
});

ProjectCard.displayName = "Project";
export default ProjectCard;
