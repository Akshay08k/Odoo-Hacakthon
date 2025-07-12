import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connect.js"; 
import User from "./models/User.js";
import bcrypt from "bcrypt"; 

dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log({ name, email, password });
    const user = new User({
      name,
      email,
      passwordHash: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
