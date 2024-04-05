"use client";

import "./style.css";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

import Project, { bindProjectList } from "@/types/project";
import Language, { getLangOptions } from "@/types/language";
import { WtsString } from "@/types/wts.string";

import Modal from "@/components/common/modal";
import Select from "@/components/input/select/select";
import Text, { type TextType } from "@/components/input/text/text";
import Submit, { type SubmitType } from "@/components/button/submit";
import File from "@/components/input/file/file";
import ProjectCard from "@/components/common/project-card/project.card";

import { validateForm } from "@/utils/validator";
import { readWtsFile } from "@/utils/wts";
import { showNotificationMessage } from "@/utils/message";

export default function RootPage() {
  // ref
  const titleRef = useRef<TextType>();
  const submitRef = useRef<SubmitType>();
  const fileRef = useRef<HTMLInputElement>();

  // values
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [language, setLanguage] = useState<Language | "">("");
  const [version, setVersion] = useState<string>("");
  const [wtsStringList, setWtsStringList] = useState<WtsString[]>([]);

  const [projectList, setProjectList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 프로젝트 생성 모달창 열기
  const newProject = async () => {
    await setIsModalOpen(true);

    // title input focus
    titleRef.current?.focus();
  };

  // 프로젝트 생성
  const createNewProject = async (e: any) => {
    e.preventDefault();

    if (!validateForm(e.target)) return;

    submitRef.current?.setFetchState(true);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        language: language,
        version: version,
        wtsStringList: wtsStringList,
      }),
    });

    const result = await response.json();

    if (result.success) {
      showNotificationMessage({
        message: "프로젝트가 생성되었습니다.",
        messageType: "success",
      });
    } else {
      showNotificationMessage({
        message: result.message,
        messageType: "danger",
      });
    }
    submitRef.current?.setFetchState(false);

    // 모달 닫기
    setIsModalOpen(false);

    // 프로젝트 리스트 새로고침
    await getProjectList();
  };

  // 프로젝트 조회
  const getProjectList = async () => {
    setIsLoading(true);
    const response = await fetch("/api/projects");
    setProjectList(bindProjectList(await response.json()));
    setIsLoading(false);
  };

  // 프로젝트 삭제
  const deleteProject = async (projectId: string) => {
    setIsLoading(true);
    const response = await fetch("/api/projects/" + projectId, {
      method: "DELETE",
    });

    getProjectList();
    setIsLoading(false);
    showNotificationMessage({
      message: "프로젝트가 삭제되었습니다",
      messageType: "success",
    });
  };

  const handleUploadWtsFile = (file: File) => {
    setWtsStringList(readWtsFile(file));
  };

  useEffect(() => {
    getProjectList();
  }, []);

  return (
    <main className="main">
      <section>
        <div className="border border-grey-300 mx-10 my-10 px-10 py-10 text-center rounded-2xl">
          <p className="py-5">Logo Or Description</p>
        </div>
        <div className="mx-10 my-10">
          <div className="w-full flex justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white text-2xl font-bold p-5 rounded-lg"
              onClick={newProject}
            >
              CREATE NEW PROJECT
            </button>
          </div>
        </div>
      </section>
      <section className="project-section">
        {projectList.map((project: Project) => {
          return (
            <Link
              className="h-fit"
              href={`/projects/${project.id}`}
              key={project.id}
            >
              <ProjectCard project={project} onDeleteProject={deleteProject} />
            </Link>
          );
        })}
      </section>
      {isModalOpen ? (
        <Modal
          title="New Project"
          isOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          isCloseOnOverlay={false}
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
      ) : (
        <></>
      )}
    </main>
  );
}
