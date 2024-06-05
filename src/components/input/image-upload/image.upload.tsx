import { forwardRef, useState, useRef, useEffect, ChangeEvent } from "react";

import Image from "next/image";

import {
  BgImage,
  getBgImageById,
} from "@/app/(pages)/_project-card/background.image";

import { convertFileSizeToString } from "@/utils/common";
import { checkFileType } from "@/utils/validator";
import { showNotificationMessage } from "@/utils/message";

import CropperModal from "./cropper-modal/cropper.modal";

const ImageUpload = forwardRef((props: any, ref) => {
  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // values
  const [imageFile, setImageFile] = useState<File | null>(null);
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

    setImageFile(file);
  };

  useEffect(() => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageUrl(reader.result as string);
    };
    reader.readAsDataURL(imageFile);
    setIsShowCropperModal(true);

    inputRef.current!.value = "";
  }, [imageFile]);

  useEffect(() => {
    if (!isShowCropperModal) {
      if (!croppedImageUrl) {
        setImageFile(null);
        setUploadedImageUrl("");
      }
    }
  }, [isShowCropperModal, croppedImageUrl]);

  return (
    <>
      <label className="label">IMAGE</label>
      <div className="flex items-center gap-4 h-fit">
        <div className="rounded-lg overflow-hidden flex-shrink-0">
          <Image
            className="object-cover aspect-square w-[135px] h-[135px]"
            src={croppedImageUrl ? croppedImageUrl : image.path}
            alt={image.name}
            width={135}
            height={135}
          />
        </div>
        <div className="flex flex-col w-full h-[135px] gap-2">
          <div className="bg-gray-100 dark:bg-gray-700 h-full border border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2">
            <p className="text-slate-500 font-semibold text-sm">
              {imageFile ? "Uploaded Image" : "Default Image"}
            </p>
            <p className="text-slate-500 text-xs">
              {imageFile
                ? `${imageFile.name} (${convertFileSizeToString(
                    imageFile.size
                  )})`
                : "Orc Prologue Exodus of the Horde"}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
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
