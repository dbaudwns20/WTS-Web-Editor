import { IProject } from "@/db/models/project";
import ProjectImage, { bindProjectImage } from "./project.image";

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
    this.createdAt = new Date(project.createdAt);
    this.updatedAt = new Date(project.updatedAt);
  }
}

export function bindProject(project: IProject): Project {
  return new Project(project);
}

export function bindProjectList(projects: IProject[]): Project[] {
  return projects.map((instance) => bindProject(instance));
}
