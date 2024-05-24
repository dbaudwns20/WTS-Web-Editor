import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";

import { getLangOptions } from "@/types/language";
import WtsString from "@/types/wts.string";
import Project from "@/types/project";

import Modal from "@/components/common/modal/modal";
import Select from "@/components/input/select/select";
import Text, { type TextType } from "@/components/input/text/text";
import Submit, { type SubmitType } from "@/components/button/submit";
import File, { type FileType } from "@/components/input/file/file";

import { checkDataEdited, validateForm } from "@/utils/validator";
import { readWtsFile } from "@/utils/wts";
import { showConfirmMessage, showNotificationMessage } from "@/utils/message";
import { callApi } from "@/utils/common";

type UpdateProjectModalProps = {
  project: Project;
  setStringListKey: Dispatch<SetStateAction<number>>;
  closeModal: Dispatch<SetStateAction<boolean>>;
  completeFunction: (...arg: any) => void;
};

const UpdateProjectModal = forwardRef((props: UpdateProjectModalProps, ref) => {
  const { project, closeModal, setStringListKey, completeFunction } = props;

  // ref
  const titleRef = useRef<TextType>();
  const submitRef = useRef<SubmitType>();
  const fileRef = useRef<FileType>();

  // values
  const [title, setTitle] = useState<string>(project.title);
  const [language, setLanguage] = useState<number>(project.language);
  const [version, setVersion] = useState<string>(project.version ?? "");
  const [source, setSource] = useState<string>(project.source ?? "");
  const [wtsStringList, setWtsStringList] = useState<WtsString[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleUpdateProject = (e: any) => {
    e.preventDefault();

    if (wtsStringList.length > 0) {
      showConfirmMessage({
        title: "Update Project",
        message:
          "You have uploaded a WTS file. The existing string data will be updated with the new data, and re-translation may be necessary.",
        buttons: [
          {
            label: "No",
            onClick: () => null,
          },
          {
            label: "Yes",
            class: "info",
            onClick: async () => await updateProject(e),
          },
        ],
      });
    } else {
      updateProject(e);
    }
  };

  const updateProject = async (e: any) => {
    e.preventDefault();

    // check required values
    if (!validateForm(e.target)) return;
    // check data is changed
    if (
      !checkDataEdited(
        {
          title: project.title,
          language: project.language,
          version: project.version ?? "",
          source: project.source ?? "",
        },
        {
          title,
          language,
          version,
          source,
        }
      ) &&
      wtsStringList.length === 0
    ) {
      showNotificationMessage({
        message: "No data edited.",
        messageType: "warning",
      });
      return;
    }

    setIsFetching(true);

    const response = await callApi(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        language,
        version,
        source,
        ...(wtsStringList.length > 0 && {
          wtsStringList,
        }),
      }),
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
      // wts 가 변경되면 string list 갱신
      if (wtsStringList.length > 0) setStringListKey((pre) => pre + 1);
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
      title="Update Project"
      isCloseOnOverlay={false}
      setIsModalOpen={closeModal}
    >
      <form
        className="grid gap-6 md:grid-cols-1 p-6"
        onSubmit={handleUpdateProject}
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
              onChange={(val) => setLanguage(Number(val))}
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

UpdateProjectModal.displayName = "UpdateProjectModal";
export default UpdateProjectModal;
