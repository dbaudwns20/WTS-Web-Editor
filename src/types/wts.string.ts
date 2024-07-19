type WtsString = {
  stringNumber: number;
  comment: string | null;
  content: string;
};

export class TranslatedText {
  stringNumber: number;
  translatedText: string;
  completedAt: Date;
  projectId: string;
  projectTitle: string;

  constructor(instance: any) {
    this.stringNumber = instance.stringNumber;
    this.translatedText = instance.translatedText;
    this.completedAt = new Date(instance.completedAt);
    this.projectId = instance.projectId;
    this.projectTitle = instance.projectTitle;
  }
}

export function bindTranslatedTextList(instance: any[]): TranslatedText[] {
  return instance.map((it) => new TranslatedText(it));
}

export function bindTranslatedText(instance: any): TranslatedText {
  return new TranslatedText(instance);
}

export default WtsString;
