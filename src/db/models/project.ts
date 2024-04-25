import mongoose, { models, Schema } from "mongoose";

export interface IProject {
  _id: string;
  title: string;
  language: number;
  process: string;
  version: string;
  lastModifiedStringNumber: number;
  dateCreated: Date;
  lastUpdated: Date;
}

const ProjectSchema: Schema<IProject> = new Schema({
  title: {
    type: String,
    required: true,
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
  },
  lastModifiedStringNumber: {
    type: Number,
    default: -1,
  },
  dateCreated: {
    type: Date,
    default: new Date(),
  },
  lastUpdated: {
    type: Date,
    default: new Date(),
  },
});

// title & lang unique index
ProjectSchema.index({ title: 1, lang: 1 }, { unique: true });

const ProjectModel =
  models?.Project || mongoose.model("Project", ProjectSchema);

export default ProjectModel;
