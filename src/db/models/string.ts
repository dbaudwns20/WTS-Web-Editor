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
   * 완료여부
   */
  isCompleted: boolean;

  /**
   * 최종수정일자
   */
  lastUpdated: Date;
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
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  lastUpdated: {
    type: Date,
    default: new Date(),
  },
});

const StringModel = models?.String || mongoose.model("String", StringSchema);

export default StringModel;
