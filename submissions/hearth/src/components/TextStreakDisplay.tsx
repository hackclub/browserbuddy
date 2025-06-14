type TextStreakDisplayProps = {
  streak: number;
};

const TextStreakDisplay = ({ streak }: TextStreakDisplayProps) => {
  return (
    <div className="text-center text-lg italic">
      <span className="font-bold">{streak}</span> day{streak!=1 && "s"} old
    </div>
  );
};

export default TextStreakDisplay;