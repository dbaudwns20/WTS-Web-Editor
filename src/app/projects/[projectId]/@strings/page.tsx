"use client";

import "./style.css";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import String, { bindStringList } from "@/types/string";

import { callApi } from "@/utils/common";
import { showNotificationMessage } from "@/utils/message";

export default function Strings() {
  const router = useRouter();
  const { projectId } = useParams();

  const [stringList, setStringList] = useState<String[]>([]);

  const getStringList = async () => {
    const response = await callApi(`/api/projects/${projectId}/strings`);

    if (!response.success) {
      showNotificationMessage({
        message: response.message,
        messageType: "danger",
      });
      return;
    }

    setStringList(bindStringList(response.data));
  };

  const goFirstString = () => {
    router.replace(`/projects/${projectId}?strings=1`);
  };

  useEffect(() => {
    getStringList();
    goFirstString();
  }, []);

  return (
    <section className="string-content-section">
      <div className="string-list-wrapper">
        {/* <input
          className="border border-gray-300 w-full rounded-lg mb-4 h-9"
          type="text"
        /> */}
        <div className="string-list">
          {stringList.map((string: String) => {
            return (
              <Link
                href={`/projects/${projectId}?strings=${string.stringNumber}`}
                key={string.stringNumber}
                className="string"
              >
                <label className="number">STRING {string.stringNumber}</label>
                <p className="content">{string.originalText}</p>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="border border-gray-300 rounded-lg w-3/4"></div>
    </section>
  );
}
