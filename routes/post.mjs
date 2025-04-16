import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreatePost } from "../middlewares/post.validation.mjs";

const postRouter = Router();

postRouter.post("/", validateCreatePost, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const newPost = {
      ...req.body,
      date: today,
    };

    const result = await connectionPool.query(
      `
            insert into posts (title, image, category_id, description, date, content, status_id)
            values ($1, $2, $3, $4, $5, $6, $7)`,
      [
        newPost.title,
        newPost.image,
        newPost.category_id,
        newPost.description,
        newPost.date,
        newPost.content,
        newPost.status_id,
      ]
    );
    if (result.rowCount > 0) {
        return res.status(201).json({
            message: "Created post sucessfully",
          });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not create post because database connection",
    });
  }
});

export default postRouter;
