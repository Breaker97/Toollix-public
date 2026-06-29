import { Metadata } from "next";
import CanvasStudioClient from "./CanvasStudioClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Canvas Studio | Toollix",
  description: "A professional design workspace for creating graphics and social posts.",
};

export default async function CanvasStudioPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    const params = new URLSearchParams(searchParams as any).toString();
    const callbackUrl = `/tools/canvas-studio${params ? `?${params}` : ""}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return <CanvasStudioClient />;
}
