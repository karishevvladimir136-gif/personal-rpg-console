"use client";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

// Approved sample screens stay entirely within the explicitly isolated preview.
export default function PreviewLink(props: ComponentProps<typeof NextLink>) {
  const preview = usePathname().startsWith("/preview");
  const href =
    preview &&
    typeof props.href === "string" &&
    props.href.startsWith("/") &&
    !props.href.startsWith("/preview")
      ? `/preview${props.href === "/" ? "" : props.href}`
      : props.href;
  return <NextLink {...props} href={href} />;
}
