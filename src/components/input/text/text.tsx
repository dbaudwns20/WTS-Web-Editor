import {
  useRef,
  useEffect,
  useMemo,
  SetStateAction,
  forwardRef,
  useImperativeHandle,
  useState,
  InvalidEvent,
  ChangeEvent,
  Dispatch,
} from "react";

import "./style.css";

import { type Required, type Pattern } from "@/types/components";

import { generateRandomText } from "@/utils/common";

import { useTranslations } from "next-intl";

type TextProps = {
  value: string | null;
  labelText?: string;
  placeholder?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  min?: number | undefined;
  max?: number | undefined;
  required?: Required;
  pattern?: Pattern;
  onChange: Dispatch<SetStateAction<string>>;
};

export type TextType = {
  setFocus: () => void;
};

const Text = forwardRef((props: TextProps, ref) => {
  const {
    value,
    labelText,
    placeholder,
    isDisabled = false,
    isReadOnly = false,
    min,
    max,
    required = {
      isRequired: false,
      invalidMessage: "",
    },
    pattern = {
      regExp: null,
      invalidMessage: "",
    },
    onChange,
  }: TextProps = props;

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    setFocus,
  }));

  // i18n translate key
  const t = useTranslations("COMPONENTS.TEXT");

  // ref
  const labelRef = useRef<HTMLLabelElement>(null);
  const textRef = useRef<HTMLInputElement>(null);

  // values
  const elId: string = useMemo(() => `text_${generateRandomText()}`, []);
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);

  const setFocus = () => {
    textRef.current!.focus();
    textRef.current!.select();
    textRef.current!.setSelectionRange(0, 999); // For mobile devices.
  };

  // 커스텀규칙 정의
  const setCustomValidity = (errorMessage: string, helperText: string = "") => {
    textRef.current?.setCustomValidity(errorMessage);
    setInvalidMessage(helperText.length > 0 ? helperText : null);
  };

  // change 이벤트 헨들링
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value: string = event.target.value;

    if (value.length === 0) {
      setCustomValidity("");
      onChange("");
      return;
    }

    let errorMessage: string = "";
    let helperText: string = "";

    // 정규식 체크
    if (pattern.regExp) {
      const { regExp, invalidMessage } = pattern;
      if (!regExp.test(value)) {
        errorMessage = "input value is invalid";
        helperText = invalidMessage;
      }
    }

    // value 길이 체크
    if (min && value.length < min) {
      errorMessage = "input value length is invalid";
      helperText = t("INVALID_MIN_LENGTH", { min: min });
    } else if (max && value.length > max) {
      errorMessage = "input value length is invalid";
      helperText = t("INVALID_MAX_LENGTH", { max: max });
    }

    setCustomValidity(errorMessage, helperText);
    onChange(value);
  };

  // invalid 이벤트 헨들링 => Submit 이벤트 후 처리
  const handleInvalid = (event: InvalidEvent<HTMLInputElement>) => {
    const value: string = event.target.value;

    if (required.isRequired && !value) {
      setInvalidMessage(required.invalidMessage);
    }

    setFocus();
  };

  // set element id
  useEffect(() => {
    labelRef.current?.setAttribute("for", elId);
    textRef.current!.setAttribute("id", elId);
  }, [elId]);

  return (
    <>
      {labelText ? (
        <label
          className={required.isRequired ? "label is-required" : "label"}
          ref={labelRef}
        >
          {labelText}
        </label>
      ) : (
        <></>
      )}
      <input
        className={invalidMessage !== null ? "input is-invalid" : "input"}
        type="text"
        ref={textRef}
        placeholder={placeholder}
        value={value!}
        onChange={handleChange}
        onInvalid={handleInvalid}
        disabled={isDisabled}
        readOnly={isReadOnly}
        required={required.isRequired}
      />
      {invalidMessage !== null ? (
        <p className="invalid-message">{invalidMessage}</p>
      ) : (
        <></>
      )}
    </>
  );
});

Text.displayName = "Text";
export default Text;
