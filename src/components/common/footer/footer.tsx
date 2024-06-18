import Image from "next/image";
import { Link } from "@/navigation";

import LocaleSelect from "@/components/common/locale-select/locale.select";

import W3 from "@/assets/warcraft-iii.svg";
import Banner from "@/assets/banner.svg";

import "./style.css";

export default function Footer() {
  return (
    <footer className="main-footer">
      <nav className="navbar">
        <Link className="w-full flex items-center" href="/">
          <Image src={W3} alt="w3" width={30} priority />
          <Image src={Banner} alt="banner" width={120} priority />
        </Link>
        <p className="w-full text-end text-sm">medjed8181@gmail.com</p>
      </nav>
      <hr className="border-gray-200 mx-auto" />
      <nav className="navbar">
        <LocaleSelect />
      </nav>
    </footer>
  );
}
