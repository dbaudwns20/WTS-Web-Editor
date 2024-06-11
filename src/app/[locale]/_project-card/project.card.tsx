import { forwardRef, useImperativeHandle } from "react";
import Image from "next/image";

import "./style.css";

import type Project from "@/types/project";
import { getLocaleTextByValue } from "@/types/locale";

import { useFormatter, useTranslations } from "next-intl";

type ProjectProps = {
  project: Project;
};

const ProjectCard = forwardRef((props: ProjectProps, ref) => {
  const { project } = props;

  useImperativeHandle(ref, () => {});

  const t = useTranslations("MAIN.PROJECT_CARD");
  const format = useFormatter();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // values
  const isCompleted: boolean = project.process === "100.0" ? true : false;

  return (
    <article className="project">
      {isCompleted ? <span className="complete">{t("COMPLETE")}</span> : <></>}
      <Image
        className="image"
        src={project.projectImage.url}
        alt={project.projectImage.pathname}
        priority={true}
        width={500}
        height={500}
      />
      <div className="project-content">
        <p className="title">{project.title}</p>
        <div className="project-content-between">
          <div className="tag-group">
            <span className="locale">
              {getLocaleTextByValue(project.locale)}
            </span>
            {project.version ? (
              <span className="version">{"v" + project.version}</span>
            ) : (
              <></>
            )}
          </div>
          <p className="date-created">
            <span className="material-icons-outlined">schedule</span>
            {format.dateTime(project.createdAt, {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: timezone,
            })}
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
              <p className="percent">{t("COMPLETE")}</p>
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
