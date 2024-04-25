import { Metadata } from "next";

import "../globals.css";

import Header from "@/components/common/header/header";
import Footer from "@/components/common/footer/footer";
import ProviderWrapper from "./provider";

export const metadata: Metadata = {
  title: "WTS Web Editor",
  description:
    "A web page that easily handles wts files from Warcraft 3 custom maps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined"
          rel="stylesheet"
        />
      </head>
      <body>
        <ProviderWrapper>
          <Header />
          <main className="main">{children}</main>
          <Footer />
          <div id="message-box"></div>
        </ProviderWrapper>
      </body>
    </html>
  );
}
