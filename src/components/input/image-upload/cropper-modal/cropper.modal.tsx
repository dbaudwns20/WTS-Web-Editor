import {
  useRef,
  createRef,
  forwardRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import Image from "next/image";

import "./style.css";

import Modal from "@/components/common/modal/modal";

import { checkFileType } from "@/utils/validator";
import { showNotificationMessage } from "@/utils/message";

import Cropper, { ReactCropperElement } from "react-cropper";

type CropperModalProps = {
  uploadedImageUrl: string;
  setImageFile: Dispatch<SetStateAction<File | null>>;
  setUploadedImageUrl: Dispatch<SetStateAction<string>>;
  setCroppedImageUrl: Dispatch<SetStateAction<string>>;
  closeModal: Dispatch<SetStateAction<boolean>>;
};

const CropperModal = forwardRef((props: CropperModalProps, ref) => {
  const {
    setImageFile,
    uploadedImageUrl,
    setUploadedImageUrl,
    setCroppedImageUrl,
    closeModal,
  } = props;

  // refs
  const cropperRef = createRef<ReactCropperElement>();
  const inputRef = useRef<HTMLInputElement>(null);

  const updateImage = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current?.cropper;
      setCroppedImageUrl(
        cropper
          .getCroppedCanvas({
            width: 500,
            height: 500,
            fillColor: "#fff",
            imageSmoothingQuality: "high",
          })
          .toDataURL()
      );
      closeModal(false);
    }
  };

  // 초기화
  const reset = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current?.cropper;
      cropper.reset();
    }
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    // 파일 업로드가 실패하면
    if (!e.target.files) {
      showNotificationMessage({
        messageType: "warning",
        message: "파일을 찾을 수 없습니다.",
      });
      return;
    }
    const file: File = e.target.files![0];

    // 파일 타입 체크
    if (!checkFileType(file, [".jpg", ".jpeg", ".png"])) {
      showNotificationMessage({
        messageType: "warning",
        message: "Invalid file type",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageUrl(reader.result as any);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal
      title="Upload Image"
      widthClass="lg:!w-[450px]"
      isCloseOnOverlay={false}
      setIsModalOpen={closeModal}
    >
      <div className="px-6 pb-6 pt-1">
        <div className="flex items-center justify-end mb-1">
          <a type="button" className="anchor-has-icon" onClick={reset}>
            <span className="icon">
              <i className="material-icons md-18">refresh</i>
            </span>
            <span>Reset</span>
          </a>
          <a
            type="button"
            className="anchor-has-icon"
            onClick={() => inputRef.current?.click()}
          >
            <span className="icon">
              <i className="material-icons md-18">upload</i>
            </span>
            <span>Reupload</span>
          </a>
        </div>
        <Cropper
          ref={cropperRef}
          aspectRatio={1}
          viewMode={0}
          background={true}
          guides={true}
          cropBoxMovable={true}
          cropBoxResizable={true}
          style={{ marginBottom: "1rem" }}
          dragMode={"move"}
          src={uploadedImageUrl}
        />
        <div className="inline-flex w-full gap-2">
          <button
            type="button"
            className="button is-info w-full"
            onClick={updateImage}
          >
            APPLY
          </button>
          <input
            type="file"
            className="hidden"
            ref={inputRef}
            onChange={handleUpload}
            accept=".jpg,.png"
          />
        </div>
      </div>
    </Modal>
  );
});

CropperModal.displayName = "CropperModal";
export default CropperModal;
