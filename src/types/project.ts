import { IProject } from "@/db/models/project";

export default class Project {
  id: string;
  title: string;
  language: number;
  process: string;
  version: string | null;
  source: string | null;
  imageUrl: string;
  lastModifiedStringNumber: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(project: IProject) {
    this.id = project._id;
    this.title = project.title;
    this.language = project.language;
    this.process = project.process;
    this.version = project.version;
    this.source = project.source;
    this.imageUrl = project.imageUrl;
    this.lastModifiedStringNumber = project.lastModifiedStringNumber;
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
