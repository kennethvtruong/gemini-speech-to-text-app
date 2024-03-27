import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import gfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { codeblocks } from "remark-code-blocks";
import { LocalConvenienceStoreOutlined } from "@mui/icons-material";
import CodeBlock from "./CodeBlock";

const TypedResponse = ({ markdownText }) => {
  const [displayText, setDisplayText] = useState("");
  const effectRun = useRef(false);
  useEffect(() => {
    let currIdx = 0;
    if (!effectRun.current && markdownText.length) {
      if (displayText === "") {
        setDisplayText(markdownText[0]);
      }
      const interval = setInterval(() => {
        if (currIdx < markdownText.length) {
          //   if (currentIndex < markdownText.length) {
          setDisplayText(
            (prevText) => prevText + (markdownText[currIdx] || "")
          );
          currIdx++;
        } else {
          clearInterval(interval);
        }
      }, 25); // Adjust speed as needed
      return () => clearInterval(interval);
    }
    effectRun.current = true;
  }, [markdownText]);

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
    <div className="text-gray-50 font-mono text-lg w-full">
      <Markdown
        // disallowedElements={["code"]}
        remarkPlugins={[gfm]}
        components={components}
        children={displayText}
        // skipHTML={true}
      />
    </div>
  );
};

export default TypedResponse;
