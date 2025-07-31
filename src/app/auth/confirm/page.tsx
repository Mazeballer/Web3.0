// src/app/auth/confirm/page.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ConfirmPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        toast({ title: "Success", description: data.message });
      } else {
        setStatus("error");
        toast({ title: "Error", description: data.message });
      }
    } catch (err) {
      setStatus("error");
      toast({ title: "Error", description: "Something went wrong." });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Confirm Your Email</h1>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 max-w-sm"
      />
      <Button onClick={handleVerify}>Verify Email</Button>
      {status === "success" && (
        <p className="text-green-500 mt-2">Email verified!</p>
      )}
      {status === "error" && (
        <p className="text-red-500 mt-2">Verification failed.</p>
      )}
    </div>
  );
}
