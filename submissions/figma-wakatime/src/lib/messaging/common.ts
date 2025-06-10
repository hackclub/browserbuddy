import { PartialHeartbeat } from "@/lib/wakatime";

export default interface ProtocolMap {
  emitHeartbeat(partialHeartbeat: PartialHeartbeat): void;
  getDocHash(filekey: string): Promise<string>;
  uninject(data: unknown): void;
}
