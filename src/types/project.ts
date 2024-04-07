import { IProject } from "@/db/models/project";

export default class Project {
  id: string;
  title: string;
  language: number;
  process: number;
  version: string | null;
  dateCreated: Date;
  lastUpdated: Date;

  constructor(project: IProject) {
    this.id = project._id;
    this.title = project.title;
    this.language = project.language;
    this.process = project.process;
    this.version = project.version;
    this.dateCreated = new Date(project.dateCreated);
    this.lastUpdated = new Date(project.dateCreated);
  }
}

export function bindProject(project: IProject): Project {
  return new Project(project);
}

export function bindProjectList(projects: IProject[]): Project[] {
  return projects.map((project) => bindProject(project));
}
