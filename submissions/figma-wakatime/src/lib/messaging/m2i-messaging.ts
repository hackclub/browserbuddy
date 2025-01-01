import ProtocolMap from "@/lib/messaging/common";
import { defineCustomEventMessaging } from "@webext-core/messaging/page";

export const m2iMessenger = defineCustomEventMessaging<ProtocolMap>({
  namespace: "skyfall-figma-wakatime",
});
