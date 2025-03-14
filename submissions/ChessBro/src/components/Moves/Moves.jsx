import React from "react";
import best_move from "../../assets/img/quality_imgs/best_move.png";
import blunder from "../../assets/img/quality_imgs/blunder.png";
import book from "../../assets/img/quality_imgs/book.png";
import excellent from "../../assets/img/quality_imgs/excellent.png";
import forced from "../../assets/img/quality_imgs/forced.png";
import mistake from "../../assets/img/quality_imgs/mistake.png";
import inaccuracy from "../../assets/img/quality_imgs/inaccuracy.png";
import good from "../../assets/img/quality_imgs/good.png";
import "./Moves.css";
const Moves = ({ moves }) => {
  const getColor = (id) => {
    const color = ["Red", "Green"];
    return color[id % 3];
  };
  return (
    <div className="moves_card">
      <h2>Moves Evaluation</h2>
      <div className="moves">
        {moves.map((move, id) => {
          if (id == "0") {
            return;
          }
          var img;
          switch (move.move_type) {
            case "best_move":
              img = best_move;
              break;
            case "book_move":
              img = book;
              break;
            case "blunder":
              img = blunder;
              break;
            case "mistake":
              img = mistake;
              break;
            case "inaccuracy":
              img = inaccuracy;
              break;
            case "good":
              img = good;
              break;
            case "forced":
              img = forced;
              break;
            case "excellent":
              img = excellent;
              break;
          }
          return (
            <div
              key={id}
              className="move"
              title={move.opening}
              style={{ backgroundColor: getColor(id) }}
            >
              <div className="move_item">{move.move_no}</div>
              <img src={img} id="img_move " className="move_quality_img" />
              <div className="move_item">{move.best_move}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Moves;
