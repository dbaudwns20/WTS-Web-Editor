import { StaticImageData } from "next/image";

import OrcEp from "@/assets/campaign_backgrounds/orc_ep.jpeg";
import Human from "@/assets/campaign_backgrounds/human.jpeg";
import Undead from "@/assets/campaign_backgrounds/undead.jpeg";
import Orc from "@/assets/campaign_backgrounds/orc.jpeg";
import NightElf from "@/assets/campaign_backgrounds/night_elf.jpeg";
import NightElfEx from "@/assets/campaign_backgrounds/night_elf_ex.jpeg";
import HumanEx from "@/assets/campaign_backgrounds/human_ex.jpeg";
import UndeadEx from "@/assets/campaign_backgrounds/undead_ex.jpeg";
import OrcEx from "@/assets/campaign_backgrounds/orc_ex.jpeg";

export type DefaultImage = {
  id: number;
  path: StaticImageData;
  name: string;
  file: File;
};

const DEFAULT_IMAGES: DefaultImage[] = [
  {
    id: 1,
    path: OrcEp,
    name: "Prologue Campaign - Exodus of the Horde",
    file: new File([], "orc_ep.jpeg"),
  },
  {
    id: 2,
    path: Human,
    name: "Human Campaign - The Scourge of Lordaeron",
    file: new File([], "human.jpeg"),
  },
  {
    id: 3,
    path: Undead,
    name: "Undead Campaign - Path of the Damned",
    file: new File([], "undead.jpeg"),
  },
  {
    id: 4,
    path: Orc,
    name: "Orc Campaign - The Invasion of Kalimdor",
    file: new File([], "orc.jpeg"),
  },
  {
    id: 5,
    path: NightElf,
    name: "Night Elf Campaign - Eternity's End",
    file: new File([], "night_elf.jpeg"),
  },
  {
    id: 6,
    path: NightElfEx,
    name: "Sentinel Campaign - Terror of the Tides",
    file: new File([], "night_elf_ex.jpeg"),
  },
  {
    id: 7,
    path: HumanEx,
    name: "Alliance Campaign - Curse of the Blood Elves",
    file: new File([], "human_ex.jpeg"),
  },
  {
    id: 8,
    path: UndeadEx,
    name: "Scourge Campaign - Legacy of the Damned",
    file: new File([], "undead_ex.jpeg"),
  },
  {
    id: 9,
    path: OrcEx,
    name: "Bonus Campaign - The Founding of Durotar",
    file: new File([], "orc_ex.jpeg"),
  },
];

export function getDefaultImageById(id: number): DefaultImage | undefined {
  if (id > 9) id = 1;
  return DEFAULT_IMAGES.find((it) => it.id === id);
}
