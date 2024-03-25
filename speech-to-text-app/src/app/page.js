"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import "regenerator-runtime/runtime";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";
import dynamic from "next/dynamic";
import io from "socket.io-client";
import TypedResponse from "./components/TypedResponses";
const Dictaphone = dynamic(() => import("./components/Dictaphone"), {
  ssr: false,
});
export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [socket, setSocket] = useState(null);
  const handleSubmit = async () => {
    setGeneratedContent("");
    const currPrompt = prompt;
    setPrompt("");
    const data = await fetch("http://localhost:5000/generateChat", {
      // const data = await fetch("http://localhost:5000/generateContent", {
      method: "POST",
      body: JSON.stringify({
        prompt: currPrompt,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    // setPrompt("");
    // console.log("data", data);
    setGeneratedContent((oldContent) => (oldContent = data.content));
  };

  // useEffect(() => {
  //   const socket = io("http://localhost:5000/");

  //   socket.on("response-update", (data) => {
  //     // Apply the received update to the editor
  //     console.log("data", data);
  //     setGeneratedContent((content) => (content += data));
  //   });
  //   setSocket(socket);

  //   return () => {
  //     socket.disconnect();
  //     // setGeneratedContent("");
  //   };
  // }, [generatedContent]);

  const renderers = {
    typedResponse: ({ children }) => <TypedResponse text={children[0]} />,
  };
  // useEffect(() => {
  //   if (prompt) {
  //     setGeneratedContent("");
  //   }
  // }, [prompt]);
  // useEffect(() => {
  //   if (!isStillListening) {
  //     handleSubmit();
  //     setIsStillListening((pastListen) => !pastListen);
  //     console.log(generatedContent);
  //   }
  // }, [isStillListening]);

  // useEffect(() => {
  //   handleSubmit();
  // }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="overflow-auto">
        {generatedContent.length ? (
          <TypedResponse markdownText={generatedContent} />
        ) : (
          ""
        )}
      </div>
      <div className="w-4/5">
        {/* <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex"> */}
        <Dictaphone
          prompt={prompt}
          setPrompt={setPrompt}
          // setIsStillListening={setIsStillListening}
          handleSubmit={handleSubmit}
        />
        {/* prompt: {prompt} */}
      </div>
    </main>
  );
}
