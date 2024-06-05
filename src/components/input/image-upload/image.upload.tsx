import {
  forwardRef,
  useState,
  useRef,
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";

import "./style.css";

import Image from "next/image";

import {
  BgImage,
  getBgImageById,
} from "@/app/(pages)/_project-card/background.image";

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

  const image: BgImage = getBgImageById(1);

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

  return (
    <>
      <label className="label">IMAGE</label>
      <div className="image-upload">
        <div className="image-wrapper">
          <Image
            className="image"
            src={croppedImageUrl ? croppedImageUrl : image.path}
            alt={image.name}
            width={135}
            height={135}
          />
        </div>
        <div className="upload-wrapper">
          <div className="upload-info">
            <p className="type">
              {imageFile ? "Uploaded Image" : "Default Image"}
            </p>
            <p className="file-info">
              {imageFile
                ? `${imageFile.name.split(".")[0]} (${convertFileSizeToString(
                    imageFile.size
                  )})`
                : "Orc Prologue Exodus of the Horde"}
            </p>
          </div>
          <div className="button-group">
            <button className="button !text-xs w-full" type="button">
              Switch Default Image
            </button>
            <button
              className="button is-success !text-xs w-full"
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              Upload Image
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
