import {
  forwardRef,
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  useMemo,
} from "react";

import "./style.css";

import { generateRandomText } from "@/utils/common";

type SubmitProps = {
  buttonText: string;
  buttonClass?: string;
  isDisabled?: boolean;
};

export type SubmitType = {
  setFetchState: (state: boolean) => void;
};

const Submit = forwardRef((props: SubmitProps, ref) => {
  const {
    buttonText,
    buttonClass = "button",
    isDisabled = false,
  }: SubmitProps = props;

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    setFetchState,
  }));

  // ref
  const submitRef = useRef<HTMLButtonElement>(null);

  // values
  const elId = useMemo(() => `submit_${generateRandomText()}`, []);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [_buttonClass, setButtonClass] = useState<string>(buttonClass);
  const [_isDisabled, setIsDisabled] = useState<boolean>(isDisabled);

  const setFetchState = (state: boolean) => {
    setIsDisabled(state);
    setIsFetching(state);
    setButtonClass(state ? buttonClass + " is-disabled" : buttonClass);
  };

  // set element id
  useEffect(() => {
    submitRef.current!.setAttribute("id", elId);
  }, [elId]);

  return (
    <button
      ref={submitRef}
      type="submit"
      disabled={_isDisabled}
      className={`submit ${_buttonClass}`}
    >
      {isFetching ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </>
      ) : (
        buttonText
      )}
    </button>
  );
});

Submit.displayName = "Submit";
export default Submit;
