import { IProjectImage } from "@/db/models/project.image";

export default class ProjectImage {
  id: string;
  pathname: string;
  url: string;
  downloadUrl: string;
  contentType: string;
  createdAt: Date;

  constructor(projectImage: IProjectImage) {
    this.id = projectImage._id;
    this.pathname = projectImage.pathname;
    this.url = projectImage.url;
    this.downloadUrl = projectImage.downloadUrl;
    this.contentType = projectImage.contentType;
    this.createdAt = new Date(projectImage.createdAt);
  }
}

export function bindProjectImage(projectImage: IProjectImage): ProjectImage {
  return new ProjectImage(projectImage);
}
