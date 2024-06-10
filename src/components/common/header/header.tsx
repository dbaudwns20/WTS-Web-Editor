import Image from "next/image";
import { Link } from "@/navigation";

import W3 from "@/assets/warcraft-iii.svg";
import Banner from "@/assets/banner.svg";

import LocaleSelect from "@/components/common/locale-select/locale.select";

import "./style.css";

type HeaderProps = {};

export default function Header(props: HeaderProps) {
  const {} = props;

  return (
    <header className="main-header">
      <nav className="navbar">
        <Link className="logo" href="/">
          <Image src={W3} alt="w3" width={45} priority />
          <Image src={Banner} alt="banner" width={180} priority />
        </Link>
        <LocaleSelect />
      </nav>
    </header>
  );
}
