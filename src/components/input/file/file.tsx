import {
  forwardRef,
  ChangeEvent,
  DragEvent,
  InvalidEvent,
  KeyboardEvent,
  Dispatch,
  useImperativeHandle,
  useRef,
  useMemo,
  useState,
  useEffect,
} from "react";

import "./style.css";

import { checkUploadedFileSize, checkFileType } from "@/utils/validator";
import { generateRandomText, convertFileSizeToString } from "@/utils/common";
import { showNotificationMessage } from "@/utils/message";

type FileProps = {
  labelText: string;
  isRequired?: boolean;
  invalidMsg?: string;
  accept?: string;
  onChange: Dispatch<File>;
};

export type FileType = {
  setDisableReloadButton: (isDisabled: boolean) => void;
};

const File = forwardRef((props: FileProps, ref) => {
  const {
    labelText,
    isRequired = false,
    invalidMsg = "Please upload your file.",
    accept,
    onChange,
  } = props;

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    setDisableReloadButton,
  }));

  // ref
  const labelRef = useRef<HTMLLabelElement>(null);
  const innerLabel = useRef<HTMLLabelElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  // values
  const elId = useMemo(() => `file_${generateRandomText()}`, []);
  const [_invalidMsg, setInvalidMsg] = useState<string | null>(null);
  const [displayFile, setDisplayFile] = useState<string>("");
  const [isDragEnter, setIsDragEnter] = useState<boolean>(false);

  // 파일 업로드 처리
  const fileUpload = (file: File) => {
    // 파일 타입 체크
    if (
      accept &&
      !checkFileType(file, accept.split(/\s+/).join("").split(","))
    ) {
      showNotificationMessage({
        message: `The file type is not [ ${accept} ]`,
        messageType: "warning",
      });
      fileRef.current!.value = "";
      return;
    }

    if (isRequired && file) {
      setInvalidMsg(null);
    }

    let size: number = file.size;
    if (!checkUploadedFileSize(size)) {
      showNotificationMessage({
        message: "File size exceeds 2MB",
        messageType: "warning",
      });
      fileRef.current!.value = "";
      return;
    }

    setDisplayFile(file.name + " " + convertFileSizeToString(size));

    onChange(file);
  };

  // 파일 업로드 헨들링
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.target.files?.length === 0) return;

    // 파일 업로드
    fileUpload(event.target.files![0]);
  };

  // 파일 드롭 업로드 헨들링
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files.length === 0) return;

    // 클래스 제거
    setIsDragEnter(false);

    // 파일 업로드
    fileUpload(event.dataTransfer.files[0]);
  };

  // invalid 이벤트 헨들링
  const handleInvalid = (event: InvalidEvent<HTMLInputElement>) => {
    if (!isRequired) return;

    const value: string = event.target.value;

    value ? setInvalidMsg(null) : setInvalidMsg(invalidMsg);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
    if (event.code === "Enter" || event.code === "Space") {
      fileRef.current?.click();
    }
  };

  // 재업로드 헨들링
  const handleReupload = () => {
    setDisplayFile("");
    setTimeout(() => (fileRef.current!.value = ""));
  };

  const setDisableReloadButton = (isDisabled: boolean) => {
    if (!deleteButtonRef.current) return;
    deleteButtonRef.current.disabled = isDisabled;
  };

  // 드래그 앤 드롭 여부 변경시 클래스 추가, 삭제
  useEffect(() => {
    if (isDragEnter) innerLabel.current?.classList.add("is-drag-enter");
    else innerLabel.current?.classList.remove("is-drag-enter");
  }, [isDragEnter]);

  // set element id
  useEffect(() => {
    labelRef.current!.setAttribute("for", elId);
    fileRef.current?.setAttribute("id", elId);
    deleteButtonRef.current?.setAttribute("id", elId);
  }, [displayFile, elId]);

  return (
    <>
      <label
        ref={labelRef}
        className={isRequired ? "label is-required" : "label"}
      >
        {labelText}
      </label>
      <div className="file-wrapper">
        {displayFile === "" ? (
          <label
            tabIndex={0}
            ref={innerLabel}
            onKeyDown={(e) => handleKeyDown(e)}
            onDragEnter={() => setIsDragEnter(true)}
            onDragLeave={() => setIsDragEnter(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={_invalidMsg !== null ? "file is-invalid" : "file"}
          >
            <div className="file-content">
              <span className="icon">
                <span className="material-icons md-36">upload_file</span>
              </span>
              <p className="text">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text font-semibold">
                Maximum upload file size : 2MB
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              ref={fileRef}
              required={isRequired}
              onChange={handleChange}
              onInvalid={handleInvalid}
              accept={accept}
            />
          </label>
        ) : (
          <label className="file is-uploaded" tabIndex={0}>
            <div className="file-content">
              <span className="icon">
                <i className="material-icons-outlined md-36 text-emerald-500">
                  task
                </i>
              </span>
              <p className="text">{displayFile}</p>
              <button
                ref={deleteButtonRef}
                className="button delete-button"
                type="button"
                onClick={handleReupload}
              >
                <span className="icon">
                  <i className="material-icons md-18 text-red-500">
                    highlight_off
                  </i>
                </span>
                <span className="font-semibold text-gray-500">DELETE</span>
              </button>
            </div>
          </label>
        )}
      </div>
      {_invalidMsg !== null ? (
        <p className="invalid-message">{invalidMsg}</p>
      ) : (
        <></>
      )}
    </>
  );
});

File.displayName = "File";
export default File;
