"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RiderRegisterPage() {
  const router = useRouter();

  // Form input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nidNumber, setNidNumber] = useState("");

  // NID file and preview states
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Loading and message states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // NID file change handler
  const handleNidFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    setErrorMessage("");

    if (!selectedFile) {
      setNidFile(null);
      setPreviewUrl("");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    // File type validation
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage("Only JPG, JPEG, PNG or PDF files are allowed.");

      setNidFile(null);
      setPreviewUrl("");
      event.target.value = "";
      return;
    }

    // 10 MB file-size validation
    const maximumFileSize = 10 * 1024 * 1024;

    if (selectedFile.size > maximumFileSize) {
      setErrorMessage("The file size must not exceed 10MB.");

      setNidFile(null);
      setPreviewUrl("");
      event.target.value = "";
      return;
    }

    setNidFile(selectedFile);

    // Create preview only for images
    if (selectedFile.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl("");
    }
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  //handel Submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Remove previous messages
    setErrorMessage("");
    setSuccessMessage("");

    // 1. Empty field validation
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword ||
      !nidNumber.trim()
    ) {
      setErrorMessage("Please fill in all the fields.");
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // 2. Bangladesh phone-number validation
    const phonePattern = /^01\d{9}$/;

    if (!phonePattern.test(phone.trim())) {
      setErrorMessage(
        "Phone number must be an 11-digit number starting with 01.",
      );
      return;
    }

    // 3. NID number validation
    const nidPattern = /^\d{10}$/;

    if (!nidPattern.test(nidNumber.trim())) {
      setErrorMessage("NID number must be exactly 10 digits.");
      return;
    }

    // 4. Password matching validation
    if (password !== confirmPassword) {
      setErrorMessage("Password and Confirm Password do not match.");
      return;
    }

    // 5. Password requirements
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordPattern.test(password)) {
      setErrorMessage(
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
      );
      return;
    }

    // 6. NID file validation
    if (!nidFile) {
      setErrorMessage("Please select an NID file.");
      return;
    }

    // API request start
    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("password", password);
      formData.append("nidNumber", nidNumber.trim());
      formData.append("nidImage", nidFile);

      await api.post("/auth/register-rider", formData);

      setSuccessMessage(
        "Registration successful! Your account will be reviewed by the admin.",
      );

      // Reset the form state
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setNidNumber("");
      setNidFile(null);
      setPreviewUrl("");

      // 2.5 seconds later login page redirect
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;

        setErrorMessage(
          Array.isArray(serverMessage)
            ? serverMessage.join(", ")
            : serverMessage || "Rider registration failed.",
        );
      } else {
        setErrorMessage("Unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Rider Registration
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Create your rider account and submit your NID information.
          </p>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@email.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="01XXXXXXXXX"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-20 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-20 text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-200"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {/* NID Number */}
          <div>
            <label
              htmlFor="nidNumber"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              NID Number
            </label>

            <input
              id="nidNumber"
              name="nidNumber"
              type="text"
              value={nidNumber}
              onChange={(event) => setNidNumber(event.target.value)}
              placeholder="10-digit NID"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/* NID File Upload */}
          <div>
            <label
              htmlFor="nidFile"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Upload NID
            </label>

            <input
              id="nidFile"
              name="nidFile"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleNidFileChange}
              required
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 hover:file:bg-blue-700"
            />

            <p className="mt-2 text-xs text-gray-500">
              Supported files: JPG, JPEG, PNG and PDF. Maximum size: 10MB.
            </p>
          </div>

          {/* Image Preview */}
          {nidFile?.type.startsWith("image/") && previewUrl && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-sm font-medium text-gray-700">
                NID image preview
              </p>

              <img
                src={previewUrl}
                alt="Selected NID preview"
                className="h-44 w-full rounded-lg object-contain"
              />

              <p className="mt-2 truncate text-xs text-gray-500">
                {nidFile.name}
              </p>
            </div>
          )}

          {/* PDF File Name */}
          {nidFile?.type === "application/pdf" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">PDF selected</p>

              <p className="mt-1 break-all text-sm text-gray-700">
                {nidFile.name}
              </p>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              <p>{successMessage}</p>
              <p className="mt-1 text-xs text-green-600">
                Redirecting to login page...
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || Boolean(successMessage)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isLoading && (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}

            {isLoading
              ? "Registering..."
              : successMessage
                ? "Registration Successful"
                : "Register as Rider"}
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
