import { Router } from "express";
import supabase from "../utils/supabaseClient.mjs";

const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const { email, password, name, username } = req.body;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      username,
    },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ user: data.user });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  return res.status(200).json({ session: data.session, user: data.user });
});

export default authRouter;
