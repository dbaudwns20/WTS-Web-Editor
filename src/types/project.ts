import { IProject } from "@/db/models/project";

export default class Project {
  id: string;
  title: string;
  language: number;
  process: string | null;
  version: string | null;
  source: string;
  lastModifiedStringNumber: number;
  dateCreated: Date;
  lastUpdated: Date;

  constructor(project: IProject) {
    this.id = project._id;
    this.title = project.title;
    this.language = project.language;
    this.process = project.process;
    this.version = project.version;
    this.source = project.source;
    this.lastModifiedStringNumber = project.lastModifiedStringNumber;
    this.dateCreated = new Date(project.dateCreated);
    this.lastUpdated = new Date(project.lastUpdated);
  }
}

export function bindProject(project: IProject): Project {
  return new Project(project);
}

export function bindProjectList(projects: IProject[]): Project[] {
  return projects.map((instance) => bindProject(instance));
}
