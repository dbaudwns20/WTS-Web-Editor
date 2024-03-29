import {
  useRef,
  useEffect,
  SetStateAction,
  forwardRef,
  useImperativeHandle,
  useState,
  InvalidEvent,
  ChangeEvent,
} from "react";

import "./style.css";

import { generateRandomText } from "@/utils/common";

type TextProps = {
  value: string | null;
  labelText: string;
  placeholder?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  invalidMsg?: string;
  onChange: React.Dispatch<SetStateAction<string>>;
};

export type TextType = {
  focus: () => void;
};

const Text = forwardRef((props: TextProps, ref) => {
  const {
    value,
    labelText,
    placeholder,
    isDisabled = false,
    isReadOnly = false,
    isRequired = false,
    invalidMsg = "Please enter your value",
    onChange,
  }: TextProps = props;

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    focus,
  }));

  // ref
  const labelRef = useRef<HTMLLabelElement>(null);
  const textRef = useRef<HTMLInputElement>(null);

  // values
  const elId: string = `text_${generateRandomText()}`;
  const [_invalidMsg, setInvalidMsg] = useState<string | null>(null);

  // set element id
  useEffect(() => {
    labelRef.current!.setAttribute("for", elId);
    textRef.current!.setAttribute("id", elId);
  }, [elId]);

  const focus = () => {
    setTimeout(() => {
      textRef.current!.focus();
      textRef.current!.select();
      textRef.current!.setSelectionRange(0, 999); // For mobile devices.
    });
  };

  // change 이벤트 헨들링
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value: string = event.target.value;

    if (isRequired && value) {
      setInvalidMsg(null);
    }

    onChange(value);
  };

  // invalid 이벤트 헨들링
  const handleInvalid = (event: InvalidEvent<HTMLInputElement>) => {
    if (!isRequired) return;

    const value: string = event.target.value;

    value ? setInvalidMsg(null) : setInvalidMsg(invalidMsg);

    focus();
  };

  return (
    <>
      <label
        className={isRequired ? "label is-required" : "label"}
        ref={labelRef}
      >
        {labelText}
      </label>
      <input
        className={_invalidMsg !== null ? "input is-invalid" : "input"}
        type="text"
        ref={textRef}
        placeholder={placeholder}
        value={value!}
        onChange={handleChange}
        onInvalid={handleInvalid}
        disabled={isDisabled}
        readOnly={isReadOnly}
        required={isRequired}
      />
      {_invalidMsg !== null ? (
        <p className="invalid-message">{invalidMsg}</p>
      ) : (
        <></>
      )}
    </>
  );
});

// 컴포넌트 이름 설정
Text.displayName = "Text";
export default Text;
