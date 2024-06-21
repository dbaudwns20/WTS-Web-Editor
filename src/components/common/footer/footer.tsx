import Image from "next/image";

import "./style.css";

import Email from "@/assets/email.svg";
import Github from "@/assets/github.svg";
import User from "@/assets/user.svg";

export default function Footer() {
  const { CREATOR_EMAIL, GITHUB_REPO_LINK, GITHUB_LINK } = process.env;

  return (
    <footer className="main-footer">
      <nav className="navbar">
        <div className="links">
          <a href={`mailto:${CREATOR_EMAIL}`}>
            <Image src={Email} alt="Email" width={20} height={20} priority />
          </a>
          <a href={GITHUB_REPO_LINK} target="_blank">
            <Image src={Github} alt="Github" width={20} height={20} priority />
          </a>
          <a href={GITHUB_LINK} target="_blank">
            <Image src={User} alt="User" width={20} height={20} priority />
          </a>
        </div>
        <div>
          <span className="text-xs fill-gray-300">Created By Junim</span>
        </div>
      </nav>
    </footer>
  );
}
