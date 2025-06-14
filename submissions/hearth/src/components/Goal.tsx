type GoalProps = {
  goal: string;
};

const Goal = ({ goal }: GoalProps) => {
  return (
    <div className="text-wrap object-center py-4 font-medium">Goal: {goal}</div>
  );
};

export default Goal;
