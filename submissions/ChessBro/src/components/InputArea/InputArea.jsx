import React, { useState } from "react";
import "./InputArea.css";
import { validatePGN } from "../../scripts/fetch";
import { reviewPGN } from "../../scripts/gameReview";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import GameReview from "../GameReview/GameReview";
const InputArea = () => {
  const [inputPGN, setInputPGN] = useState("");
  const [reviewedGame, setReviewedGame] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validatePGN(inputPGN, displayError)) {
      const game = await reviewPGN(inputPGN, displayError);
      setReviewedGame(game);
      console.log(game);
    } else {
      displayError("PGN is Invalid. Try again.");
    }
    setInputPGN("");
  };
  const displayError = (text) => {
    setErrorMessage(text);
  };
  return (
    <>
      <div id="input-area">
        <div id="game-input-container">
          <form id="game-input-form" onSubmit={handleSubmit}>
            <div id="game-input-box">
              <textarea
                type="text"
                id="game-input"
                placeholder="Enter PGN"
                value={inputPGN}
                required
                onChange={(e) => {
                  setInputPGN(e.target.value);
                }}
              ></textarea>
            </div>
            <div id="game-input-button-container">
              <button type="submit" className="game-input-button">
                <p id="img">🔍</p> Analyse
              </button>
              {/* <button
                type="button"
                id="fetch-btn"
                className="game-input-button"
                onClick={(e) => handleClick(e)}
              >
                Fetch PGN from Page
              </button> */}
            </div>
          </form>
        </div>
      </div>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          duration={2000}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {reviewedGame && <GameReview reviewedGame={reviewedGame} />}
    </>
  );
};

export default InputArea;
