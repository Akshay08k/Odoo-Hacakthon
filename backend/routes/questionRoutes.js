import express from "express";
import Question from "../models/Question.js";
import { authenticate } from "../middlware/auth.js";

const router = express.Router();

router.post("/post", authenticate, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const question = new Question({
      title,
      description,
      tags,
      userId: req.user.userId,
    });

    console.log({ title, description, tags });
    await question.save();

    res.status(201).json({ message: "Question posted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to post question" });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const questions = await Question.find({}).populate("userId");
    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

export default router;
