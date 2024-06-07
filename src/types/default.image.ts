export type DefaultImage = {
  id: number;
  url: string;
  name: string;
  file: File;
};

const DEFAULT_IMAGES: DefaultImage[] = [
  {
    id: 1,
    url: "https://c35dbgh5rquhetbl.public.blob.vercel-storage.com/orc_ep-VrRIQtYx7CBQsb7jNMEpQwz3jU7OLq.jpeg",
    name: "Prologue Campaign - Exodus of the Horde",
    file: new File([], "orc_ep.jpeg", { type: "image/jpeg" }),
  },
  {
    id: 2,
    url: "https://c35dbgh5rquhetbl.public.blob.vercel-storage.com/human-FbnvSXpvSssnzj20vL11qHEHodqJYN.jpeg",
    name: "Human Campaign - The Scourge of Lordaeron",
    file: new File([], "human.jpeg", { type: "image/jpeg" }),
  },
  {
    id: 3,
    url: "https://c35dbgh5rquhetbl.public.blob.vercel-storage.com/undead-ydB8yEl1ReeG473umd00x8iLDaipLK.jpeg",
    name: "Undead Campaign - url of the Damned",
    file: new File([], "undead.jpeg", { type: "image/jpeg" }),
  },
  {
    id: 4,
    url: "https://c35dbgh5rquhetbl.public.blob.vercel-storage.com/orc-qUb18F7HhXOIQfnCE7iAqoZ9Ip6tLb.jpeg",
    name: "Orc Campaign - The Invasion of Kalimdor",
    file: new File([], "orc.jpeg", { type: "image/jpeg" }),
  },
  {
    id: 5,
    url: "https://c35dbgh5rquhetbl.public.blob.vercel-storage.com/night_elf-guMItLuCuXgCLjUGoTmJXqy6zykIed.jpeg",
    name: "Night Elf Campaign - Eternity's End",
    file: new File([], "night_elf.jpeg", { type: "image/jpeg" }),
  },
  {
    id: 6,
    url: "https://c35dbgh5rquhetbl.public.blob.vercel-storage.com/night_elf_ex-E31MKPwUivdU0WreQtG0ZdLpSIFEip.jpeg",
    name: "Sentinel Campaign - Terror of the Tides",
    file: new File([], "night_elf_ex.jpeg", { type: "image/jpeg" }),
  },
  {
    id: 7,
    url: "https://c35dbgh5rquhetbl.public.blob.vercel-storage.com/human_ex-aBDRDAOy5364Rzw7FS9s3To06g41dZ.jpeg",
    name: "Alliance Campaign - Curse of the Blood Elves",
    file: new File([], "human_ex.jpeg", { type: "image/jpeg" }),
  },
  {
    id: 8,
    url: "https://c35dbgh5rquhetbl.public.blob.vercel-storage.com/undead_ex-OgoMG7c10Tw83N2K9DF30lCJxhOor1.jpeg",
    name: "Scourge Campaign - Legacy of the Damned",
    file: new File([], "undead_ex.jpeg", { type: "image/jpeg" }),
  },
  {
    id: 9,
    url: "https://c35dbgh5rquhetbl.public.blob.vercel-storage.com/orc_ex-VgYOVXLBOnEByk8mCb0dxPPDp4zCwo.jpeg",
    name: "Bonus Campaign - The Founding of Durotar",
    file: new File([], "orc_ex.jpeg", { type: "image/jpeg" }),
  },
];

export function getDefaultImageById(id: number): DefaultImage | undefined {
  return DEFAULT_IMAGES.find((it) => it.id === id);
}

export function getDefaultImageByFileNameAndType(
  fileName: string,
  type: string
): DefaultImage | undefined {
  return DEFAULT_IMAGES.find(
    (it) => it.file.name === fileName && it.file.type === type
  );
}

export function checkDefaultImage(
  url: string,
  fileName: string,
  type: string
): boolean {
  return DEFAULT_IMAGES.some(
    (it) => it.url === url && it.file.name === fileName && it.file.type === type
  );
}
