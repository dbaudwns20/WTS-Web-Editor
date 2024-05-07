import { useRef, forwardRef, useState, useEffect } from "react";

import Language, { getLangOptions } from "@/types/language";
import WtsString from "@/types/wts.string";

import Modal from "@/components/common/modal/modal";
import Select from "@/components/input/select/select";
import Text, { type TextType } from "@/components/input/text/text";
import Submit, { type SubmitType } from "@/components/button/submit";
import File, { type FileType } from "@/components/input/file/file";

import { validateForm } from "@/utils/validator";
import { readWtsFile } from "@/utils/wts";
import { showNotificationMessage } from "@/utils/message";
import { callApi } from "@/utils/common";

type CreateProjectModalProps = {
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
  createProjectCallback: () => void;
};

const CreateProjectModal = forwardRef((props: CreateProjectModalProps, ref) => {
  const { closeModal, createProjectCallback } = props;

  // ref
  const titleRef = useRef<TextType>();
  const submitRef = useRef<SubmitType>();
  const fileRef = useRef<FileType>();

  // values
  const [title, setTitle] = useState<string>("");
  const [language, setLanguage] = useState<Language | "">("");
  const [version, setVersion] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [wtsStringList, setWtsStringList] = useState<WtsString[]>([]);

  // 프로젝트 생성
  const createNewProject = async (e: any) => {
    e.preventDefault();

    if (!validateForm(e.target)) return;

    submitRef.current?.setFetchState(true);
    fileRef.current?.setDisableReloadButton(true);

    const response = await callApi("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        language: language,
        version: version,
        source: source,
        wtsStringList: wtsStringList,
      }),
    });

    if (response.success) {
      showNotificationMessage({
        message: "프로젝트가 생성되었습니다.",
        messageType: "success",
      });
    } else {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });

      submitRef.current?.setFetchState(false);
      fileRef.current?.setDisableReloadButton(false);
    }

    createProjectCallback();
  };

  const handleUploadWtsFile = (file: File) => {
    setWtsStringList(readWtsFile(file));
  };

  useEffect(() => {
    // input focus
    titleRef.current?.setFocus();
  }, []);

  return (
    <Modal
      title="New Project"
      isCloseOnOverlay={false}
      isOpen={true}
      setIsModalOpen={closeModal}
    >
      <form
        className="grid gap-6 md:grid-cols-1 p-6"
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
              labelText="LANGUAGE"
              options={getLangOptions()}
              value={language}
              onChange={(val) => setLanguage(val)}
              invalidMsg="Please select your language."
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
            labelText="SOURCE"
            placeholder="Project Source"
            onChange={setSource}
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
          <Submit ref={submitRef} buttonText="CREATE" />
        </div>
      </form>
    </Modal>
  );
});

CreateProjectModal.displayName = "CreateModal";
export default CreateProjectModal;
