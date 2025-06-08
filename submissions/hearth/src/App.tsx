import { useState } from "react";
import TextStreakDisplay from "./components/TextStreakDisplay";
import WeekStreakDisplay from "./components/WeekStreakDisplay";
import NavBar from "./components/NavBar";
import Settings from "./components/Settings";
import Goal from "./components/Goal";
import MascotDisplay from "./components/MascotDisplay";
import Button from "./components/utils/Button";
import { useStreakStore } from "./utils/useStreakStore";
import { useDateStore } from "./utils/useDateStore";
import { useGoalStore } from "./utils/useGoalStore";
import getStage from "./utils/Stage";

const App = () => {  
  const [isSettingsActive, setIsSettingsActive] = useState(false);
  const [goal, setGoal] = useGoalStore();
  const [lastDate, setLastDate] = useDateStore();
  const [streak, setStreak] = useStreakStore();

  const handleStreakIncrement = () => {
    setStreak((prev) => prev + 1);
    const today = new Date();
    setLastDate( { dateString: today.toDateString(), dayOfWeek: today.getDay().toString() });
  };

  const now = new Date();

  return (
    <>
      <div className="grid min-w-[300px] bg-bgPrimary p-4 font-serif text-sm text-tBase">
        <NavBar
          isSettingsActive={isSettingsActive}
          setIsSettingsActive={setIsSettingsActive}
        />

        {isSettingsActive && <Settings goal={goal} setGoal={setGoal} />}

        <Goal goal={goal} />

        <WeekStreakDisplay streak={streak} dayOfWeek={parseInt(lastDate.dayOfWeek)} />

        <MascotDisplay stage={getStage(streak)} color="red" />

        <TextStreakDisplay streak={streak} />
        
        <Button
          disabled={lastDate.dateString == now.toDateString()}
          children="Complete goal"
          className="enabled:hover:bg-secondarydisabled:opacity-75 w-full bg-primary px-2 py-4 disabled:cursor-not-allowed"
          onClick={handleStreakIncrement}
        />
      </div>
    </>
  );
};

export default App;
