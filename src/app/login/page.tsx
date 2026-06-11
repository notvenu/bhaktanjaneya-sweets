"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Phone, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/context/AuthContext";
import { config } from "@/lib/config";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/account";
  const { sendOtp, confirmOtp, loading } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [error, setError] = useState("");

  async function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    try {
      const res = await sendOtp(digits);
      setDevCode(res.devCode);
      setStep("otp");
    } catch {
      setError("Couldn't send the code. Please try again.");
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await confirmOtp(phone.replace(/\D/g, ""), code.trim());
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    }
  }

  return (
    <div className="rounded-3xl border border-cream-200 bg-white p-7 shadow-soft sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-800 text-saffron-400">
        {step === "phone" ? <Phone size={22} /> : <ShieldCheck size={22} />}
      </span>

      {step === "phone" ? (
        <form onSubmit={submitPhone} className="mt-5">
          <h1 className="font-serif text-2xl font-bold text-maroon-900">
            Login or Sign up
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            We&apos;ll send a one-time code to verify your number.
          </p>
          <label className="mt-6 block text-sm font-medium text-maroon-900">
            Phone number
          </label>
          <div className="mt-1.5 flex items-center rounded-xl border border-cream-300 bg-white focus-within:border-saffron-400 focus-within:ring-2 focus-within:ring-saffron-400/40">
            <span className="pl-4 pr-2 text-sm text-ink-500">+91</span>
            <input
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="98765 43210"
              className="h-12 flex-1 rounded-r-xl bg-transparent pr-4 text-sm focus:outline-none"
            />
          </div>
          {error && <p className="mt-2 text-sm text-maroon-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-maroon-800 text-sm font-semibold text-cream-50 hover:bg-maroon-700 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send OTP"}
            <ArrowRight size={18} />
          </button>
        </form>
      ) : (
        <form onSubmit={submitCode} className="mt-5">
          <h1 className="font-serif text-2xl font-bold text-maroon-900">
            Enter the code
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Sent to +91 {phone}.{" "}
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError("");
              }}
              className="font-medium text-maroon-700 hover:text-saffron-600"
            >
              Change
            </button>
          </p>
          <input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            maxLength={6}
            placeholder="------"
            className="mt-6 h-14 w-full rounded-xl border border-cream-300 bg-white text-center text-2xl font-bold tracking-[0.4em] text-maroon-900 focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/40"
          />
          {devCode && (
            <p className="mt-2 rounded-lg bg-cream-100 px-3 py-2 text-center text-xs text-ink-500">
              Demo mode — use code{" "}
              <span className="font-bold text-maroon-800">{devCode}</span>
            </p>
          )}
          {error && <p className="mt-2 text-sm text-maroon-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-maroon-800 text-sm font-semibold text-cream-50 hover:bg-maroon-700 disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify & Continue"}
          </button>
          <button
            type="button"
            onClick={() => submitPhone(new Event("submit") as unknown as React.FormEvent)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-maroon-700 hover:text-saffron-600"
          >
            <ArrowLeft size={14} /> Resend code
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-ink-400">
        By continuing you agree to {config.businessName}&apos;s{" "}
        <Link href="/policies/terms" className="underline">
          Terms
        </Link>{" "}
        &amp;{" "}
        <Link href="/policies/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Container>
      <div className="mx-auto max-w-md py-14 sm:py-20">
        <Suspense fallback={null}>
          <LoginInner />
        </Suspense>
      </div>
    </Container>
  );
}
