import express from "express";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
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

    const questionsWithCounts = await Promise.all(
      questions.map(async (question) => {
        const count = await Answer.countDocuments({ questionId: question._id });
        return {
          ...question.toObject(),
          answersCount: count,
        };
      })
    );

    res.json({ questions: questionsWithCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id).populate(
      "userId",
      "name email"
    );

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const answersCount = await Answer.countDocuments({
      questionId: question._id,
    });

    const formattedQuestion = {
      id: question._id,
      title: question.title,
      description: question.description,
      tags: question.tags,
      author: question.userId?.name || "Unknown",
      authorEmail: question.userId?.email || "",
      createdAt: question.createdAt,
      answersCount: answersCount,
      upvotes: question.upvotes || 0,
      downvotes: question.downvotes || 0,
      upvotedBy: question.upvotedBy || [],
      downvotedBy: question.downvotedBy || [],
    };

    res.json(formattedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

router.get("/:id/answers", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const answers = await Answer.find({ questionId: id }).populate("userId");
    res.json({ answers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch answers" });
  }
});

router.post("/:id/answer", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const answer = new Answer({
      content,
      userId: req.user.userId,
      questionId: id,
    });
    await answer.save();
    res.status(201).json({ message: "Answer added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add answer" });
  }
});

router.post("/:id/answer/vote", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.user.userId;

    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ error: "Answer not found" });
    }

    if (!answer.upvotedBy) answer.upvotedBy = [];
    if (!answer.downvotedBy) answer.downvotedBy = [];

    const hasUpvoted = answer.upvotedBy.includes(userId);
    const hasDownvoted = answer.downvotedBy.includes(userId);

    if (voteType === "up") {
      if (hasUpvoted) {
        answer.upvotedBy = answer.upvotedBy.filter(
          (uid) => uid.toString() !== userId
        );
        answer.votes = Math.max(0, (answer.votes || 0) - 1);
      } else {
        answer.upvotedBy.push(userId);
        answer.votes = (answer.votes || 0) + 1;

        if (hasDownvoted) {
          answer.downvotedBy = answer.downvotedBy.filter(
            (uid) => uid.toString() !== userId
          );
          answer.votes = Math.max(0, (answer.votes || 0) + 1); // compensate previous downvote
        }
      }
    } else if (voteType === "down") {
      if (hasDownvoted) {
        answer.downvotedBy = answer.downvotedBy.filter(
          (uid) => uid.toString() !== userId
        );
        answer.votes = Math.max(0, (answer.votes || 0) + 1);
      } else {
        answer.downvotedBy.push(userId);
        answer.votes = Math.max(0, (answer.votes || 0) - 1);

        if (hasUpvoted) {
          answer.upvotedBy = answer.upvotedBy.filter(
            (uid) => uid.toString() !== userId
          );
          answer.votes = Math.max(0, (answer.votes || 0) - 1);
        }
      }
    }

    await answer.save();

    res.json({
      message: "Vote updated",
      votes: answer.votes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to vote on answer" });
  }
});
router.post("/:id/downvote", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const hasDownvoted =
      question.downvotedBy && question.downvotedBy.includes(userId);
    const hasUpvoted =
      question.upvotedBy && question.upvotedBy.includes(userId);

    if (hasDownvoted) {
      question.downvotedBy = question.downvotedBy.filter(
        (id) => id.toString() !== userId
      );
      question.downvotes = Math.max(0, (question.downvotes || 0) - 1);
    } else {
      if (!question.downvotedBy) question.downvotedBy = [];
      question.downvotedBy.push(userId);
      question.downvotes = (question.downvotes || 0) + 1;

      if (hasUpvoted) {
        question.upvotedBy = question.upvotedBy.filter(
          (id) => id.toString() !== userId
        );
        question.upvotes = Math.max(0, (question.upvotes || 0) - 1);
      }
    }

    await question.save();

    res.json({
      message: hasDownvoted ? "Downvote removed" : "Question downvoted",
      upvotes: question.upvotes,
      downvotes: question.downvotes,
      hasUpvoted: false,
      hasDownvoted: !hasDownvoted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to downvote question" });
  }
});

export default router;
