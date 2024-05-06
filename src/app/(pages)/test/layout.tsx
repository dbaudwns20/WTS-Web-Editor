import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WTS Web Editor - 테스트 페이지",
  description: "컴포넌트와 함수 기능을 테스트 할 수 있는 페이지 입니다",
};

export default function TestLayout({
  children,
  notification,
  confirm,
}: Readonly<{
  children: React.ReactNode;
  notification: React.ReactNode;
  confirm: React.ReactNode;
}>) {
  return (
    <div className="py-8">
      {children}
      {notification}
      {confirm}
    </div>
  );
}
