import Image from "next/image";
import { cn } from "@/lib/cn";

const heights = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
} as const;

export function BrandMark({
  size = "md",
  tone = "auto",
  className,
  priority = false,
}: {
  size?: keyof typeof heights;
  tone?: "onLight" | "onDark" | "auto";
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/ioteedom-logo.png"
      alt="IoTeedom"
      width={840}
      height={226}
      priority={priority}
      className={cn(
        "w-auto max-w-full",
        heights[size],
        tone === "onDark" && "brightness-0 invert",
        tone === "auto" && "dark:brightness-0 dark:invert",
        className,
      )}
      style={{ width: "auto" }}
    />
  );
}
