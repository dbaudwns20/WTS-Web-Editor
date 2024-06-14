import {
  useState,
  useRef,
  useEffect,
  SetStateAction,
  forwardRef,
  useImperativeHandle,
  ChangeEvent,
  InvalidEvent,
  useMemo,
  Dispatch,
} from "react";

import "./style.css";

import { type Required } from "@/types/components";

import { generateRandomText } from "@/utils/common";

type PropsType = {
  value?: any;
  defaultOption?: any;
  options: any[];
  labelText?: string;
  required?: Required;
  onChange: Dispatch<SetStateAction<any>>;
};

const Select = forwardRef((props: PropsType, ref) => {
  let {
    value = "",
    defaultOption,
    options,
    labelText,
    required = {
      isRequired: false,
      invalidMessage: "",
    },
    onChange,
  } = props;

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    setFocus,
  }));

  // ref
  const labelRef = useRef<HTMLLabelElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // values
  const elId = useMemo(() => `select_${generateRandomText()}`, []);
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);
  const _options = useMemo<any>(() => {
    if (defaultOption) options.unshift(defaultOption);
    return options;
  }, [defaultOption, options]);

  const setFocus = () => {
    selectRef.current!.focus();
  };

  // change 이벤트 헨들링
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value: any = event.target.value;

    if (required.isRequired && value) {
      setInvalidMessage(null);
    }

    onChange(value);
  };

  // invalid 이벤트 헨들링
  const handleInvalid = (event: InvalidEvent<HTMLSelectElement>) => {
    const value: string = event.target.value;

    if (required.isRequired && !value) {
      setInvalidMessage(required.invalidMessage);
    }

    setFocus();
  };

  useEffect(() => {
    labelRef.current?.setAttribute("for", elId);
    selectRef.current!.setAttribute("id", elId);
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
      <div className="relative">
        <select
          className={invalidMessage !== null ? "select is-invalid" : "select"}
          ref={selectRef}
          value={value}
          onChange={handleChange}
          onInvalid={handleInvalid}
          required={required.isRequired}
        >
          {_options.map((option: any) => {
            return (
              <option value={option.id} key={option.id}>
                {option.value}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {invalidMessage !== null ? (
        <p className="invalid-message">{invalidMessage}</p>
      ) : (
        <></>
      )}
    </>
  );
});

Select.displayName = "Select";
export default Select;
