"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      visibleToasts={1}
      duration={2200}
      className="toaster group font-sans"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-pink" />
        ),
        info: (
          <InfoIcon className="size-4 text-plum" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-600" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-600" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-pink" />
        ),
      }}
      style={
        {
          "--normal-bg": "#FFFFFF",
          "--normal-text": "#47023B",
          "--normal-border": "#EAD6E0",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "bg-white text-plum border border-[#EAD6E0] shadow-md rounded-xl px-4 py-3 text-xs font-medium",
          title: "text-plum font-semibold text-xs leading-snug",
          description: "text-plum-muted text-xs",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
