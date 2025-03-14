import React from "react";
import ReportCard from "../ReportCard/ReportCard";
import Accuracy from "../Accuracy/Accuracy";
import "./GameReview.css";
import Moves from "../Moves/Moves";
const GameReview = ({ reviewedGame }) => {
  return (
    <div className="game_review">
      <div className="acc_rep_box">
        <Accuracy PGN={reviewedGame} />
        <ReportCard move_numbers={reviewedGame.number_of_move_types} />
      </div>
      <Moves moves={reviewedGame.move_evaluations}/>
    </div>
  );
};

export default GameReview;
