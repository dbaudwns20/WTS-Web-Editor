import { IProject } from "@/db/models/project";
import ProjectImage, { bindProjectImage } from "./project.image";

import moment from "moment";

export default class Project {
  id: string;
  title: string;
  locale: number;
  process: string;
  version: string | null;
  source: string | null;
  lastModifiedStringNumber: number;
  projectImage: ProjectImage;
  createdAt: Date;
  updatedAt: Date;

  constructor(project: IProject) {
    this.id = project._id;
    this.title = project.title;
    this.locale = project.locale;
    this.process = project.process;
    this.version = project.version;
    this.source = project.source;
    this.lastModifiedStringNumber = project.lastModifiedStringNumber;
    this.projectImage = bindProjectImage(project.projectImage);
    this.createdAt = moment.utc(project.createdAt).toDate();
    this.updatedAt = moment.utc(project.updatedAt).toDate();
  }
}

export function bindProject(project: IProject): Project {
  return new Project(project);
}

export function bindProjectList(projects: IProject[]): Project[] {
  return projects.map((instance) => bindProject(instance));
}
