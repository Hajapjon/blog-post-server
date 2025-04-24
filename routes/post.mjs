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

postRouter.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 6, category, keyword } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [];
    let values = [];
    if (category) {
      values.push(category);
      conditions.push(`category_id = $${values.length}`);
    }

    if (keyword) {
      values.push(`%${keyword}%`);
      conditions.push(
        `(title ILIKE $${values.length} OR description ILIKE $${values.length} OR content ILIKE $${values.length})`
      );
    }

    let whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    values.push(limit);
    values.push(offset);
    const result = await connectionPool.query(
      `
        SELECT * FROM posts
        ${whereClause}
        ORDER BY id DESC
        LIMIT $${values.length - 1} OFFSET $${values.length}
      `,
      values
    );

    return res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      message: "Server could not read because database connection",
    });
  }
});

postRouter.get("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const result = await connectionPool.query(
      `select * from posts where id = $1`,
      [postId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Server could not find a requested post",
      });
    }

    return res.status(200).json({
      data: result.rows[0],
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read because database connection",
    });
  }
});

postRouter.delete("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const result = await connectionPool.query(
      `delete from posts where id = $1`,
      [postId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested post to delete",
      });
    }

    return res.status(200).json({
      message: "Deleted post sucessfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read because database connection",
    });
  }
});

postRouter.put("/:postId", validateCreatePost, async (req, res) => {
  try {
    const updatePost = {
      ...req.body,
    };
    const postId = req.params.postId;
    const result = await connectionPool.query(
      `
            update posts
            set title = $2 , image = $3, category_id = $4, description = $5, content = $6, status_id = $7
            where id = $1`,
      [
        postId,
        updatePost.title,
        updatePost.image,
        updatePost.category_id,
        updatePost.description,
        updatePost.content,
        updatePost.status_id,
      ]
    );
    if (result.rowCount > 0) {
      return res.status(200).json({
        message: "Updated post sucessfully",
      });
    } else {
      return res.status(404).json({
        message: "Post not found to update",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not update post because database connection",
    });
  }
});

export default postRouter;
