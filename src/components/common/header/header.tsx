import Image from "next/image";

import Logo_2 from "@/assets/banner.png";
import W3 from "@/assets/warcraft-iii.png";

import "./style.css";

export default function Header() {
  return (
    <header className="main-header">
      <nav className="navbar">
        <a className="logo" href="/">
          <Image src={W3} alt="logo_main" width={35} priority />
          <Image src={Logo_2} alt="logo_main" width={150} priority />
        </a>
        <div className="w-[120px] bg-gray-200 rounded-xl flex items-center justify-between text-sm text-slate-600 py-1.5 px-3">
          <span>한국어</span>
          <span className="icon">
            <i className="material-icons">expand_more</i>
          </span>
        </div>
      </nav>
    </header>
  );
}
