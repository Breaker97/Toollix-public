"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Suspense } from "react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your request...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No valid unsubscribe token provided in the URL.");
      return;
    }

    fetch(`/api/user/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus("success");
          setMessage("You have been successfully unsubscribed from all marketing and promotional emails. You will still receive crucial account updates.");
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to unsubscribe. This token might be invalid or expired.");
        }
      })
      .catch(err => {
        setStatus("error");
        setMessage("A network error occurred. Please try again later.");
      });

  }, [token]);

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/50">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-6">
          {status === "loading" && <Loader2 className="w-16 h-16 text-primary animate-spin" />}
          {status === "success" && (
            <div className="p-4 rounded-full bg-emerald-500/10 mb-2">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
          )}
          {status === "error" && (
            <div className="p-4 rounded-full bg-red-500/10 mb-2">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
          )}
        </div>
        <CardTitle className="text-3xl font-black tracking-tight">
          {status === "loading" ? "Unsubscribing..." : status === "success" ? "Unsubscribed" : "Error"}
        </CardTitle>
        <CardDescription className="text-base mt-2 font-medium leading-relaxed">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pt-4">
        <Link href="/">
           <Button variant="outline" className="font-bold px-8 shadow-sm">
              Return to Toollix
           </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
