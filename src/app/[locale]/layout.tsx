import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "../globals.css";

import Header from "@/components/common/header/header";
import Footer from "@/components/common/footer/footer";

export const metadata: Metadata = {
  title: "WTS Web Editor",
  description:
    "A web page that easily handles wts files from Warcraft 3 custom maps.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider
          messages={messages}
          timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
        >
          <Header />
          <main className="main">{children}</main>
          <Footer />
          <div id="message-box"></div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
