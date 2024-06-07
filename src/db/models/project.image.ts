import mongoose, { models, Schema } from "mongoose";

export interface IProjectImage {
  _id: string;
  pathname: string;
  url: string;
  downloadUrl: string;
  contentType: string;
  createdAt: Date;
}

const ProjectImageSchema: Schema<IProjectImage> = new Schema({
  pathname: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  downloadUrl: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

// title & lang unique index
ProjectImageSchema.index(
  { url: 1, pathname: 1, contentType: 1 },
  { unique: true }
);

const ProjectImageModel =
  models?.ProjectImage || mongoose.model("ProjectImage", ProjectImageSchema);

export default ProjectImageModel;
