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

export type BgImage = {
  id: number;
  path: StaticImageData;
  name: string;
};

const BackgroundImages: BgImage[] = [
  {
    id: 1,
    path: OrcEp,
    name: "Orc EP",
  },
  {
    id: 2,
    path: Human,
    name: "Human",
  },
  {
    id: 3,
    path: Undead,
    name: "Undead",
  },
  {
    id: 4,
    path: Orc,
    name: "Orc",
  },
  {
    id: 5,
    path: NightElf,
    name: "Night Elf",
  },
  {
    id: 6,
    path: NightElfEx,
    name: "Night Elf EX",
  },
  {
    id: 7,
    path: HumanEx,
    name: "Human EX",
  },
  {
    id: 8,
    path: UndeadEx,
    name: "Undead EX",
  },
  {
    id: 9,
    path: OrcEx,
    name: "Orc EX",
  },
];

export function getRandomBgImage(): BgImage {
  return BackgroundImages[Math.floor(Math.random() * BackgroundImages.length)];
}
