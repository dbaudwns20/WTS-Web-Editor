import {
  useRef,
  forwardRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";

import { getLocaleList } from "@/types/locale";
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

import { useTranslations } from "next-intl";

type CreateProjectModalProps = {
  closeModal: Dispatch<SetStateAction<boolean>>;
  completeFunction: (...arg: any) => void;
};

const CreateProjectModal = forwardRef((props: CreateProjectModalProps, ref) => {
  const { closeModal, completeFunction } = props;

  // i18n translate key
  const t = useTranslations("PROJECT_MODAL");
  const et = useTranslations("ERROR");

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
        message: t("CREATE.SUCCESS_MESSAGE"),
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
      title={t("MODAL_TITLE", { type: "create" })}
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
              labelText={t("VERSION.LABEL")}
              value={version}
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
            labelText={t("IMAGE.LABEL")}
            isRequired={true}
            imageFile={imageFile}
            setImageFile={setImageFile}
          />
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
            buttonText={t("CREATE.CREATE_BUTTON")}
            buttonClass="button is-info"
          />
        </div>
      </form>
    </Modal>
  );
});

CreateProjectModal.displayName = "CreateModal";
export default CreateProjectModal;
