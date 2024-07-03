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
          <W3 width={45} height={45} />
          <Banner width={180} height={38.14} />
        </Link>
        <LocaleSelect />
      </nav>
    </header>
  );
}
