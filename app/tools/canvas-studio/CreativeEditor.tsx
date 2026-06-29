"use client";

import React, { useEffect, useRef } from "react";
import CreativeEditorSDK from "@cesdk/cesdk-js";
import { uploadCanvasAsset } from "./actions";

interface CreativeEditorProps {
  onSave?: (scene: any) => void;
}

export default function CreativeEditor({ onSave }: CreativeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cesdkRef = useRef<any>(null);

  useEffect(() => {
    let cesdk: any;
    const config = {
      license: process.env.NEXT_PUBLIC_CESDK_LICENSE || "trial",
      userId: "vibe-user",
      baseURL: "/cesdk-assets",
      callbacks: {
        onUpload: async (file: File): Promise<any> => {
          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("file", file);
            uploadCanvasAsset(formData).then((result) => {
              const url = ("url" in result && result.url) ? result.url : URL.createObjectURL(file);
              // CE.SDK expects an AssetDefinition — provide a minimal valid shape
              resolve({ id: url, meta: { uri: url, thumbUri: url } });
            }).catch(() => reject(new Error("Upload failed")));
          }) as Promise<any>;
        },
        onSave: (scene: any) => {
          if (onSave) onSave(scene);
        },
      },
      ui: {
        elements: {
          navigation: {
            action: {
              save: true,
              export: true,
            },
          },
        },
      },
      i18n: {
        en: {
          "libraries.role.template.label": "Designs",
        },
      },
    };

    if (containerRef.current) {
      CreativeEditorSDK.create(containerRef.current, config).then((instance) => {
        cesdk = instance;
        cesdkRef.current = instance;
        
        // Initial setup
        cesdk.engine.scene.create();
        
        // Add a default page
        const page = cesdk.engine.block.create("page");
        cesdk.engine.block.appendChild(cesdk.engine.scene.get(), page);
      });
    }

    return () => {
      if (cesdk) {
        cesdk.dispose();
      }
    };
  }, [onSave]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[600px] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
      style={{ height: "calc(100vh - 120px)" }}
    />
  );
}
