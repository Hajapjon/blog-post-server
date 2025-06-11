import { Router } from "express";
import supabase from "../utils/supabaseClient.mjs";
import { validateCreatePost } from "../middlewares/post.validation.mjs";

const postRouter = Router();

postRouter.post("/", validateCreatePost, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newPost = {
      ...req.body,
      date: today.toISOString(),
    };

    const { error } = await supabase.from("posts").insert([newPost]);

    if (error) throw error;

    return res.status(201).json({ message: "Created post successfully" });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      message: "Server could not create post because of database error",
    });
  }
});

postRouter.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 6, category, keyword } = req.query;
    const from = (page - 1) * limit;
    const to = from + Number(limit) - 1;

    let query = supabase
      .from("posts_with_category") // ใช้ view หรือ join query ล่วงหน้าไว้ใน Supabase
      .select("*")
      .range(from, to)
      .order("id", { ascending: false });

    if (category) query = query.eq("category", category);
    if (keyword) query = query.ilike("title", `%${keyword}%`);

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      data,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      message: "Server could not fetch posts because of database error",
    });
  }
});

postRouter.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { data, error } = await supabase
      .from("posts_with_category")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) throw error;
    if (!data)
      return res.status(404).json({
        message: "Post not found",
      });

    return res.status(200).json({ data });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      message: "Server could not fetch post because of database error",
    });
  }
});

postRouter.delete("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { error, count } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) throw error;
    if (count === 0)
      return res.status(404).json({ message: "Post not found to delete" });

    return res.status(200).json({ message: "Deleted post successfully" });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      message: "Server could not delete post because of database error",
    });
  }
});

postRouter.put("/:postId", validateCreatePost, async (req, res) => {
  try {
    const { postId } = req.params;
    const updatePost = req.body;

    const { error, count } = await supabase
      .from("posts")
      .update(updatePost)
      .eq("id", postId);

    if (error) throw error;
    if (count === 0)
      return res.status(404).json({ message: "Post not found to update" });

    return res.status(200).json({ message: "Updated post successfully" });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      message: "Server could not update post because of database error",
    });
  }
});

export default postRouter;
