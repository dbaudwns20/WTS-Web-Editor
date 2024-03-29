import { IProject } from "@/db/models/project";

export default class Project {
  id: string;
  title: string;
  lang: number;
  process: number;
  lastModifiedId: string | null;
  dateCreated: Date;
  lastUpdated: Date;

  constructor(project: IProject) {
    this.id = project._id;
    this.title = project.title;
    this.lang = project.lang;
    this.process = project.process;
    this.lastModifiedId = project.lastModifiedId;
    this.dateCreated = project.dateCreated;
    this.lastUpdated = project.lastUpdated;
  }
}

export function bindProject(project: IProject): Project {
  return new Project(project);
}

export function bindProjectList(projects: IProject[]): Project[] {
  return projects.map((project) => bindProject(project));
}
