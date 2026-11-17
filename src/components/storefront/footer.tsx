import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { MessageCircle } from "lucide-react";

interface FooterProps {
  brandLogoUrl?: string | null;
  faqEnabled?: boolean;
  returnPolicyEnabled?: boolean;
  adminWhatsappNumber?: string | null;
  instagramUrl?: string | null;
}

function resolveInstagram(raw?: string | null): { href: string; label: string } | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const match = trimmed.match(/instagram\.com\/([^/?#]+)/i);
    const handle = match?.[1] ? `@${match[1].replace(/^@/, "")}` : "Instagram";
    return { href: trimmed, label: handle };
  }

  const cleanHandle = trimmed.replace(/^@/, "").replace(/\/+$/, "");
  if (!cleanHandle) return null;
  return {
    href: `https://instagram.com/${cleanHandle}`,
    label: `@${cleanHandle}`,
  };
}

export function Footer({
  brandLogoUrl,
  faqEnabled,
  returnPolicyEnabled,
  adminWhatsappNumber,
  instagramUrl,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const cleanWa = adminWhatsappNumber?.replace(/\D/g, "") || "";
  const instagram = resolveInstagram(instagramUrl);

  return (
    <footer className="bg-plum text-white/80 border-t border-plum-hover">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info & Dynamic Socials */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo logoUrl={brandLogoUrl} size="md" />
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              K-Pop albums, photocards, and merchandise. Order online and confirm directly via WhatsApp.
            </p>

            {(cleanWa || instagram) && (
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                {cleanWa && (
                  <a
                    href={`https://wa.me/${cleanWa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Chat on WhatsApp +${cleanWa}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-white transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-pink shrink-0" />
                    <span className="font-mono">+{cleanWa}</span>
                  </a>
                )}

                {instagram && (
                  <a
                    href={instagram.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit Instagram ${instagram.label}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-white transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-pink shrink-0"
                      aria-hidden="true"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>{instagram.label}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-pink">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-white/75 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/#new-arrivals" className="text-white/75 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/how-to-order" className="text-white/75 hover:text-white transition-colors">
                  How to Order
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="text-white/75 hover:text-white transition-colors">
                  Customer Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-pink">
              Help & Orders
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/track-order" className="text-white/75 hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              {faqEnabled && (
                <li>
                  <Link href="/#faq" className="text-white/75 hover:text-white transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
              )}
              {returnPolicyEnabled && (
                <li>
                  <Link href="/policies" className="text-white/75 hover:text-white transition-colors">
                    Store Policy
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 pt-6 border-t border-plum-hover/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {currentYear} Myvelora Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
