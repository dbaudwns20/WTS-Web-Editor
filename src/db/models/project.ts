import mongoose, { models, Schema } from "mongoose";

export interface IProject {
  _id: string;
  title: string;
  lang: number;
  process: number;
  lastModifiedId: string | null;
  version: string | null;
  dateCreated: Date;
  lastUpdated: Date;
}

const ProjectSchema: Schema<IProject> = new Schema({
  title: {
    type: String,
    required: true,
  },
  lang: {
    type: Number,
    required: true,
  },
  process: {
    type: Number,
    default: 0,
  },
  lastModifiedId: {
    type: String,
    default: null,
  },
  version: {
    type: String,
    default: null,
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
