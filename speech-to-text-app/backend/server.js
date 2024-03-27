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
io.on("connection", (socket) => {
  socket.on("response-update", function (data) {
    //a place to create data, once complete triggers everyone subscribed to get an update.
    socket.emit("response-update", data);
  });
});

const generateContent = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  //   const prompt = "Write a story about a magic backpack.";

  const result = await model.generateContent(prompt);
  // let text = "";
  // for await (const chunk of result.stream) {
  //   const chunkText = chunk.text();
  //   // console.log("CHUNK TEXT", chunkText);
  //   text += " " + chunkText;
  //   io.sockets.emit("response-update", text);
  // }
  const response = result.response;
  const text = response.text();
  // io.sockets.emit("response-update", text);
  console.log(text);
  return text;
};

const generateChat = async (msg) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  //   const prompt = "Write a story about a magic backpack.";

  const chat = model.startChat({
    safetySettings: [
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
    ],

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

  // const msg = "What's your favorite season of the year?";
  const result = await chat.sendMessageStream(msg);
  let text = "";
  for await (const chunk of result.stream) {
    console.log("chunk", chunk);
    const chunkText = chunk.candidates[0].content.parts[0].text;
    // console.log("CHUNK TEXT", chunkText);
    text += " " + chunkText;
    // io.sockets.emit("response-update", text);
  }
  // console.log(result.response.text());
  // return result.response.text();
  return text;
};
app.post("/generateChat", async (req, res) => {
  if (!req.body || !req.body.prompt || req.body.prompt === "") {
    return res.status(400).send("Prompt cannot be empty");
  }
  const prompt = req.body.prompt;

  // console.log("content", content);

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    // const msg = "What's your favorite season of the year?";

    // res.setHeader("Connection", "keep-alive");

    // res.write(":ok\n\n");
    const result = await chat.sendMessageStream(prompt);
    // const userChatLog = { role: "user", parts: prompt };
    // chat.history.push(userChatLog);
    // const modelChatLog = { role: "model", parts: "" };
    for await (const chunk of result.stream) {
      // console.log("chunk", chunk);
      if (!chunk.candidates[0].blocked) {
        const chunkText = chunk.candidates[0].content.parts[0].text;
        // console.log(chunkText);
        // console.log("chunkText", chunkText);
        // modelChatLog.parts += chunkText;
        res.write(chunkText);
      }
    }
    // chat.history.push(modelChatLog);
    console.log(await chat.getHistory());
    res.end();
    // const content = await generateChat(prompt);

    // const stream = fs.createReadStream(content);
    // stream.pipe(res);
    // res.send({
    //   content: content,
    // });
  } catch (error) {
    console.log(error);
    res.status(500).send(
      "I'm sorry, I'm not comfortable answering that prompt"
      // `I'm sorry, I cannot give you a response at this time due to the following error message: ${error}`
    );
  }

  // res.status(200).send("Test");
  // res.status(500).send("testing");
});

app.post("/generateContent", async (req, res) => {
  if (!req.body || !req.body.prompt || req.body.prompt === "") {
    return res.status(400).send("Prompt cannot be empty");
  }
  const prompt = req.body.prompt;
  const content = await generateContent(prompt);
  // console.log("content", content);
  res.send({
    content: content,
  });
  // res.status(200).send("Test");
  // res.status(500).send("testing");
});

server.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
