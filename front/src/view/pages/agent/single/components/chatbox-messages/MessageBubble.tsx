import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  children: ReactNode;
  isSenderUser?: boolean;
}

export function MessageBubble({
  children,
  isSenderUser = false,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-3 max-w-[70%]",
        isSenderUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
      )}
    >
      {children}
    </div>
  );
}
