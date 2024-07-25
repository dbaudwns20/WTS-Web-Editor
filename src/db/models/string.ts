import mongoose, { models, Schema } from "mongoose";

export interface IString {
  /**
   * object id
   */
  _id: string;

  /**
   * 프로젝트 id (References)
   */
  projectId: string;

  /**
   * string number (unique)
   */
  stringNumber: number;

  /**
   * 원본텍스트
   */
  originalText: string;

  /**
   * 번역된텍스트
   */
  translatedText: string;

  /**
   * 주석
   */
  comment: string | null;

  /**
   * 생성일
   */
  createdAt: Date;

  /**
   * 수정일
   */
  updatedAt: Date | null;

  /**
   * 완료일
   */
  completedAt: Date | null;
}

const StringSchema: Schema<IString> = new Schema({
  projectId: {
    type: String,
    ref: "Project",
    required: true,
  },
  stringNumber: {
    type: Number,
    required: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  translatedText: {
    type: String,
    default: "",
  },
  comment: {
    type: String,
    default: null,
    maxlength: 500,
    trim: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

const StringModel = models?.String || mongoose.model("String", StringSchema);

export default StringModel;
