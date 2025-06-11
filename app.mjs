import "dotenv/config";
import express from "express";
import cors from "cors";
import postRouter from "./routes/post.mjs";

const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use("/posts", postRouter);

app.get("/", (req, res) => {
  res.json({ message: "Server is running and Supabase is ready!" });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
