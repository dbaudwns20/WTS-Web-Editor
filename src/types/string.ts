import { IString } from "@/db/models/string";

export default class String {
  id: string;
  projectId: string;
  stringNumber: number;
  originalText: string;
  translatedText: string;
  comment: string | null;
  isCompleted: boolean;
  lastUpdated: Date;

  constructor(string: IString) {
    this.id = string._id;
    this.projectId = string.projectId;
    this.stringNumber = string.stringNumber;
    this.originalText = string.originalText;
    this.translatedText = string.translatedText;
    this.comment = string.comment;
    this.isCompleted = string.isCompleted;
    this.lastUpdated = string.lastUpdated;
  }
}

export function bindString(string: IString): String {
  return new String(string);
}

export function bindStringList(strings: IString[]): String[] {
  return strings.map((instance) => bindString(instance));
}
