"use client";

import "./style.css";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import ProjectCard from "@/app/(pages)/_project-card/project.card";
import ProjectCardSkeleton from "@/app/(pages)/_project-card/skeleton/project.card.skeleton";
import CreateProjectModal from "@/app/(pages)/_create-project-modal/create.project.modal";

import Project, { bindProjectList } from "@/types/project";
import { type OrderInfo, type PageInfo } from "@/types/pagination";

import { showNotificationMessage } from "@/utils/message";
import { callApi } from "@/utils/common";

import { useDispatch } from "react-redux";

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
  const router = useRouter();
  const dispatch = useDispatch();

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
  const newProject = async () => {
    setIsModalOpen(true);
  };

  const createProjectCallback = () => {
    // 모달 닫기
    setIsModalOpen(false);

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

  const goProject = async (project: Project) => {
    // 이동할 프로젝트 정보를 storage 에 저장
    dispatch({ type: "project/setProject", payload: project });
    // router push
    router.push(`/projects/${project.id}`);
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
          createProjectCallback={createProjectCallback}
        />
      ) : (
        <></>
      )}
    </>
  );
}
