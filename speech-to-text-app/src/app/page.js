"use client";
import { useState, useEffect, useRef } from "react";
import "regenerator-runtime/runtime";
import dynamic from "next/dynamic";
import TypedResponse from "./components/TypedResponses";
import Markdown from "react-markdown";
import CodeBlock from "./components/CodeBlock";
import gfm from "remark-gfm";
import { Person, SmartToy } from "@mui/icons-material";
const Dictaphone = dynamic(() => import("./components/Dictaphone"), {
  ssr: false,
});

export default function Home() {
  const [generatedContent, setGeneratedContent] = useState("");
  const promptRef = useRef(null);
  const [pastResponses, setPastResponses] = useState([]);

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

  const getHistory = () => {
    fetch("http://localhost:5000/getHistory")
      .then((res) => res.json())
      .then((data) => {
        // Handle the received data
        console.log(data);
        // setGeneratedContent((content) => (content += data));
        // const data = data.history
        setPastResponses([...data.history]);
      })
      .catch((error) => {
        // Handle fetch errors here
        console.error("Fetch error:", error);
      });
  };

  useEffect(() => {
    getHistory();
  }, []);

  const adjustTextareaHeight = () => {
    if (promptRef.current) {
      promptRef.current.style.height = "auto";
      promptRef.current.style.height = promptRef.current.scrollHeight + "px";
    }
  };

  const handleSubmit = () => {
    if (generatedContent.length) {
      setPastResponses(
        (history) =>
          (history = [
            ...history,
            { role: "model", parts: [{ text: generatedContent }] },
            { role: "user", parts: [{ text: promptRef.current.value }] },
          ])
      );
    } else {
      setPastResponses(
        (history) =>
          (history = [
            ...history,
            // { role: "model", parts: [{ text: generatedContent }] },
            { role: "user", parts: [{ text: promptRef.current.value }] },
          ])
      );
    }
    setGeneratedContent("");
    handleGenerateResponse(promptRef.current.value);
    promptRef.current.value = null;
    adjustTextareaHeight();
  };

  const components = {
    code: ({ node, inline, className, children, ...props }) => {
      if (!inline) {
        let language = className?.split("-")[1];
        if (!language) {
          return (
            <code className={className} {...props}>
              `{children}`
            </code>
          );
        }
        return (
          <CodeBlock
            language={language ? language : className}
            value={String(children).replace(/\n$/, "")}
          />
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 w-4/5">
        {pastResponses.map((response, idx) => {
          return (
            <div className="text-gray-50 font-mono text-lg my-4" key={idx}>
              <div className="flex flex-row items-center">
                <div className="mr-3 items-center mb-2">
                  {response.role === "user" ? <Person /> : <SmartToy />}
                </div>

                <h2 className="font-bold">
                  {response.role === "user" ? "User" : "Gemini"}
                </h2>
              </div>

              <Markdown
                // disallowedElements={["code"]}
                remarkPlugins={[gfm]}
                components={components}
                children={response.parts[0].text}
                // skipHTML={true}
              />
            </div>
          );
        })}
        {generatedContent.length ? (
          <>
            <div className="flex flex-row items-center">
              <div className="mr-3 items-center mb-2">{<SmartToy />}</div>

              <h2 className="font-bold text-gray-50 font-mono text-lg">
                Gemini
              </h2>
            </div>

            <TypedResponse
              markdownText={generatedContent}
              getHistory={getHistory}
              setGeneratedResponse={setGeneratedContent}
              setPastResponses={setPastResponses}
              pastResponses={pastResponses}
            />
          </>
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
