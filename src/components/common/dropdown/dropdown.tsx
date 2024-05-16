import {
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import "./style.css";

type DropdownProps = {
  children: ReactNode[];
  position?: "left" | "right" | "center";
  isUp?: boolean;
};

const Dropdown = forwardRef((props: DropdownProps, ref: any) => {
  const { children, position = "left", isUp = false } = props;

  // values
  const [dropdownTrigger, dropdownMenu] = children;
  const [dropdownMenuClass, setDropdownMenuClass] = useState<string>("");

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    setDropdownMenuClass(`dropdown-menu is-${position} ${isUp ? "is-up" : ""}`);
  }, [position, isUp]);

  return (
    <div className="dropdown">
      {/* { 트리거 영역 } */}
      {dropdownTrigger}
      {/* { 메뉴 영역 } */}
      <div id="dropdown-menu" className={dropdownMenuClass} role="menu">
        {dropdownMenu}
      </div>
    </div>
  );
});

Dropdown.displayName = "Dropdown";
export default Dropdown;
