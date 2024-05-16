import {
  ReactNode,
  ReactElement,
  cloneElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from "react";

import "./style.css";

type DropdownProps = {
  children: ReactNode[];
  position?: "left" | "right" | "center";
  isUp?: boolean;
};

export type DropdownType = {};

const Dropdown = forwardRef((props: DropdownProps, ref: any) => {
  const { children, position = "left", isUp = false } = props;

  // values
  const [dropdownTrigger, dropdownMenu] = children;
  const [dropdownMenuClass, setDropdownMenuClass] = useState<string>("");
  const [isOver, setIsOver] = useState<boolean>(false);

  // refs
  const dropdownTriggerRef = useRef<HTMLElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const dropdownMenuContent = useRef<HTMLElement>(null);

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({}));

  const closeDropdownMenu = () => {
    // 마우스 오버 상태가 아니라면
    if (!isOver) {
      // is-active -> is-hiding 변경
      dropdownMenuRef.current?.classList.replace("is-active", "is-hiding");
      setTimeout(() => {
        // 0.2초 후 제거
        dropdownMenuRef.current?.classList.remove("is-hiding");
      }, 200);
    }
  };

  const handleDropdownTriggerClick = () => {
    if (dropdownMenuRef.current?.classList.contains("is-active")) {
      closeDropdownMenu();
    } else {
      dropdownMenuRef.current?.classList.add("is-active");
    }
  };

  useEffect(() => {
    setDropdownMenuClass(`dropdown-menu is-${position} ${isUp ? "is-up" : ""}`);
  }, [position, isUp]);

  useEffect(() => {
    // 전역 클릭 이벤트 설정
    window.addEventListener("click", closeDropdownMenu);
    return () => {
      window.removeEventListener("click", closeDropdownMenu);
    };
  });

  return (
    <div
      className="dropdown"
      onMouseOver={() => setIsOver(true)}
      onMouseLeave={() => setIsOver(false)}
    >
      {/* { 트리거 영역 } */}
      {cloneElement(dropdownTrigger as ReactElement, {
        ref: dropdownTriggerRef,
        onClick: handleDropdownTriggerClick,
      })}
      {/* { 메뉴 영역 } */}
      <div className={dropdownMenuClass} role="menu" ref={dropdownMenuRef}>
        {cloneElement(dropdownMenu as ReactElement, {
          ref: dropdownMenuContent,
        })}
      </div>
    </div>
  );
});

Dropdown.displayName = "Dropdown";
export default Dropdown;
