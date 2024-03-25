import React, { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ContentPaste } from "@mui/icons-material/";
import { CopyToClipboard } from "react-copy-to-clipboard";

// CodeBlock component to render code blocks with syntax highlighting
const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const codeBlockRef = useRef(null);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const resizeCodeBlock = () => {
    if (codeBlockRef.current) {
      const { scrollHeight } = codeBlockRef.current;
      codeBlockRef.current.style.height = `${scrollHeight}px`;
    }
  };

  useEffect(() => {
    resizeCodeBlock();
  }, [value]);

  return (
    <div className="code-block-container border-t-2 border-gray-500 mt-4 relative w-full">
      <div className="code-block-header bg-gray-800 py-2 px-4 flex items-center justify-between border-b-2 border-gray-500">
        <span className="text-gray-300 text-sm">{language}</span>
        <CopyToClipboard text={value} onCopy={handleCopy}>
          <ContentPaste className="text-gray-300 text-sm cursor-pointer" />
        </CopyToClipboard>
        {copied && (
          <span className="copied-message absolute top-0 right-0 bg-gray-800 text-gray-300 px-2 py-1 text-xs rounded">
            Copied!
          </span>
        )}
      </div>
      <div className="code-block-content overflow-auto">
        <SyntaxHighlighter language={language} style={vscDarkPlus}>
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
