"use client";

import "./style.css";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import Modal from "@/components/common/modal";
import Select from "@/components/input/select/select";
import Text, { type TextType } from "@/components/input/text/text";
import Submit, { type SubmitType } from "@/components/button/submit";
import File from "@/components/input/file/file";
import ProjectCard from "@/components/project-card/project.card";
import ProjectCardSkeleton from "@/components/project-card/skeleton/project.card.skeleton";

import Project, { bindProjectList } from "@/types/project";
import Language, { getLangOptions } from "@/types/language";
import { WtsString } from "@/types/wts.string";
import { type OrderInfo, type PageInfo } from "@/types/pagination";

import { validateForm } from "@/utils/validator";
import { readWtsFile } from "@/utils/wts";
import { showNotificationMessage } from "@/utils/message";
import { callApi } from "@/utils/common";

import LogoMain from "@/assets/logo.png";

const defaultPageInfo: PageInfo = {
  offset: 8,
  currentPage: 1,
  totalPage: 1,
  totalCount: 0,
};

const defaultOrderInfo: OrderInfo = {
  sort: "dateCreated",
  order: "DESC",
};

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
  const [projectList, setProjectList] = useState<Project[] | null>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);

  // 페이징 정보
  const [pageInfo, setPageInfo] = useState<PageInfo>(defaultPageInfo);
  // 정렬 정보
  const [orderInfo, setOrderInfo] = useState<OrderInfo>(defaultOrderInfo);

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

    const response = await callApi("/api/projects", {
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
    }
    submitRef.current?.setFetchState(false);

    // 모달 닫기
    setIsModalOpen(false);

    // 조회정보 초기화
    await setPageInfo(defaultPageInfo);
    await setOrderInfo(defaultOrderInfo);

    // 프로젝트 리스트 새로고침
    await getProjectList();
  };

  // 프로젝트 조회
  const getProjectList = async () => {
    setIsLoading(true);

    const response = await callApi(
      `/api/projects?offset=${pageInfo.offset}&currentPage=${pageInfo.currentPage}&sort=${orderInfo.sort}&order=${orderInfo.order}`
    );

    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    setPageInfo(response.pageInfo);
    setProjectList(bindProjectList(response.data));

    setIsLoading(false);
  };

  // 스크롤링으로 추가 데이터 조회
  const getMoreProjectList = async () => {
    setIsMoreLoading(true);

    const response = await callApi(
      `/api/projects?offset=${pageInfo.offset}&currentPage=${
        pageInfo.currentPage + 1
      }&sort=${orderInfo.sort}&order=${orderInfo.order}`
    );

    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    setPageInfo(response.pageInfo);
    setProjectList((prev) => prev!.concat(bindProjectList(response.data)));

    setIsMoreLoading(false);
  };

  const handleUploadWtsFile = (file: File) => {
    setWtsStringList(readWtsFile(file));
  };

  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    if (
      scrollTop + clientHeight >= scrollHeight &&
      pageInfo.currentPage < pageInfo.totalPage &&
      !isMoreLoading
    ) {
      getMoreProjectList();
    }
  };

  // 스크롤이 맨 밑으로 갈 경우 추가 데이터 로딩
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  // 프로젝트 리스트 조회
  useEffect(() => {
    getProjectList();
  }, []);

  return (
    <>
      <section className="flex flex-col justify-center items-center pb-8">
        <div className="flex justify-center items-center gap-5">
          <Image src={LogoMain} alt="logo_main" width={400} />
        </div>
        <div className="">
          <div className="w-full flex justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white text-2xl font-bold p-5 rounded-lg m-3.5"
              onClick={newProject}
            >
              CREATE NEW PROJECT
            </button>
          </div>
        </div>
      </section>
      <section className="project-section">
        {isLoading ? (
          <ProjectCardSkeleton />
        ) : (
          <>
            {projectList!.map((project: Project) => {
              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <ProjectCard project={project} />
                </Link>
              );
            })}
          </>
        )}
        {isMoreLoading ? <ProjectCardSkeleton /> : <></>}
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
    </>
  );
}
