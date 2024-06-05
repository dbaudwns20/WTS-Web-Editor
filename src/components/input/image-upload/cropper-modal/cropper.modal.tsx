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
          type: "image/jpeg",
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

  // 이미지 재업로드 핸들링
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
      <div className="cropper-wrapper">
        <div className="cropper-functions">
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
            <span>Upload</span>
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
        <button
          type="button"
          className="button is-info w-full"
          onClick={applyImage}
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
    </Modal>
  );
});

CropperModal.displayName = "CropperModal";
export default CropperModal;
