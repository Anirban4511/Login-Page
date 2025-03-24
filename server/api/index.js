import app from "../server.js";
import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req, res) {
  return app(req, res);
}
