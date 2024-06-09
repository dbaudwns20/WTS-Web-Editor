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

import { useTranslations } from "next-intl";

type FileProps = {
  labelText?: string;
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
    labelText = "",
    isRequired = false,
    invalidMsg = "",
    accept,
    onChange,
  } = props;

  // i18n translate key
  const t = useTranslations("COMPONENTS.FILE");

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
  const fileUpload = (fileList: FileList | null) => {
    // 파일이 없는 경우
    if (!fileList) {
      showNotificationMessage({
        message: t("FILE_NOT_FOUND"),
        messageType: "warning",
      });
      fileRef.current!.value = "";
      return;
    }

    const file: File = fileList[0];

    // 파일 타입 체크
    if (
      accept &&
      !checkFileType(file, accept.split(/\s+/).join("").split(","))
    ) {
      showNotificationMessage({
        message: t("INVALID_TYPE"),
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
        message: t("EXCEED_SIZE", { maxSize: 2 }),
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
    fileUpload(event.target.files);
  };

  // 파일 드롭 업로드 헨들링
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files.length === 0) return;

    // 클래스 제거
    setIsDragEnter(false);

    // 파일 업로드
    fileUpload(event.dataTransfer.files);
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
    labelRef.current?.setAttribute("for", elId);
    fileRef.current?.setAttribute("id", elId);
    deleteButtonRef.current?.setAttribute("id", elId);
  }, [displayFile, elId]);

  return (
    <>
      {labelText.length > 0 ? (
        <label
          ref={labelRef}
          className={isRequired ? "label is-required" : "label"}
        >
          {labelText}
        </label>
      ) : (
        <></>
      )}
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
                <span className="material-icons md">upload_file</span>
              </span>
              <p className="text">{t("GUIDE")}</p>
              <p className="text">{t("MAX_SIZE", { maxSize: 2 })}</p>
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
                <i className="material-icons-outlined text-emerald-500">task</i>
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
                <span className="font-semibold text-gray-500">
                  {t("DELETE_BUTTON")}
                </span>
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
