"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  const [errorVisible, setErrorVisible] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="max-w-md w-full bg-card border border-border shadow-2xl rounded-3xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h1 className="text-2xl font-black text-foreground">Sentry Test Page</h1>
        <p className="text-muted-foreground text-sm">
          Click the button below to trigger a mock client-side error. Sentry should capture it instantly.
        </p>

        <button
          onClick={() => {
            setErrorVisible(true);
            throw new Error("Sentry test error — from toollixio");
          }}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors w-full"
        >
          Trigger Error!
        </button>

        {errorVisible && (
           <p className="text-xs text-green-500 mt-4 font-bold animate-pulse">
             Error thrown! Check your Sentry.io dashboard.
           </p>
        )}
      </div>
    </div>
  );
}
