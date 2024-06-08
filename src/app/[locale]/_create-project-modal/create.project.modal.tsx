import {
  useRef,
  forwardRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";

import { getLocaleOptions } from "@/types/locale";
import WtsString from "@/types/wts.string";

import Modal from "@/components/common/modal/modal";
import Select from "@/components/input/select/select";
import Text, { type TextType } from "@/components/input/text/text";
import Submit, { type SubmitType } from "@/components/button/submit";
import File, { type FileType } from "@/components/input/file/file";
import ImageUpload from "@/components/input/image-upload/image.upload";

import { validateForm } from "@/utils/validator";
import { readWtsFile } from "@/utils/wts";
import { showNotificationMessage } from "@/utils/message";
import { callApi } from "@/utils/common";

type CreateProjectModalProps = {
  closeModal: Dispatch<SetStateAction<boolean>>;
  completeFunction: (...arg: any) => void;
};

const CreateProjectModal = forwardRef((props: CreateProjectModalProps, ref) => {
  const { closeModal, completeFunction } = props;

  // ref
  const titleRef = useRef<TextType>();
  const submitRef = useRef<SubmitType>();
  const fileRef = useRef<FileType>();

  // values
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [locale, setLocale] = useState<number>(0);
  const [version, setVersion] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [wtsStringList, setWtsStringList] = useState<WtsString[]>([]);

  // 프로젝트 생성
  const createNewProject = async (e: any) => {
    e.preventDefault();

    if (!validateForm(e.target)) return;

    setIsFetching(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("locale", locale.toString());
    if (version) formData.append("version", version);
    if (source) formData.append("source", source);
    formData.append("imageFile", imageFile!);
    formData.append("wtsStringList", JSON.stringify(wtsStringList));

    const response = await callApi("/api/projects", {
      method: "POST",
      body: formData,
    });

    setIsFetching(false);

    // onError
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
        message: "Created.",
        messageType: "success",
      });

      // 모달 창 닫기
      closeModal(false);
    });
  };

  const handleUploadWtsFile = (file: File) => {
    setWtsStringList(readWtsFile(file));
  };

  useEffect(() => {
    submitRef.current?.setFetchState(isFetching);
    fileRef.current?.setDisableReloadButton(isFetching);
  }, [isFetching]);

  useEffect(() => {
    // input focus
    titleRef.current?.setFocus();
  }, []);

  return (
    <Modal
      title="New Project"
      isCloseOnOverlay={false}
      setIsModalOpen={closeModal}
    >
      <form
        className="grid gap-4 px-6 pt-3 pb-6"
        onSubmit={createNewProject}
        noValidate
      >
        <div className="block">
          <Text
            ref={titleRef}
            value={title}
            labelText="TITLE"
            placeholder="Project Title"
            invalidMsg="Please enter your project title."
            isRequired={true}
            onChange={setTitle}
          />
        </div>
        <div className="block-group">
          <div className="block">
            <Select
              labelText="LOCALE"
              options={getLocaleOptions()}
              value={locale}
              onChange={(val) => setLocale(Number(val))}
              invalidMsg="Please select your locale."
              isRequired={true}
            />
          </div>
          <div className="block">
            <Text
              value={version}
              labelText="VERSION"
              placeholder="ex) 1.0.0"
              invalidMsg="Please enter your version."
              onChange={setVersion}
            />
          </div>
        </div>
        <div className="block">
          <Text
            value={source}
            labelText="SOURCE URL"
            placeholder="type source URL"
            onChange={setSource}
          />
        </div>
        <div className="block">
          <ImageUpload
            labelText={"이미지"}
            isRequired={true}
            imageFile={imageFile}
            setImageFile={setImageFile}
          />
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
            buttonText="CREATE"
            buttonClass="button is-primary"
          />
        </div>
      </form>
    </Modal>
  );
});

CreateProjectModal.displayName = "CreateModal";
export default CreateProjectModal;
