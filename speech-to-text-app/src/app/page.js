"use client";
import { useState, useEffect, useRef } from "react";
import "regenerator-runtime/runtime";
import dynamic from "next/dynamic";
import TypedResponse from "./components/TypedResponses";
const Dictaphone = dynamic(() => import("./components/Dictaphone"), {
  ssr: false,
});

export default function Home() {
  const [generatedContent, setGeneratedContent] = useState("");
  const promptRef = useRef(null);

  const handleGenerateResponse = (currPrompt) => {
    fetch("http://localhost:5000/generateChat", {
      method: "POST",
      body: JSON.stringify({
        prompt: currPrompt,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.text())
      .then((data) => {
        // Handle the received data
        console.log(data);
        setGeneratedContent((content) => (content += data));
      })
      .catch((error) => {
        // Handle fetch errors here
        console.error("Fetch error:", error);
      });
  };

  const adjustTextareaHeight = () => {
    if (promptRef.current) {
      promptRef.current.style.height = "auto";
      promptRef.current.style.height = promptRef.current.scrollHeight + "px";
    }
  };

  const handleSubmit = () => {
    setGeneratedContent("");
    handleGenerateResponse(promptRef.current.value);
    promptRef.current.value = null;
    adjustTextareaHeight();
  };

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
        <Dictaphone
          handleSubmit={handleSubmit}
          promptRef={promptRef}
          adjustTextareaHeight={adjustTextareaHeight}
        />
      </div>
    </main>
  );
}
