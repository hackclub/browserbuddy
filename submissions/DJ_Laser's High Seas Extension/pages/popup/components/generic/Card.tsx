import * as React from "react";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={
        "rounded-lg bg-card text-card-foreground shadow-sm bg-blend-color-burn " +
        className
      }
      {...props}
    />
  );
});
