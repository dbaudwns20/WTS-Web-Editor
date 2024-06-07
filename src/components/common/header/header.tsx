import Image from "next/image";
import Link from "next/link";

import Logo_2 from "@/assets/banner.png";
import W3 from "@/assets/warcraft-iii.png";

import "./style.css";

export default function Header() {
  return (
    <header className="main-header">
      <nav className="navbar">
        <Link className="logo" href="/">
          <Image src={W3} alt="logo_main" width={45} priority />
          <Image src={Logo_2} alt="logo_main" width={170} priority />
        </Link>
        <button type="button" className="language-button">
          <span>한국어</span>
          <span className="icon">
            <i className="material-icons">expand_more</i>
          </span>
        </button>
      </nav>
    </header>
  );
}
