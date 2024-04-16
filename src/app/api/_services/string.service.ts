import StringModel from "@/db/models/string";

export async function getStringList(projectId: string) {
  const instance = await StringModel.find({ projectId: projectId });
  return instance;
}

export async function getString(projectId: string, stringId: string) {
  const instance = await StringModel.find({
    projectId: projectId,
    _id: stringId,
  });
  if (!instance) throw new Error("instance not found");
  return instance;
}
