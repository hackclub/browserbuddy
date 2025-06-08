import server from "../utils/backend";

export const validatePGN = async (pgn, displayError) => {
  try {
    const response = await server.post("/validate-pgn", { pgn: pgn });
    const valid = response.data;
    return valid;
  } catch {
    displayError("Error 404 - Couldn't Connect to Server.");
  }
};
