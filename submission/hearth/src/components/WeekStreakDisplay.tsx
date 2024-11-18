type WeekStreakDisplayProps = {
    streak: number,
    dayOfWeek: number // 0 = Sunday
  };

const WeekStreakDisplay = ({ streak, dayOfWeek }: WeekStreakDisplayProps) => {
    const FLAME_EMOJI: string = "🔥";

    /* 
    Evaluates to 0 if streak extends to the beginning of the week and to the amount of days at the start of the week that the streak does not extend to otherwise
    (Ex. If the day of the week is Tuesday (2) and the streak is 2, inactivePrefix will be 1, indicating that the first day (Sunday) was inactive)
    */
    const inactivePrefix = dayOfWeek < streak ? 0 : (dayOfWeek + 1 - streak%7)
    
    const active = (dayOfWeek+1)-inactivePrefix
    
    const inactiveSuffix = (7-active-inactivePrefix)

    return (
      <div className="text-center">
        <span className="emoji-flame-inactive">{FLAME_EMOJI.repeat(inactivePrefix)}</span>
        <span className="emoji-flame-active">{FLAME_EMOJI.repeat(active)}</span>
        <span className="emoji-flame-inactive">{FLAME_EMOJI.repeat(inactiveSuffix)}</span>
      </div>
    )
  }

export default WeekStreakDisplay;