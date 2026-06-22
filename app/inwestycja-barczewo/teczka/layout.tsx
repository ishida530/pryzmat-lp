import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { absolute: "Teczka inwestycyjna Barczewo — PRYZMAT Jerzy Sawczuk" },
  robots: { index: false, follow: false },
};

export default function TeczkaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
