import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";

import "./style.css";

import Image from "next/image";

import ProjectImage from "@/types/project.image";
import { type DefaultImage, getDefaultImageById } from "@/types/default.image";

import { convertFileSizeToString, urlToFile } from "@/utils/common";
import { checkFileType } from "@/utils/validator";
import { showNotificationMessage } from "@/utils/message";

import CropperModal from "./cropper-modal/cropper.modal";

type ImageUploadProps = {
  labelText?: string;
  isRequired?: boolean;
  imageFile: File | null;
  setImageFile: Dispatch<SetStateAction<File | null>>;
  defaultProjectImage?: ProjectImage;
};

export type ImageUploadType = {
  isEdited: boolean;
};

const ImageUpload = forwardRef((props: ImageUploadProps, ref) => {
  const {
    labelText = "IMAGE",
    isRequired = false,
    imageFile,
    setImageFile,
    defaultProjectImage,
  } = props;

  // 부모 컴포넌트에서 사용할 수 있는 함수 선언
  useImperativeHandle(ref, () => ({
    isEdited,
  }));

  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // values
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>(
    defaultProjectImage?.url ?? ""
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isShowCropperModal, setIsShowCropperModal] = useState<boolean>(false);

  const [defaultImage, setDefaultImage] = useState<DefaultImage>(
    getDefaultImageById(1)!
  );

  const changeDefaultImage = () => {
    let id: number = defaultImage.id + 1;
    if (id > 9) id = 1;

    if (defaultProjectImage) setIsEdited(true);
    setDefaultImage(getDefaultImageById(id)!);
    setCroppedImageUrl("");
  };

  const resetImage = () => {
    setCroppedImageUrl(defaultProjectImage?.url ?? "");
    setIsEdited(false);
    setImageFile(null);
  };

  // 업로드 핸들링
  const handChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    // 파일 업로드가 실패하면
    if (!e.target.files) {
      showNotificationMessage({
        messageType: "warning",
        message: "파일을 찾을 수 없습니다.",
      });
      inputRef.current!.value = "";
      return;
    }
    const file: File = e.target.files![0];

    // 파일 타입 체크
    if (!checkFileType(file, [".jpg", ".jpeg", ".png"])) {
      showNotificationMessage({
        messageType: "warning",
        message: "Invalid file type",
      });
      inputRef.current!.value = "";
      return;
    }

    // 이미지 파일 set
    setImageFile(file);
    // 편집 여부 변경
    if (defaultProjectImage) setIsEdited(true);

    // 이미지 파일 읽기
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // cropper 모달 띄우기
    setIsShowCropperModal(true);

    // value 초기화
    inputRef.current!.value = "";
  };

  useEffect(() => {
    setImageFile(defaultImage.file);
  }, [defaultImage, setImageFile]);

  useEffect(() => {
    // 초기화 시 기존 이미지가 존재하면 설정
    if (!imageFile && defaultProjectImage) {
      const { url, pathname, contentType } = defaultProjectImage;
      urlToFile(url, pathname, contentType).then((file) => {
        setImageFile(file);
      });
    }
  }, [imageFile, setImageFile, defaultProjectImage]);

  return (
    <>
      <label className={`label${isRequired ? " is-required" : ""}`}>
        {labelText}
      </label>
      <div className="image-upload">
        <div className="image-wrapper">
          <Image
            className="image"
            src={croppedImageUrl ? croppedImageUrl : defaultImage.url}
            alt="project image"
            width={135}
            height={135}
          />
        </div>
        <div className="upload-wrapper">
          {isEdited ? (
            <button
              type="button"
              className="reset has-tooltip"
              data-tooltip="초기화"
              onClick={() => resetImage()}
            >
              <span className="icon">
                <i className="material-icons md-18">refresh</i>
              </span>
            </button>
          ) : (
            <></>
          )}
          <div className="upload-info">
            <p className="type">
              {croppedImageUrl
                ? "사용자 이미지"
                : `기본 이미지 ${defaultImage.id}`}
            </p>
            <p className="file-info">
              {croppedImageUrl && imageFile
                ? `${imageFile!.name} (${convertFileSizeToString(
                    imageFile!.size
                  )})`
                : defaultImage.name}
            </p>
          </div>
          <div className="button-group">
            <button
              className="button !text-xs w-full !shadow-none"
              type="button"
              onClick={() => changeDefaultImage()}
            >
              {croppedImageUrl ? "기본 이미지 사용" : "기본 이미지 변경"}
            </button>
            <button
              className="button is-success !text-xs w-full !shadow-none"
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              이미지 업로드
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          onChange={handChange}
          accept=".jpg,.png"
        />
      </div>
      {isShowCropperModal ? (
        <CropperModal
          closeModal={setIsShowCropperModal}
          imageFile={imageFile}
          setImageFile={setImageFile}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          setCroppedImageUrl={setCroppedImageUrl}
        />
      ) : (
        <></>
      )}
    </>
  );
});

ImageUpload.displayName = "ImageUpload";
export default ImageUpload;
