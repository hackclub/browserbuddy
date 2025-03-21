import server from "../utils/backend";

export const reviewPGN = async (pgn, displayError) => {
  try {
    const response = await server.post("/review-game", { pgn: pgn });
    return response.data;
  } catch {
    displayError("Cannot connect to server!");
  }
};
