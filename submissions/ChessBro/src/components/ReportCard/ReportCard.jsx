import React from "react";

import MoveQuality from "./MoveQuality";

import BookMoveImg from "../../assets/img/quality_imgs/book.png";
import BestMoveImg from "../../assets/img/quality_imgs/best_move.png";
import ExcellentImg from "../../assets/img/quality_imgs/excellent.png";
import GoodImg from "../../assets/img/quality_imgs/good.png";
import InaccuracyImg from "../../assets/img/quality_imgs/inaccuracy.png";
import MistakeImg from "../../assets/img/quality_imgs/mistake.png";
import BlunderImg from "../../assets/img/quality_imgs/blunder.png";

import "./ReportCard.css";
const ReportCard = ({ move_numbers }) => {
  return (
    <div className="report-card">
      <ul className="move_quality_list">
        <MoveQuality
          numberW={move_numbers.w.book_move}
          numberB={move_numbers.b.book_move}
          name="Book Move"
          image={BookMoveImg}
        />
        <MoveQuality
          numberW={move_numbers.b.best_move}
          numberB={move_numbers.b.best_move}
          name="Best"
          image={BestMoveImg}
        />
        <MoveQuality
          numberW={move_numbers.w.excellent}
          numberB={move_numbers.b.excellent}
          name="Excellent"
          image={ExcellentImg}
        />
        <MoveQuality
          numberB={move_numbers.b.good}
          numberW={move_numbers.w.good}
          name="Good"
          image={GoodImg}
        />
        <MoveQuality
          numberW={move_numbers.w.inaccuracy}
          numberB={move_numbers.b.inaccuracy}
          name="Inaccuracy"
          image={InaccuracyImg}
        />
        <MoveQuality
          name="Mistake"
          numberW={move_numbers.w.mistake}
          numberB={move_numbers.b.mistake}
          image={MistakeImg}
        />
        <MoveQuality
          numberW={move_numbers.w.blunder}
          numberB={move_numbers.b.blunder}
          name="Blunder"
          image={BlunderImg}
        />
      </ul>
    </div>
  );
};

export default ReportCard;
