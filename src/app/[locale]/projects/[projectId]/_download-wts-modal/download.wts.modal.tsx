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

import { useTranslations } from "next-intl";

type DownloadWtsModalProps = {
  closeModal: Dispatch<SetStateAction<boolean>>;
};

type DownloadPurpose = "RELEASE" | "DEBUG" | "UPLOAD";

const DownloadWtsModal = forwardRef((props: DownloadWtsModalProps, ref) => {
  const { closeModal } = props;
  // params
  const { projectId } = useParams();

  // i18n translate key
  const t = useTranslations("PROJECT_DETAIL.DOWNLOAD_WTS_MODAL");
  const et = useTranslations("ERROR");

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
      let message: string = response.message;
      if (response.errorCode) {
        message = et(response.errorCode, { arg: response.arg });
      }
      showNotificationMessage({
        message: message,
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
      title={t("TITLE")}
      isCloseOnOverlay={false}
      setIsModalOpen={closeModal}
    >
      <form
        className="grid gap-4 px-6 pt-3 pb-6"
        onSubmit={downloadWts}
        noValidate
      >
        <div className="block">
          <label className="label is-required">{t("DOWNLOAD.LABEL")}</label>
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
                  <div className="w-full font-semibold mb-0.5">
                    {t("DOWNLOAD.RELEASE")}
                  </div>
                  <div className="w-full text-sm break-keep">
                    {t("DOWNLOAD.RELEASE_GUILD")}
                  </div>
                </div>
              </label>
            </div>
            <div className="download">
              <input
                type="radio"
                id="DEBUG"
                checked={downloadPurpose === "DEBUG"}
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
                  <div className="w-full font-semibold mb-0.5">
                    {t("DOWNLOAD.DEBUG")}
                  </div>
                  <div className="w-full text-sm break-keep">
                    {t("DOWNLOAD.DEBUG_GUILD")}
                  </div>
                </div>
              </label>
            </div>
            <div className="download">
              <input
                type="radio"
                id="UPLOAD"
                checked={downloadPurpose === "UPLOAD"}
                onChange={() => setDownloadPurpose("UPLOAD")}
              />
              <label htmlFor="UPLOAD">
                <div className="check-icon">
                  <span className="icon">
                    <i className="material-icons md-18">check</i>
                  </span>
                </div>
                <div className="block">
                  <div className="w-full font-semibold mb-0.5">
                    {t("DOWNLOAD.UPLOAD")}
                  </div>
                  <div className="w-full text-sm break-keep">
                    {t("DOWNLOAD.UPLOAD_GUILD")}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div className="block text-center">
          <Submit
            ref={submitRef}
            buttonText={t("DOWNLOAD_BUTTON")}
            buttonClass="button is-primary"
          />
        </div>
      </form>
    </Modal>
  );
});

DownloadWtsModal.displayName = "DownloadWtsModal";
export default DownloadWtsModal;
