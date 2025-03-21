import React from "react";

import "./MoveQuality.css";

const MoveQuality = ({ name, image, numberW, numberB }) => {
  var newNumberB = numberB;
  var newNumberW = numberW;
  if (numberW < 10) {
    newNumberW = `0${numberW}`;
  }
  if (numberB < 10) {
    newNumberB = `0${numberB}`;
  }
  return (
    <li id={name} className="move_quality_item">
      <a className="quality_value left_value">{newNumberW}</a>
      <div className="quality_text">
        <img src={image} className="move_quality_img" id={`${name}_image`} />
        <a id="move-info-name">{name}</a>
      </div>
      <a className="quality_value right_value">{newNumberB}</a>
    </li>
  );
};

export default MoveQuality;
