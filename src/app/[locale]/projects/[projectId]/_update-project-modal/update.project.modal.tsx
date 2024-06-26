import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
  FormEvent,
} from "react";

import { getLocaleList } from "@/types/locale";
import WtsString from "@/types/wts.string";
import Project from "@/types/project";

import Modal from "@/components/common/modal/modal";
import Select from "@/components/input/select/select";
import Text, { type TextType } from "@/components/input/text/text";
import Submit, { type SubmitType } from "@/components/button/submit";
import File, { type FileType } from "@/components/input/file/file";
import ImageUpload, {
  type ImageUploadType,
} from "@/components/input/image-upload/image.upload";

import { checkDataEdited, validateForm } from "@/utils/validator";
import { readWtsFile } from "@/utils/wts";
import { showConfirmMessage, showNotificationMessage } from "@/utils/message";
import { callApi } from "@/utils/common";

import { useTranslations } from "next-intl";

type UpdateProjectModalProps = {
  project: Project;
  setStringListKey: Dispatch<SetStateAction<number>>;
  closeModal: Dispatch<SetStateAction<boolean>>;
  completeFunction: (...arg: any) => void;
};

const UpdateProjectModal = forwardRef((props: UpdateProjectModalProps, ref) => {
  const { project, closeModal, setStringListKey, completeFunction } = props;

  // i18n translate key
  const t = useTranslations("PROJECT_MODAL");
  const et = useTranslations("ERROR");

  // ref
  const titleRef = useRef<TextType>();
  const submitRef = useRef<SubmitType>();
  const fileRef = useRef<FileType>();
  const imageUploadRef = useRef<ImageUploadType>();

  // values
  const [title, setTitle] = useState<string>(project.title);
  const [locale, setLocale] = useState<number>(project.locale);
  const [version, setVersion] = useState<string>(project.version ?? "");
  const [source, setSource] = useState<string>(project.source ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [wtsStringList, setWtsStringList] = useState<WtsString[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleUpdateProject = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (wtsStringList.length > 0) {
      showConfirmMessage({
        title: t("UPDATE.CONFIRM.TITLE"),
        message: t("UPDATE.CONFIRM.MESSAGE"),
        buttons: [
          {
            label: t("UPDATE.CONFIRM.NO_LABEL"),
            onClick: () => null,
          },
          {
            label: t("UPDATE.CONFIRM.OK_LABEL"),
            class: "info",
            onClick: async () => await updateProject(e),
          },
        ],
      });
    } else {
      updateProject(e);
    }
  };

  const updateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // check required values
    if (!validateForm(e.target as HTMLFormElement)) return;
    // check data is changed
    if (
      !checkDataEdited(
        {
          title: project.title,
          locale: project.locale,
          version: project.version ?? "",
          source: project.source ?? "",
        },
        {
          title,
          locale,
          version,
          source,
        }
      ) &&
      wtsStringList.length === 0 &&
      !imageUploadRef.current?.isEdited
    ) {
      showNotificationMessage({
        message: t("UPDATE.NO_EDITED"),
        messageType: "warning",
      });
      return;
    }

    setIsFetching(true);

    // formData 가공
    const formData = new FormData();
    formData.append("title", title);
    formData.append("locale", locale.toString());
    if (version && version !== project.version) {
      formData.append("version", version);
    }
    if (source && source !== project.source) {
      formData.append("source", source);
    }
    if (imageUploadRef.current?.isEdited) {
      formData.append("imageFile", imageFile!);
    }
    if (wtsStringList.length > 0) {
      formData.append("wtsStringList", JSON.stringify(wtsStringList));
    }

    const response = await callApi(`/api/projects/${project.id}`, {
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
        message: t("UPDATE.SUCCESS_MESSAGE"),
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
      title={t("MODAL_TITLE", { type: "update" })}
      isCloseOnOverlay={false}
      setIsModalOpen={closeModal}
    >
      <form
        className="grid gap-4 px-6 pt-3 pb-6"
        onSubmit={handleUpdateProject}
        noValidate
      >
        <div className="block">
          <Text
            ref={titleRef}
            value={title}
            labelText={t("TITLE.LABEL")}
            placeholder={t("TITLE.PLACEHOLDER")}
            min={2}
            max={200}
            required={{
              isRequired: true,
              invalidMessage: t("TITLE.INVALID_MESSAGE"),
            }}
            onChange={setTitle}
          />
        </div>
        <div className="block-group">
          <div className="block">
            <Select
              labelText={t("LOCALE.LABEL")}
              defaultOption={{ id: "", value: t("LOCALE.DEFAULT") }}
              options={getLocaleList()}
              value={locale}
              required={{
                isRequired: true,
                invalidMessage: t("LOCALE.INVALID_MESSAGE"),
              }}
              onChange={(val) => setLocale(Number(val))}
            />
          </div>
          <div className="block">
            <Text
              value={version}
              labelText={t("VERSION.LABEL")}
              placeholder="ex) 1.0.0"
              max={20}
              pattern={{
                regExp: new RegExp(
                  /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?(\+[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$/
                ),
                invalidMessage: t("VERSION.INVALID_MESSAGE"),
              }}
              onChange={setVersion}
            />
          </div>
        </div>
        <div className="block">
          <Text
            value={source}
            labelText={t("SOURCE_URL.LABEL")}
            placeholder={t("SOURCE_URL.PLACEHOLDER")}
            max={250}
            pattern={{
              regExp: new RegExp(/^(https?):\/\/[^\s/$.?#].[^\s]*$/),
              invalidMessage: t("SOURCE_URL.INVALID_MESSAGE"),
            }}
            onChange={setSource}
          />
        </div>
        <div className="block">
          <ImageUpload
            ref={imageUploadRef}
            labelText={t("IMAGE.LABEL")}
            imageFile={imageFile}
            setImageFile={setImageFile}
            defaultProjectImage={project.projectImage}
          />
        </div>
        <div className="block">
          <File
            ref={fileRef}
            labelText={t("WTS_FILE.LABEL")}
            onChange={handleUploadWtsFile}
            accept=".wts"
          />
        </div>
        <div className="block text-center">
          <Submit
            ref={submitRef}
            buttonText={t("UPDATE.UPDATE_BUTTON")}
            buttonClass="button is-info"
          />
        </div>
      </form>
    </Modal>
  );
});

UpdateProjectModal.displayName = "UpdateProjectModal";
export default UpdateProjectModal;
