import {
  forwardRef,
  useState,
  useRef,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

import "./style.css";

import Image from "next/image";

import { type DefaultImage, getDefaultImageById } from "@/types/default.image";

import { convertFileSizeToString } from "@/utils/common";
import { checkFileType } from "@/utils/validator";
import { showNotificationMessage } from "@/utils/message";

import CropperModal from "./cropper-modal/cropper.modal";

type ImageUploadProps = {
  imageFile: File | null;
  setImageFile: Dispatch<SetStateAction<File | null>>;
};

const ImageUpload = forwardRef((props: ImageUploadProps, ref) => {
  const { imageFile, setImageFile } = props;

  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // values
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isShowCropperModal, setIsShowCropperModal] = useState<boolean>(false);

  const [defaultImage, setDefaultImage] = useState<DefaultImage>(
    getDefaultImageById(1)!
  );

  const changeDefaultImage = () => {
    setDefaultImage(getDefaultImageById(defaultImage.id + 1)!);
    setCroppedImageUrl("");
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

  return (
    <>
      <label className="label">IMAGE</label>
      <div className="image-upload">
        <div className="image-wrapper">
          <Image
            className="image"
            src={croppedImageUrl ? croppedImageUrl : defaultImage.path}
            alt="project image"
            width={135}
            height={135}
          />
        </div>
        <div className="upload-wrapper">
          <div className="upload-info">
            <p className="type">
              {croppedImageUrl
                ? "Uploaded Image"
                : `Default Image ${defaultImage.id}`}
            </p>
            <p className="file-info">
              {croppedImageUrl
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
              기본 이미지 변경
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
