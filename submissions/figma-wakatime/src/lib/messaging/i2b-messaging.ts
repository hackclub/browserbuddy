import ProtocolMap from "@/lib/messaging/common";
import { defineExtensionMessaging } from "@webext-core/messaging";

export const i2bMessenger = defineExtensionMessaging<ProtocolMap>();
