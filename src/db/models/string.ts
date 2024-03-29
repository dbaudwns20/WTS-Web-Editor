import mongoose, { models, Schema } from "mongoose";

export interface IString {
  _id: string;
  projectId: string;
  title: string;
  content: string;
  lang: number;
  isCompleted: boolean;
}
