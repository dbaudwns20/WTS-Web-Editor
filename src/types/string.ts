import { IString } from "@/db/models/string";

export default class String {
  id: string;
  projectId: string;
  stringNumber: number;
  originalText: string;
  translatedText: string;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;

  constructor(string: IString) {
    this.id = string._id;
    this.projectId = string.projectId;
    this.stringNumber = string.stringNumber;
    this.originalText = string.originalText;
    this.translatedText = string.translatedText;
    this.comment = string.comment;
    this.createdAt = new Date(string.createdAt);
    this.updatedAt = new Date(string.updatedAt);
    this.completedAt = string.completedAt ? new Date(string.completedAt) : null;
  }
}

export function bindString(string: IString): String {
  return new String(string);
}

export function bindStringList(strings: IString[]): String[] {
  return strings.map((instance) => bindString(instance));
}
