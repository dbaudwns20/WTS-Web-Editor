import mongoose, { models, Schema } from "mongoose";

import { emptyToNull } from "@/utils/common";
import { IProjectImage } from "./project.image";

export interface IProject {
  _id: string;
  title: string;
  language: number;
  process: string;
  version: string | null;
  lastModifiedStringNumber: number;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
  projectImage: IProjectImage;
}

const ProjectSchema: Schema<IProject> = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 200,
    trim: true,
  },
  language: {
    type: Number,
    required: true,
  },
  process: {
    type: String,
    default: "0",
  },
  version: {
    type: String,
    default: null,
    set: emptyToNull,
    maxlength: 10,
    trim: true,
  },
  lastModifiedStringNumber: {
    type: Number,
    default: -1,
  },
  source: {
    type: String,
    default: null,
    set: emptyToNull,
    maxlength: 100,
    trim: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
  projectImage: {
    type: Schema.Types.ObjectId,
    ref: "ProjectImage",
    required: true,
  },
});

// title & lang unique index
ProjectSchema.index({ title: 1, lang: 1 }, { unique: true });

const ProjectModel =
  models?.Project || mongoose.model("Project", ProjectSchema);

export default ProjectModel;
