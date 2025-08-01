"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import Email from "next-auth/providers/email";

export default function SignUpPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    phone: "",
    password: "",
    confirmPassword: "",
    google_signin: false,
    // fields for Step 2 and Step 3...
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    idType: "",
    idNumber: "",
    idFile: "",
    occupation: "",
    employer: "",
    income: "",
    fundsSource: "",
    investmentExp: "",
    riskTolerance: "",
    agree: false, // ✅ add this
  });
  const searchParams = useSearchParams();

  useEffect(() => {
    const firstName = searchParams.get("fn");
    const lastName = searchParams.get("ln");
    const email = searchParams.get("em");

    if (firstName && lastName && email) {
      setFormData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email,
        google_signin: true,
      }));

      const current = new URLSearchParams(window.location.search);
      current.delete("fn");
      current.delete("ln");
      current.delete("em");
      current.delete("goSignin");

      const newUrl = `${window.location.pathname}?${current.toString()}`;

      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams]);

  const handleGoogleSignUp = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Google sign-in failed.",
      });
      localStorage.removeItem("pending_google_signup");
    }
  };

  function validateStep1() {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.dob.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      (!formData.google_signin &&
        (!formData.password.trim() || !formData.confirmPassword.trim()))
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields for Personal Info.",
      });
      return false;
    }
    if (
      !formData.google_signin &&
      formData.password !== formData.confirmPassword
    ) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
      });
      return false;
    }
    return true;
  }

  // Validate Step 2: Verification
  function validateStep2() {
    if (
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.zip.trim() ||
      !formData.country.trim() ||
      !formData.idType.trim() ||
      !formData.idNumber.trim() ||
      !formData.idFile.trim()
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields for Verification.",
      });
      return false;
    }
    return true;
  }

  // Validate Step 3: Financial
  function validateStep3() {
    if (
      !formData.occupation.trim() ||
      !formData.income.trim() ||
      !formData.fundsSource.trim() ||
      !formData.investmentExp.trim() ||
      !formData.riskTolerance.trim() ||
      !formData.agree
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields for Financial.",
      });
      return false;
    }
    return true;
  }

  const handleNext = () => {
    // if (step === 1) {
    //   if (
    //     !formData.firstName ||
    //     !formData.lastName ||
    //     !formData.email ||
    //     (!formData.google_signin &&
    //       (!formData.password || !formData.confirmPassword))
    //   ) {
    //     toast({
    //       title: "Reminder",
    //       description: "Please fill in all required fields.",
    //     });
    //     return;
    //   }
    // }
    // setStep(step + 1);
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      setStep(3);
    }
  };

  const handleCreateAccount = async () => {
    if (!formData.agree) {
      toast({
        title: "Reminder",
        description: "You must agree to the Terms and Privacy Policy.",
      });
      return;
    }
    setIsLoading(true);
    try {
      // ✅ Force correct google_signin before submission
      const payload = {
        ...formData,
        google_signin: formData.google_signin || (session?.user ? true : false),
      };

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage = "Account creation failed.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.warn("⚠️ Could not parse JSON response", e);
        }

        toast({
          title: "Error",
          description: errorMessage,
        });
        return;
      }
      toast({
        title: "Verification needed",
        description:
          "Registration successful! Please confirm your email before logging in.",
      });
      setTimeout(() => {
        router.push("/auth/signin");
      }, 100);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Account creation failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleUploadKycDocument(file: File, email: string) {
    try {
      toast({
        title: "Loading",
        description: "Uploading ID document...",
      });

      // 1. OCR: Send to local OCR server
      const ocrForm = new FormData();
      ocrForm.append("file", file);
      const ocrRes = await fetch("http://localhost:4000/ocr", {
        method: "POST",
        body: ocrForm,
      });

      // Handle underage response
      if (!ocrRes.ok) {
        const ocrError = await ocrRes.json();
        if (ocrError.underage) {
          toast({
            title: "Age Restriction",
            description: "You must be at least 18 years old to register.",
          });
          setTimeout(() => {
            router.push("/");
          }, 2500);
          return null;
        }
        throw new Error(ocrError.error || "OCR failed");
      }

      const ocrData = await ocrRes.json();

      // 2. Validate extracted data against form data
      const validationErrors: string[] = [];

      // Check if DOB matches
      if (ocrData.dob && formData.dob && ocrData.dob !== formData.dob) {
        validationErrors.push("Date of birth doesn't match your ID document");
      }

      // Check if first name matches (case insensitive)
      if (
        ocrData.firstName &&
        formData.firstName &&
        !ocrData.firstName
          .toLowerCase()
          .includes(formData.firstName.toLowerCase())
      ) {
        validationErrors.push("First name doesn't match your ID document");
      }

      // Check if last name matches (case insensitive)
      if (
        ocrData.lastName &&
        formData.lastName &&
        !ocrData.lastName
          .toLowerCase()
          .includes(formData.lastName.toLowerCase())
      ) {
        validationErrors.push("Last name doesn't match your ID document");
      }

      // Check if ID number matches
      if (
        ocrData.idNumber &&
        formData.idNumber &&
        ocrData.idNumber !== formData.idNumber
      ) {
        validationErrors.push("ID number doesn't match your document");
      }

      if (validationErrors.length > 0) {
        toast({
          title: "Validation Failed",
          description:
            validationErrors.join(". ") + ". Please check your details.",
          variant: "destructive",
        });
        return null;
      }

      // 3. Upload to Supabase if validation passed
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);
      formDataToUpload.append("email", email);

      const res = await fetch("/api/upload-kyc", {
        method: "POST",
        body: formDataToUpload,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      toast({
        title: "Success",
        description: "Document uploaded and verified successfully!",
      });

      // Return both OCR and upload results
      return { ...data, ...ocrData };
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to upload and verify document.",
        variant: "destructive",
      });
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
      <Card className="bg-[#111] border border-[#222] rounded-2xl shadow-xl w-full max-w-2xl">
        <CardHeader className="space-y-3 pb-4 text-center">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <LogIn className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-white text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Complete your KYC to join the future of decentralized finance
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            {["Personal Info", "Verification", "Financial"].map(
              (label, index) => (
                <div
                  key={index}
                  className={`text-sm font-medium ${
                    step === index + 1
                      ? "text-blue-400"
                      : step > index + 1
                      ? "text-green-400"
                      : "text-gray-500"
                  }`}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {step === 1 && (
            <div className="space-y-5">
              <Button
                onClick={handleGoogleSignUp}
                className="w-full bg-white text-black hover:bg-gray-100 rounded-lg py-3"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign up with Google
              </Button>

              <div className="flex items-center justify-center space-x-2">
                <div className="h-px bg-gray-600 flex-1" />
                <span className="text-gray-400 text-sm">OR</span>
                <div className="h-px bg-gray-600 flex-1" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-300 mb-1">
                      First Name *
                    </label>
                    <input
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    type="email"
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    placeholder="(+60) 12-345 6789"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {!formData.google_signin && (
                  <>
                    <div className="flex flex-col relative">
                      <label className="text-sm text-gray-300 mb-1">
                        Password *
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-200 transition"
                      >
                        {showPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.965 9.965 0 012.084-6.126M8.4 8.4a3 3 0 014.2 4.2M15.6 15.6a3 3 0 01-4.2-4.2M3 3l18 18"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col relative">
                      <label className="text-sm text-gray-300 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-200 transition"
                      >
                        {showConfirmPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.965 9.965 0 012.084-6.126M8.4 8.4a3 3 0 014.2 4.2M15.6 15.6a3 3 0 01-4.2-4.2M3 3l18 18"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl py-5 font-semibold text-white transition"
              >
                Continue to Verification
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-300 mb-1">
                      Street Address *
                    </label>
                    <input
                      placeholder="123 Main St"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-300 mb-1">City *</label>
                    <input
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-300 mb-1">
                      State *
                    </label>
                    <input
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-300 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      placeholder="Postal Code"
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData({ ...formData, zip: e.target.value })
                      }
                      className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    Country *
                  </label>
                  <input
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    ID Type *
                  </label>
                  <select
                    value={formData.idType}
                    onChange={(e) =>
                      setFormData({ ...formData, idType: e.target.value })
                    }
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="">Select ID Type</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="National ID Card">National ID Card</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    ID Number *
                  </label>
                  <input
                    placeholder="ID Number"
                    value={formData.idNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, idNumber: e.target.value })
                    }
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    Upload ID Document *
                  </label>
                  <label
                    htmlFor="idFile"
                    className="flex flex-col items-center justify-center border border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400 group-hover:text-blue-400 transition"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v9m0-9L8 16m4-4l4 4m0-4V4m0 0L8 8m4-4l4 4"
                      />
                    </svg>
                    <p className="text-gray-400 mt-2 group-hover:text-blue-400 transition text-sm">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      PNG, JPG, PDF up to 10MB
                    </p>
                    <button
                      type="button"
                      className="mt-3 px-4 py-1 rounded-md bg-gray-800 text-sm text-white border border-gray-600 hover:bg-gray-700 transition"
                    >
                      Choose File
                    </button>
                    <input
                      id="idFile"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const result = await handleUploadKycDocument(
                          file,
                          formData.email
                        );
                        if (result) {
                          if (
                            result.dob &&
                            formData.dob &&
                            result.dob !== formData.dob
                          ) {
                            toast({
                              title: "DOB Mismatch",
                              description:
                                "The date of birth detected from your ID does not match the one you entered. Please check and try again.",
                            });
                            return;
                          }
                          setFormData({
                            ...formData,
                            idFile: result.publicUrl,
                            idNumber: result.nric || formData.idNumber,
                            dob: result.dob || formData.dob,
                            firstName: result.firstName || formData.firstName,
                            lastName: result.lastName || formData.lastName,
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {formData.idFile && (
                    <a
                      href={formData.idFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline"
                    >
                      View Uploaded Document
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-xl py-5 font-semibold text-white transition"
                >
                  Back
                </Button>
                <Button
                  onClick={
                    // () => setStep(3)
                    handleNext
                  }
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl py-5 font-semibold text-white transition"
                >
                  Continue to Financial
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    Occupation *
                  </label>
                  <input
                    placeholder="Software Engineer"
                    value={formData.occupation}
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">Employer</label>
                  <input
                    placeholder="Company (optional)"
                    value={formData.employer}
                    onChange={(e) =>
                      setFormData({ ...formData, employer: e.target.value })
                    }
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    Annual Income *
                  </label>
                  <select
                    value={formData.income}
                    onChange={(e) =>
                      setFormData({ ...formData, income: e.target.value })
                    }
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="">Select Income Range</option>
                    <option value="Under $50,000">Under $50,000</option>
                    <option value="$50,000 - $100,000">
                      $50,000 - $100,000
                    </option>
                    <option value="$100,000 - $250,000">
                      $100,000 - $250,000
                    </option>
                    <option value="Over $250,000">Over $250,000</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    Source of Funds *
                  </label>
                  <textarea
                    placeholder="Describe your source of funds..."
                    value={formData.fundsSource}
                    onChange={(e) =>
                      setFormData({ ...formData, fundsSource: e.target.value })
                    }
                    rows={3}
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    Investment Experience *
                  </label>
                  <select
                    value={formData.investmentExp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        investmentExp: e.target.value,
                      })
                    }
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="">Select Experience</option>
                    <option value="Beginner (0-2 years)">
                      Beginner (0-2 years)
                    </option>
                    <option value="Intermediate (2-5 years)">
                      Intermediate (2-5 years)
                    </option>
                    <option value="Experienced (5+ years)">
                      Experienced (5+ years)
                    </option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1">
                    Risk Tolerance *
                  </label>
                  <select
                    value={formData.riskTolerance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        riskTolerance: e.target.value,
                      })
                    }
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-inner text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="">Select Risk Tolerance</option>
                    <option value="Conservative">Conservative</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={formData.agree}
                      onChange={(e) =>
                        setFormData({ ...formData, agree: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 transition"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-300 select-none"
                    >
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="text-blue-400 hover:text-blue-300 underline decoration-dotted"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="text-blue-400 hover:text-blue-300 underline decoration-dotted"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-xl py-5 font-semibold text-white transition"
                >
                  Back
                </Button>
                <Button
                  onClick={
                    // handleCreateAccount
                    () => {
                      if (validateStep3()) handleCreateAccount();
                    }
                  }
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl py-5 font-semibold text-white transition"
                >
                  {isLoading ? "Creating Account..." : "Complete Registration"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
