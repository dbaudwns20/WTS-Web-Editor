import { IString } from "@/db/models/string";

export default class String {
  projectId: string;
  stringNumber: number;
  originalText: string;
  translatedText: string;
  comment: string | null;
  isCompleted: boolean;
  lastUpdated: Date;

  constructor(string: IString) {
    this.projectId = string.projectId;
    this.stringNumber = string.stringNumber;
    this.originalText = string.originalText;
    this.translatedText = string.translatedText;
    this.comment = string.comment;
    this.isCompleted = string.isCompleted;
    this.lastUpdated = string.lastUpdated;
  }
}
