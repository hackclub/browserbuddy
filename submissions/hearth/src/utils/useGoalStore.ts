import { createChromeStorageStateHookSync } from "use-chrome-storage";

const GOAL_KEY = "goalLocal";
const INITIAL_VALUE: string = "None";

export const useGoalStore = createChromeStorageStateHookSync(
  GOAL_KEY,
  INITIAL_VALUE,
);
