"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/common/brand-logo";
import { adminLoginAction } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("password", password);

    try {
      const res = await adminLoginAction(formData);
      if (res && !res.success) {
        setErrorMessage(res.error || "Login failed.");
        toast.error(res.error || "Login failed.");
        setIsLoading(false);
      }
    } catch {
      // If redirect thrown, next.js handles it
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-ivory px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-block p-3 rounded-2xl bg-plum shadow-md">
            <BrandLogo size="md" showText={false} />
          </div>
          <h1 className="mv-heading-italic text-2xl text-plum uppercase">
            ADMIN LOGIN
          </h1>
          <p className="text-xs text-plum-muted">
            Management dashboard for Myvelora Store products, orders, and store settings.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-plum uppercase">
                Admin Password
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-plum-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter admin password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 text-base rounded-xl bg-background border-border"
                  autoFocus
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs font-semibold text-destructive bg-destructive/10 p-2.5 rounded-lg text-center">
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-plum hover:bg-plum-hover text-white font-semibold text-sm h-12 rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                "Enter Dashboard"
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-plum-muted hover:text-plum uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
