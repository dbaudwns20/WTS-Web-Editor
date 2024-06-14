import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "WTS Web Editor - 테스트 페이지",
  description: "컴포넌트와 함수 기능을 테스트 할 수 있는 페이지 입니다",
};

export default function TestLayout({
  children,
  notification,
  confirm,
  components,
}: Readonly<{
  children: React.ReactNode;
  notification: React.ReactNode;
  confirm: React.ReactNode;
  components: React.ReactNode;
}>) {
  return (
    <div className="py-8">
      {children}
      {notification}
      {confirm}
      {components}
    </div>
  );
}
