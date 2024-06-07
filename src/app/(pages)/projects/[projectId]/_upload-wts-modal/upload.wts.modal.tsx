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

type OverwriteWtsModalProps = {
  setStringListKey: Dispatch<SetStateAction<number>>;
  closeModal: Dispatch<SetStateAction<boolean>>;
  completeFunction: (...arg: any) => void;
};

const OverwriteWtsModal = forwardRef((props: OverwriteWtsModalProps, ref) => {
  const { closeModal, setStringListKey, completeFunction } = props;
  // params
  const { projectId } = useParams();

  // ref
  const submitRef = useRef<SubmitType>();
  const fileRef = useRef<FileType>();

  // values
  const [wtsStringList, setWtsStringList] = useState<WtsString[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const overwriteWts = async (e: FormEvent<HTMLFormElement>) => {
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
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    // 성공 처리
    completeFunction(() => {
      // 메시지 출력
      showNotificationMessage({
        message: "Updated.",
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
      title="Upload WTS"
      isCloseOnOverlay={false}
      setIsModalOpen={closeModal}
    >
      <form
        className="grid gap-4 px-6 pt-3 pb-6"
        onSubmit={overwriteWts}
        noValidate
      >
        <div className="p-3 border border-gray-300 rounded-lg bg-slate-100 text-slate-500  dark:bg-slate-600 dark:text-white/60 dark:border-gray-500">
          <ul className="list-disc ml-4">
            <li className="font-semibold text-sm mb-2">
              작업된 WTS 파일을 프로젝트에 반영할 수 있습니다.
            </li>
            <li className="font-semibold text-sm">
              STRING 숫자와 일치하는 데이터의 번역 텍스트가 갱신됩니다.
            </li>
          </ul>
        </div>
        <div className="block">
          <File
            ref={fileRef}
            labelText="WTS FILE"
            onChange={handleUploadWtsFile}
            isRequired={true}
            accept=".wts"
            invalidMsg="Please upload your wts file."
          />
        </div>
        <div className="block text-center">
          <Submit
            ref={submitRef}
            buttonText="UPDATE"
            buttonClass="button is-primary"
          />
        </div>
      </form>
    </Modal>
  );
});

OverwriteWtsModal.displayName = "OverwriteWtsModal";
export default OverwriteWtsModal;
