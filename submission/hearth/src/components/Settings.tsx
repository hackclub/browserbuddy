type SettingsProps = {
  goal: string;
  setGoal: (arg0: string) => void;
};

const Settings = ({ goal, setGoal }: SettingsProps) => {
  return (
    <div className="grid p-2">
      <label className="m-4 text-tBase">
        Goal:
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          maxLength={200}
          minLength={1}
          className="bg-bgInverse text-tInverse"
        />
      </label>
    </div>
  );
};

export default Settings;
