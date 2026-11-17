import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  logoUrl?: string | null;
  className?: string;
  href?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const DEFAULT_BRAND_LOGO_URL = "/brand/myvelora-logo.png";

export function BrandLogo({
  logoUrl,
  className,
  href = "/",
  showText = false,
  size = "md",
}: BrandLogoProps) {
  const sizeMap = {
    sm: { width: 54, height: 28, imgClass: "h-7 w-auto", textClass: "text-base" },
    md: { width: 65, height: 34, imgClass: "h-8 sm:h-9 w-auto", textClass: "text-lg" },
    lg: { width: 84, height: 44, imgClass: "h-10 sm:h-11 w-auto", textClass: "text-xl" },
  };

  const currentSize = sizeMap[size];
  const resolvedLogoUrl = logoUrl?.trim() ? logoUrl.trim() : DEFAULT_BRAND_LOGO_URL;

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none py-1", className)}>
      <Image
        src={resolvedLogoUrl}
        alt="Myvelora Store Official mv Logo"
        width={currentSize.width}
        height={currentSize.height}
        unoptimized={resolvedLogoUrl.startsWith("data:")}
        className={cn("object-contain shrink-0", currentSize.imgClass)}
        priority
      />

      {showText && (
        <span
          className={cn(
            "font-heading font-extrabold italic tracking-tight text-white uppercase leading-none",
            currentSize.textClass
          )}
        >
          Myvelora
        </span>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink rounded-md">
      {content}
    </Link>
  );
}
