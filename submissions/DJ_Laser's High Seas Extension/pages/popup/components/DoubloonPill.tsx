import doubloonsSvg from "../assets/doubloon.svg";
import Pill from "./generic/Pill";

export function DoubloonPill({ msg }: { msg: string }) {
  return (
    <Pill
      msg={msg}
      glyphImage={<img src={doubloonsSvg} alt="doubloons" className="h-5" />}
    />
  );
}
