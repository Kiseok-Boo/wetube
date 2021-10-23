import express from "express";
import {
  updateView,
  createComment,
  deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", updateView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete(
  "/videos/:id([0-9a-f]{24})/comment/:commentID([0-9a-f]{24})",
  deleteComment
);

export default apiRouter;
