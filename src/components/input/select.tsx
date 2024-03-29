import {
  useRef,
  useEffect,
  SetStateAction,
  forwardRef,
  useImperativeHandle,
} from "react";

import { generateRandomText } from "@/utils/common";

type PropsType = {
  options: any[];
  value: any;
  onChange: React.Dispatch<SetStateAction<any>>;
  labelText: string;
};

const Select = forwardRef((props: PropsType, ref) => {
  let { options, value, labelText, onChange } = props;

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({}));

  // ref
  const labelRef = useRef<HTMLLabelElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // values
  const elId: string = `select_${generateRandomText()}`;

  useEffect(() => {
    labelRef.current!.setAttribute("for", elId);
    selectRef.current!.setAttribute("id", elId);
  }, [elId]);

  return (
    <>
      <label
        ref={labelRef}
        className="block text-sm mb-2 font-medium text-slate-400 dark:text-white"
      >
        {labelText}
      </label>
      <div className="relative">
        <select
          ref={selectRef}
          value={value}
          onChange={onChange}
          className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          {options.map((option: any) => {
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
    </>
  );
});

Select.displayName = "Select";
export default Select;
