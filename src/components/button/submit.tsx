import {
  forwardRef,
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
} from "react";

import { generateRandomText } from "@/utils/common";

type SubmitProps = {
  buttonText: string;
  buttonClass?: string;
  isDisabled?: boolean;
};

export type SubmitType = {
  setFetchState: (state: boolean) => void;
  setDisableState: (state: boolean) => void;
};

const Submit = forwardRef((props: SubmitProps, ref) => {
  const {
    buttonText,
    buttonClass = "inline-flex justify-center items-center bg-blue-500 text-white font-bold rounded-lg p-3 w-full hover:bg-blue-600",
    isDisabled = false,
  }: SubmitProps = props;

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    setFetchState,
    setDisableState,
  }));

  // ref
  const submitRef = useRef<HTMLButtonElement>(null);

  // values
  const elId: string = `submit_${generateRandomText()}`;
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [_buttonClass, setButtonClass] = useState<string>(buttonClass);
  const [_isDisabled, setIsDisabled] = useState<boolean>(isDisabled);

  const setFetchState = (state: boolean) => {
    setIsDisabled(state);
    setIsFetching(state);
    setButtonClass(
      state
        ? "inline-flex justify-center items-center bg-blue-500 text-white font-bold rounded-lg p-3 w-full opacity-50 disabled: cursor-not-allowed"
        : buttonClass
    );
  };

  const setDisableState = useCallback(() => {
    if (!isDisabled) return;
    setIsDisabled(true);
    setButtonClass(
      "inline-flex justify-center items-center bg-blue-500 text-white font-bold rounded-lg p-3 w-full opacity-50 disabled: cursor-not-allowed"
    );
  }, [isDisabled]);

  // set element id
  useEffect(() => {
    submitRef.current!.setAttribute("id", elId);
    setDisableState();
  }, [elId, setDisableState]);

  return (
    <button
      ref={submitRef}
      type="submit"
      disabled={_isDisabled}
      className={_buttonClass}
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
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
