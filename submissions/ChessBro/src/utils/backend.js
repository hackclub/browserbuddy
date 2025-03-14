import axios from "axios";
const server = axios.create({
  baseURL: "https://chessbro.daamin.hackclub.app/api",
});
export default server;
