"use client";

import { useParams } from "next/navigation";

export default function ProjectDetailLayout({
  children,
  strings,
}: Readonly<{
  children: React.ReactNode;
  strings: React.ReactNode;
}>) {
  const { projectId }: any = useParams();

  return (
    <>
      {children}
      {strings}
    </>
  );
}
