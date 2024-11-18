import { createChromeStorageStateHookSync } from "use-chrome-storage";

const STREAK_KEY = "streakLocal";
const INITIAL_VALUE: number = 0;

export const useStreakStore = createChromeStorageStateHookSync(
  STREAK_KEY,
  INITIAL_VALUE,
);
