"use client";

import "./style.css";

import { useState, useEffect } from "react";
import { useRouter } from "@/navigation";
import Image from "next/image";

import ProjectCard from "@/app/[locale]/_project-card/project.card";
import ProjectCardSkeleton from "@/app/[locale]/_project-card/skeleton/project.card.skeleton";
import CreateProjectModal from "@/app/[locale]/_create-project-modal/create.project.modal";

import Project, { bindProjectList } from "@/types/project";
import { type OrderInfo, type PageInfo } from "@/types/api.response";

import { showNotificationMessage } from "@/utils/message";
import { callApi } from "@/utils/common";

import LogoMain from "@/assets/logo.svg";
import { useTranslations } from "next-intl";

const defaultPageInfo: PageInfo = {
  offset: 8,
  currentPage: 1,
  totalPage: 1,
  totalCount: 0,
};

const defaultOrderInfo: OrderInfo = {
  sort: "createdAt",
  order: "DESC",
};

export default function RootPage() {
  const router = useRouter();

  // i18n translate key
  const t = useTranslations("MAIN");
  const et = useTranslations("ERROR");

  // values
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);

  // 페이징 정보
  const [pageInfo, setPageInfo] = useState<PageInfo>(defaultPageInfo);
  // 정렬 정보
  const [orderInfo, setOrderInfo] = useState<OrderInfo>(defaultOrderInfo);

  // 프로젝트 생성 모달창 열기
  const newProject = () => {
    setIsModalOpen(true);
  };

  // 함수 호출 후 처리
  const completeFunction = (callbacks: Function) => {
    // 콜백함수 호출
    callbacks();

    // 조회정보 초기화
    setPageInfo(defaultPageInfo);
    setOrderInfo(defaultOrderInfo);

    // 프로젝트 리스트 새로고침
    getProjectList();
  };

  // 프로젝트 조회
  const getProjectList = async () => {
    setIsLoading(true);

    const response = await callApi(
      `/api/projects?offset=${pageInfo.offset}&currentPage=${pageInfo.currentPage}&sort=${orderInfo.sort}&order=${orderInfo.order}`
    );

    if (!response.success) {
      let message: string = response.message;
      if (response.errorCode) {
        message = et(response.errorCode, { arg: response.arg });
      }
      showNotificationMessage({
        message: message,
        messageType: "danger",
      });
      setIsLoading(false);
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
      let message: string = response.message;
      if (response.errorCode) {
        message = et(response.errorCode, { arg: response.arg });
      }
      showNotificationMessage({
        message: message,
        messageType: "danger",
      });
      setIsMoreLoading(false);
      return;
    }

    setPageInfo(response.pageInfo);
    setProjectList(projectList.concat(bindProjectList(response.data)));

    setIsMoreLoading(false);
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

  const goProject = (project: Project) => {
    let url: string = `/projects/${project.id}`;

    if (project.lastModifiedStringNumber !== -1) {
      url += `?strings=${project.lastModifiedStringNumber}`;
    }

    // router push
    router.push(url);
  };

  // 스크롤이 맨 밑으로 갈 경우 추가 데이터 로딩
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  // 프로젝트 리스트 조회
  useEffect(() => {
    getProjectList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section className="flex flex-col justify-center items-center pb-8">
        <div className="flex justify-center items-center gap-5">
          <Image src={LogoMain} alt="logo_main" width={350} priority />
        </div>
        <div className="w-full flex justify-center">
          <button
            className="button is-primary !text-xl !px-5 !py-3 !m-3.5"
            onClick={newProject}
          >
            {t("CREATE_PROJECT_BUTTON")}
          </button>
        </div>
      </section>
      <section className="project-section">
        {isLoading ? (
          <ProjectCardSkeleton />
        ) : (
          <>
            {projectList!.map((project: Project) => {
              return (
                <a
                  className="hover:cursor-pointer"
                  key={project.id}
                  onClick={() => {
                    goProject(project);
                  }}
                >
                  <ProjectCard project={project} />
                </a>
              );
            })}
          </>
        )}
        {isMoreLoading ?? <ProjectCardSkeleton />}
      </section>
      {isModalOpen ? (
        <CreateProjectModal
          closeModal={setIsModalOpen}
          completeFunction={completeFunction}
        />
      ) : (
        <></>
      )}
    </>
  );
}
