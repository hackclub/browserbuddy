const STAGES: { id: string; min: number }[] = [
  { id: "2", min: 11 },
  { id: "1", min: 6 },
  { id: "0", min: 0 },
];

const getStage = (streak: number) => {
  for (let stage of STAGES) {
    if (streak >= stage.min) {
      return stage.id;
    }
  }
};

export default getStage;
