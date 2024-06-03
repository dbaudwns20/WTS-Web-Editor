import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
  FormEvent,
} from "react";
import { useParams } from "next/navigation";

import "./style.css";

import Modal from "@/components/common/modal/modal";
import Submit, { type SubmitType } from "@/components/button/submit";

import { validateForm } from "@/utils/validator";
import { showNotificationMessage } from "@/utils/message";
import { callApi } from "@/utils/common";
import { downloadFile } from "@/utils/wts";

type DownloadWtsModalProps = {
  closeModal: Dispatch<SetStateAction<boolean>>;
  completeFunction: (...arg: any) => void;
};

type DownloadPurpose = "RELEASE" | "DEBUG" | "UPLOAD";

const DownloadWtsModal = forwardRef((props: DownloadWtsModalProps, ref) => {
  const { closeModal, completeFunction } = props;
  // params
  const { projectId } = useParams();

  // ref
  const submitRef = useRef<SubmitType>();

  // values
  const [downloadPurpose, setDownloadPurpose] =
    useState<DownloadPurpose>("RELEASE");
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const downloadWts = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // check required values
    if (!validateForm(e.target as HTMLFormElement)) return;

    setIsFetching(true);

    const response = await callApi(
      `/api/projects/${projectId}/download?purpose=${downloadPurpose}`
    );

    setIsFetching(false);

    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    downloadFile(response.data);

    // 모달 닫기
    closeModal(false);
  };

  useEffect(() => {
    submitRef.current?.setFetchState(isFetching);
  }, [isFetching]);

  return (
    <Modal
      title="Download WTS"
      isCloseOnOverlay={false}
      setIsModalOpen={closeModal}
      widthClass="lg:!w-[480px]"
    >
      <form className="grid gap-6 p-6" onSubmit={downloadWts} noValidate>
        <div className="block">
          <label className="label is-required">다운로드 선택</label>
          <div className="download-wrapper">
            <div className="download">
              <input
                type="radio"
                id="RELEASE"
                checked={downloadPurpose === "RELEASE"}
                onChange={() => setDownloadPurpose("RELEASE")}
                required
              />
              <label htmlFor="RELEASE">
                <div className="check-icon">
                  <span className="icon">
                    <i className="material-icons md-18">check</i>
                  </span>
                </div>
                <div className="block">
                  <div className="w-full font-semibold mb-0.5">Release</div>
                  <div className="w-full text-sm break-keep">
                    모든 STRING 데이터를 다운로드합니다.
                  </div>
                </div>
              </label>
            </div>
            <div className="download">
              <input
                type="radio"
                id="DEBUG"
                checked={downloadPurpose === "DEBUG"}
                className="hidden peer"
                onChange={() => setDownloadPurpose("DEBUG")}
                required
              />
              <label htmlFor="DEBUG">
                <div className="check-icon">
                  <span className="icon">
                    <i className="material-icons md-18">check</i>
                  </span>
                </div>
                <div className="block">
                  <div className="w-full font-semibold mb-0.5">Debug</div>
                  <div className="w-full text-sm break-keep">
                    텍스트 앞부분에 STRING 숫자가 표시됩니다.
                  </div>
                </div>
              </label>
            </div>
            <div className="download">
              <input
                type="radio"
                id="UPLOAD"
                checked={downloadPurpose === "UPLOAD"}
                className="hidden peer"
                onChange={() => setDownloadPurpose("UPLOAD")}
              />
              <label htmlFor="UPLOAD">
                <div className="check-icon">
                  <span className="icon">
                    <i className="material-icons md-18">check</i>
                  </span>
                </div>
                <div className="block">
                  <div className="w-full font-semibold mb-0.5">Upload</div>
                  <div className="w-full text-sm break-keep">
                    번역이 완료된 STRING 데이터만 다운로드합니다.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div className="block text-center">
          <Submit
            ref={submitRef}
            buttonText="DOWNLOAD"
            buttonClass="button is-primary"
          />
        </div>
      </form>
    </Modal>
  );
});

DownloadWtsModal.displayName = "DownloadWtsModal";
export default DownloadWtsModal;
