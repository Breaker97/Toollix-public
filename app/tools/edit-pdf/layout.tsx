import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit PDF – Toollix",
  description: "Online PDF editor with text, image, and drawing annotations.",
  alternates: {
    canonical: "/tools/edit-pdf",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EditPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
