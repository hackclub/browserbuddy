import type { PropsWithChildren } from "react";

export function ShipL({
  children,
  style = true,
}: PropsWithChildren<{ style?: boolean }>) {
  return (
    <a
      className={style ? "text-cyan-500 underline" : ""}
      href="https://highseas.hackclub.com/shipyard"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
