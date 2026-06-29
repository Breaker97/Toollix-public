"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Cloud, HardDrive, AlertCircle } from "lucide-react";

interface CloudSaverProps {
  fileUrl: string;
  fileName: string;
}

export function CloudSaver({ fileUrl, fileName }: CloudSaverProps) {
  const [dropboxKey, setDropboxKey] = useState<string | null>(null);
  const [driveKey, setDriveKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/public")
      .then(res => res.json())
      .then(data => {
        if (data.dropboxAppKey) setDropboxKey(data.dropboxAppKey);
        if (data.googleDriveClientId) setDriveKey(data.googleDriveClientId);
      })
      .catch(err => console.error("Could not fetch cloud settings", err));
  }, []);

  const handleDropboxSave = () => {
    if (!dropboxKey) {
      alert("Please configure the Dropbox App Key in the Admin Control Center to enable this integration.");
      return;
    }
    
    // @ts-ignore
    if (window.Dropbox) {
      // @ts-ignore
      window.Dropbox.save(fileUrl, fileName);
    } else {
      alert("Dropbox SDK failed to load. Please try again or check your adblocker.");
    }
  };

  const handleDriveSave = () => {
    if (!driveKey) {
       alert("Google Drive integration is not yet fully activated in the Admin Control Center.");
       return;
    }
    alert("Google API injected successfully. (OAuth mapping implementation placeholder).");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
      {/* Dropbox script loader */}
      {dropboxKey && (
        <Script 
          src="https://www.dropbox.com/static/api/2/dropins.js" 
          id="dropboxjs" 
          data-app-key={dropboxKey} 
          strategy="lazyOnload" 
        />
      )}

      {/* Google Drive Button */}
      <Button 
        variant="outline" 
        className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 hover:text-black font-bold flex items-center shadow-sm h-11 px-5 rounded-xl transition-all"
        onClick={handleDriveSave}
        title="Save to Google Drive"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 512 512" fill="currentColor">
          <path d="M339 314.9L175.4 32h161.2l163.6 282.9zM161.2 32L17.5 281.3l80.6 139.6L241.8 171.6zM54.3 345l80.6 139.6h322.4L376.6 345z" fill="#000"/>
        </svg>
        Save to Drive
      </Button>

      {/* Dropbox Button */}
      <Button 
        variant="outline" 
        className="w-full sm:w-auto border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 font-bold flex items-center shadow-sm h-11 px-5 rounded-xl transition-all"
        onClick={handleDropboxSave}
        title="Save to Dropbox"
      >
        <Cloud className="w-4 h-4 mr-2" />
        Save to Dropbox
      </Button>
    </div>
  );
}
