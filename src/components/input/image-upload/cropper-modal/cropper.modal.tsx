import {
  useRef,
  createRef,
  forwardRef,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";

import "./style.css";

import Modal from "@/components/common/modal/modal";

import { checkFileType } from "@/utils/validator";
import { showNotificationMessage } from "@/utils/message";

import Cropper, { ReactCropperElement } from "react-cropper";
import { useTranslations } from "next-intl";

type CropperModalProps = {
  uploadedImageUrl: string;
  imageFile: File | null;
  setImageFile: Dispatch<SetStateAction<File | null>>;
  setUploadedImageUrl: Dispatch<SetStateAction<string>>;
  setCroppedImageUrl: Dispatch<SetStateAction<string>>;
  closeModal: Dispatch<SetStateAction<boolean>>;
};

const CropperModal = forwardRef((props: CropperModalProps, ref) => {
  const {
    imageFile,
    setImageFile,
    uploadedImageUrl,
    setUploadedImageUrl,
    setCroppedImageUrl,
    closeModal,
  } = props;

  // i18n translate key
  const t = useTranslations("COMPONENTS.IMAGE_UPLOAD.CROPPER_MODAL");

  // refs
  const cropperRef = createRef<ReactCropperElement>();
  const inputRef = useRef<HTMLInputElement>(null);

  const applyImage = () => {
    if (cropperRef.current && imageFile) {
      const cropper = cropperRef.current?.cropper;
      const options: any = {
        width: 500,
        height: 500,
        fillColor: "#fff",
        imageSmoothingQuality: "high",
      };
      // 이미지 설정
      setCroppedImageUrl(cropper.getCroppedCanvas(options).toDataURL());

      // 잘라진 이미지로 파일 다시 설정
      cropper.getCroppedCanvas(options).toBlob((blob) => {
        const file = new File([blob!], imageFile.name, {
          type: imageFile.type,
        });
        setImageFile(file);
      });

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

  // crop box 최대화 및 정 중앙 위치
  const setCropBoxFull = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current?.cropper;
      const { width, height } = cropper.getImageData();

      let val: number = Math.min(width, height);

      cropper.setCropBoxData({
        left: (width - val) / 2,
        top: (height - val) / 2,
        width: val,
        height: val,
      });
    }
  };

  // 이미지 재업로드 핸들링
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    // 파일 업로드가 실패하면
    if (!e.target.files) {
      showNotificationMessage({
        messageType: "warning",
        message: t("FILE_NOT_FOUND"),
      });
      return;
    }
    const file: File = e.target.files![0];

    // 파일 타입 체크
    if (!checkFileType(file, [".jpg", ".jpeg", ".png"])) {
      showNotificationMessage({
        messageType: "warning",
        message: t("INVALID_TYPE"),
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
      hideCloseButton={true}
      setIsModalOpen={closeModal}
    >
      <div className="cropper-wrapper">
        <header className="cropper-header">
          <div className="cropper-functions">
            <a
              type="button"
              className="anchor-has-icon !px-0"
              onClick={() => inputRef.current?.click()}
            >
              <span className="icon">
                <i className="material-icons md-18">upload</i>
              </span>
              <span> {t("RE_UPLOAD")}</span>
            </a>
          </div>
          <div className="cropper-functions">
            <a
              type="button"
              className="anchor-has-icon"
              onClick={() => setCropBoxFull()}
            >
              <span className="icon">
                <i className="material-icons md-18">fullscreen</i>
              </span>
              <span> {t("FULL_SIZE")}</span>
            </a>
            <a type="button" className="anchor-has-icon" onClick={reset}>
              <span className="icon">
                <i className="material-icons md-18">refresh</i>
              </span>
              <span> {t("RESET")}</span>
            </a>
          </div>
        </header>
        <Cropper
          ref={cropperRef}
          aspectRatio={1}
          viewMode={1}
          background={true}
          guides={true}
          cropBoxMovable={true}
          cropBoxResizable={true}
          style={{ marginBottom: "1rem" }}
          dragMode={"move"}
          src={uploadedImageUrl}
        />
        <button
          type="button"
          className="button is-info w-full"
          onClick={applyImage}
        >
          {t("COMPLETE")}
        </button>
        <input
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleUpload}
          accept=".jpg,.png"
        />
      </div>
    </Modal>
  );
});

CropperModal.displayName = "CropperModal";
export default CropperModal;
