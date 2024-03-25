"use client";
import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  Videocam,
  VideocamOff,
  VolumeOff,
  VolumeUp,
  Mic,
  MicOff,
  ContentCopy,
  RecordVoiceOver,
} from "@mui/icons-material";

const Dictaphone = ({
  prompt,
  setPrompt,
  // setIsStillListening,
  handleSubmit,
}) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const textAreaRef = useRef(null);
  const [val, setVal] = useState("");
  const handleChange = (e) => {
    setVal(e.target.value);
  };
  // console.log(browserSupportsSpeechRecognition);
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  useEffect(() => {
    textAreaRef.current.style.height = "auto";
    textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
  }, [prompt]);
  useEffect(() => {
    if (listening) {
      setPrompt((oldPrompt) => (oldPrompt = transcript));
    }
    // setIsStillListening(listening);
  }, [transcript, listening]);

  return (
    <div>
      {/* <p>Microphone: {listening ? "on" : "off"}</p>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button> */}
      {/* <button onClick={handleSubmit}>Submit</button> */}
      <label htmlFor="chat" className="sr-only">
        Your message
      </label>
      <div className="flex items-center py-2 px-3 rounded-lg">
        {!listening ? (
          <button
            type="button"
            className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
            onClick={SpeechRecognition.startListening}
          >
            <MicOff />
          </button>
        ) : (
          <>
            <button
              type="button"
              className="inline-flex justify-center p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
              // onClick={SpeechRecognition.startListening}
            >
              <RecordVoiceOver />
            </button>
            <button
              type="button"
              className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
              onClick={SpeechRecognition.stopListening}
            >
              <Mic />
            </button>
          </>
        )}

        <textarea
          id="chat"
          rows="1"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white overflow-hidden rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Your message..."
          ref={textAreaRef}
        ></textarea>
        <button
          type="submit"
          className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
          onClick={handleSubmit}
        >
          <svg
            className="w-6 h-6 rotate-90"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </button>
      </div>
      {/* <input
        type="text"
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
        }}
      />
      <p>{prompt}</p> */}
    </div>
  );
};
export default Dictaphone;
