require("dotenv").config();
const port = 5000;
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const app = express();
const fs = require("fs");

app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//   const prompt = "Write a story about a magic backpack.";

const chat = model.startChat({
  safetySettings: [
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_NONE",
    },
    // {
    //   category: "HARM_CATEGORY_UNSPECIFIED",
    //   threshold: "BLOCK_NONE",
    // },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_NONE",
    },
  ],
  history: [],
  // history: [
  //   {
  //     role: "user",
  //     parts: "Pretend you're a snowman and stay in character for each response.",
  //   },
  //   {
  //     role: "model",
  //     parts: "Hello! It's cold! Isn't that great?",
  //   },
  // ],
  // generationConfig: {
  //   maxOutputTokens: 100,
  // },
});

app.post("/generateChat", async (req, res) => {
  if (!req.body || !req.body.prompt || req.body.prompt === "") {
    return res.status(400).send("Prompt cannot be empty");
  }
  const prompt = req.body.prompt;

  // console.log("content", content);

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");

    const result = await chat.sendMessageStream(prompt);
    for await (const chunk of result.stream) {
      if (!chunk.candidates[0].blocked) {
        const chunkText = chunk.candidates[0].content.parts[0].text;
        res.write(chunkText);
      }
    }
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).send(
      // "I'm sorry, I'm not comfortable answering that prompt"
      "Due to an unforeseen error, I cannot give you a response at this time."
      // `I'm sorry, I cannot give you a response at this time due to the following error message: ${error}`
    );
  }

  // res.status(200).send("Test");
  // res.status(500).send("testing");
});

app.get("/getHistory", async (req, res) => {
  const history = await chat.getHistory();
  res.send({
    history: history,
  });
});

server.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
