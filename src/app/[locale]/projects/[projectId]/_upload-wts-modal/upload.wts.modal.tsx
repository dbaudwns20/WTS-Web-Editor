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

import WtsString from "@/types/wts.string";

import Modal from "@/components/common/modal/modal";
import Submit, { type SubmitType } from "@/components/button/submit";
import File, { type FileType } from "@/components/input/file/file";

import { validateForm } from "@/utils/validator";
import { readWtsFile } from "@/utils/wts";
import { showNotificationMessage } from "@/utils/message";
import { callApi } from "@/utils/common";

import { useTranslations } from "next-intl";

type OverwriteWtsModalProps = {
  setStringListKey: Dispatch<SetStateAction<number>>;
  closeModal: Dispatch<SetStateAction<boolean>>;
  completeFunction: (...arg: any) => void;
};

const OverwriteWtsModal = forwardRef((props: OverwriteWtsModalProps, ref) => {
  const { closeModal, setStringListKey, completeFunction } = props;
  // params
  const { projectId } = useParams();

  // i18n translate key
  const t = useTranslations("PROJECT_DETAIL.UPLOAD_WTS_MODAL");
  const et = useTranslations("ERROR");

  // ref
  const submitRef = useRef<SubmitType>();
  const fileRef = useRef<FileType>();

  // values
  const [wtsStringList, setWtsStringList] = useState<WtsString[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const uploadWts = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // check required values
    if (!validateForm(e.target as HTMLFormElement)) return;

    setIsFetching(true);

    const formData: FormData = new FormData();
    formData.append("wtsStringList", JSON.stringify(wtsStringList));

    const response = await callApi(`/api/projects/${projectId}/strings`, {
      method: "PUT",
      body: formData,
    });

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

    // 성공 처리
    completeFunction(() => {
      // 메시지 출력
      showNotificationMessage({
        message: t("UPLOAD_WTS_MODAL.SUCCESS_MESSAGE"),
        messageType: "success",
      });
      // 모달 닫기
      closeModal(false);
      // string list 갱신
      setStringListKey((pre) => pre + 1);
    });
  };

  const handleUploadWtsFile = (file: File) => {
    setWtsStringList(readWtsFile(file));
  };

  useEffect(() => {
    submitRef.current?.setFetchState(isFetching);
    fileRef.current?.setDisableReloadButton(isFetching);
  }, [isFetching]);

  return (
    <Modal
      title={t("TITLE")}
      isCloseOnOverlay={false}
      setIsModalOpen={closeModal}
    >
      <form
        className="grid gap-4 px-6 pt-3 pb-6"
        onSubmit={uploadWts}
        noValidate
      >
        <div className="p-3 border border-gray-300 rounded-lg bg-slate-100 text-slate-500  dark:bg-slate-600 dark:text-white/60 dark:border-gray-500">
          <ul className="list-disc ml-4">
            <li className="font-semibold text-sm mb-2">{t("GUIDE_1")}</li>
            <li className="font-semibold text-sm">{t("GUIDE_2")}</li>
          </ul>
        </div>
        <div className="block">
          <File
            ref={fileRef}
            labelText={t("WTS_FILE.LABEL")}
            onChange={handleUploadWtsFile}
            isRequired={true}
            accept=".wts"
            invalidMsg={t("WTS_FILE.INVALID_MESSAGE")}
          />
        </div>
        <div className="block text-center">
          <Submit
            ref={submitRef}
            buttonText={t("UPLOAD_BUTTON")}
            buttonClass="button is-primary"
          />
        </div>
      </form>
    </Modal>
  );
});

OverwriteWtsModal.displayName = "OverwriteWtsModal";
export default OverwriteWtsModal;
