import { IProject } from "@/db/models/project";

export default class Project {
  id: string;
  title: string;
  language: number;
  process: number;

  constructor(project: IProject) {
    this.id = project._id;
    this.title = project.title;
    this.language = project.language;
    this.process = project.process;
  }
}

export function bindProject(project: IProject): Project {
  return new Project(project);
}

export function bindProjectList(projects: IProject[]): Project[] {
  return projects.map((project) => bindProject(project));
}
