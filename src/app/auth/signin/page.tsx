"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
// import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const error = searchParams.get("error");
    if (!error) return;

    // Debug
    console.log("Error parameter found:", error);

    // Show toast with slight delay to ensure Sonner is ready
    setTimeout(() => {
      if (error === "GoogleSignInNotAllowed") {
        toast({
          title: "Error",
          description: "This account is not registered for Google Sign-In.",
        });
      } else if (error === "OAuthAccountNotLinked") {
        toast({
          title: "Error",
          description:
            "This email is registered with a different sign-in method.",
        });
      } else if (error === "NotRegisteredForGoogle") {
        toast({
          title: "Error",
          description: "This email is not registered.",
        });
      }
    }, 100); // small delay ensures Sonner has mounted

    // Clean URL immediately after displaying the toast
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
  }, [isHydrated, searchParams]);

  const handleLogin = async () => {
    try {
      // Sign in with credentials
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, // Don't let NextAuth handle the redirect
        callbackUrl: "/dashboard", // Still define where you want to go
      });

      console.log("SignIn response:", res);

      if (res?.error) {
        // If there's an error, show it
        if (res.error == "User not verified") {
          toast({
            title: "Email not verified",
            description: "Please check your inbox and verify your email.",
          });
        } else {
          console.log("Login error:", res.error);
          toast({
            title: "Incorrect Credentials",
            description: "Invalid email or password",
          });
        }
      } else if (res?.ok) {
        // If sign-in is successful, redirect to dashboard
        router.push("/dashboard");
      } else {
        console.log("Unexpected response:", res);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login catch error:", error);
      toast({
        title: "Error",
        description: "An error occurred during sign in.",
      });
    } finally {
      console.log("Setting loading to false");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Sign in with Google
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      <Card className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#222]/50 rounded-2xl shadow-2xl w-full max-w-xl relative z-10 hover:shadow-blue-500/5 transition-all duration-300">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-white text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-center text-gray-400 text-sm leading-relaxed">
            Login to continue your decentralized finance journey
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full bg-white text-black hover:bg-gray-100 border-none rounded-xl py-6 font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <Mail className="w-5 h-5 mr-3" /> Sign in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a0a] px-4 text-gray-500 font-medium">
                or sign in with email
              </span>
            </div>
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1a1a1a]/60 border-[#333] text-white pl-10 rounded-xl py-6 backdrop-blur-sm focus:border-blue-500 transition-all duration-200 hover:bg-[#1a1a1a]/80"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1a1a1a]/60 border-[#333] text-white pl-10 pr-12 rounded-xl py-6 backdrop-blur-sm focus:border-blue-500 transition-all duration-200 hover:bg-[#1a1a1a]/80"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-blue-400 hover:text-blue-300 transition-colors hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-6 font-semibold text-base hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-3" /> Sign In
              </>
            )}
          </Button>
          <div className="text-center pt-4">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
