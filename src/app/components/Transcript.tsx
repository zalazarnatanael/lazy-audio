"use client";
import {useCallback, useEffect, useRef, useState} from "react";
import {ChangeEvent} from "react";
import axios from "axios";

import Loader from "@/app/components/Loader";

const wait = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
const upload = async (file: File) => {
  const formData = new FormData();

  formData.append("data", file);

  const response = await axios.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.upload_url;
};
const transcribe = async (url: string, lang: string) => {
  const response = await axios.post("/api/transcribe", {data: {url, lang}});
  const id = response.data.id;

  let data = response.data;

  while (data.status !== "completed" && data.status !== "error") {
    await wait(1000);
    const response = await axios.post("/api/result", {data: {id}});

    data = response.data;
  }

  return data;
};

interface Word {
  confidence: number;
  end: number;
  speaker: string;
  start: number;
  text: string;
}

interface Message {
  confidence: number;
  end: number;
  speaker: string;
  start: number;
  text: string;
  words: Word[];
}

function App() {
  const audio = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [transcription, setTranscription] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<string>("none");
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const onScroll = useCallback(() => {
    if (timeRef.current) {
      clearTimeout(timeRef.current);
      setIsScrolling(true);
    }

    timeRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 3000);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, {passive: true});

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleInput = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files && event.target.files.length > 0) {
      audio.current?.pause();
      setFile(event.target.files[0]);
      setTranscription([]);
      setError("");
      setStatus("");

      event.target.value = "";
    }
  };

  const handleTranscription = async () => {
    try {
      if (file) {
        setStatus("uploading");
        const url = await upload(file);

        setStatus("transcribing");
        const data = await transcribe(url, lang);

        setTranscription(data.utterances);
        setStatus("done");

        const blob = window.URL;
        const fileURL = blob.createObjectURL(file);

        if (audio.current) {
          audio.current.src = fileURL;
        }
      }
    } catch (error) {
      console.error(error);
      setError("error");
    }
  };

  const handleOnTimeUpdate = (time: number) => {
    const message = transcription.findLast((mess) => mess.start / 1000 < time);

    setProgress(time);

    const messageElement = document.getElementById(String(message?.start));

    if (!isScrolling) messageElement?.scrollIntoView({behavior: "smooth", block: "center"});
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLang(event.target.value);
  };

  const handleClick = (time: number) => {
    audio.current!.currentTime = time;
    audio.current?.play();
  };

  return (
    <div className="flex h-full w-full justify-center">
      <div className="w-full max-w-lg p-2">
        <label className="flex cursor-pointer flex-col items-center rounded-lg bg-blue-500 p-2 text-white transition-colors duration-150 hover:bg-blue-600">
          <span className="text-base leading-normal">Select a {file ? "different" : ""} file</span>
          <input className="hidden" type="file" onInput={handleInput} />
        </label>
        <button
          className="mt-2 w-full rounded-lg border-2 p-2 transition-colors duration-150  disabled:opacity-40"
          disabled={
            !file || status === "done" || status === "transcribing" || status === "uploading"
          }
          type="button"
          onClick={handleTranscription}
        >
          Transcribe
        </button>
        <div className="flex w-full justify-between pt-4">
          <div className="flex gap-1">
            <input
              checked={lang == "es"}
              id="es"
              name="lang"
              type="radio"
              value="es"
              onChange={handleLanguageChange}
            />
            <label htmlFor="es">Spanish</label>
          </div>
          <div className="flex gap-1">
            <input
              checked={lang == "en"}
              id="en"
              name="lang"
              type="radio"
              value="en"
              onChange={handleLanguageChange}
            />
            <label htmlFor="en">English</label>
          </div>
          <div className="flex gap-1">
            <input
              checked={lang == "none"}
              id="none"
              name="lang"
              type="radio"
              value="none"
              onChange={handleLanguageChange}
            />
            <label htmlFor="none">None</label>
          </div>
        </div>
        {file ? (
          <div className={`mt-2 grid gap-4 rounded-lg ${error && "border-red-500"}`}>
            {transcription.length > 0 && !error ? (
              transcription.map((mess) => (
                <button
                  key={mess.start}
                  className={`
                    max-w-[90%] 
                     rounded-lg p-2 ${mess.speaker.toLowerCase() === "a" ? "rounded-bl-none bg-neutral-600" : "justify-self-end rounded-br-none bg-neutral-500"}`}
                  id={String(mess.start)}
                  type="button"
                  onClick={() => handleClick(mess.start / 1000)}
                >
                  <span className="inline-flex flex-wrap gap-1">
                    {mess.words.map((word: Word) => (
                      <span
                        key={word.start}
                        className={`${progress < word.start / 1000 ? "opacity-50" : "opacity-100"}`}
                      >
                        {word.text}
                      </span>
                    ))}
                  </span>
                </button>
              ))
            ) : (
              <div className="flex w-full justify-center">
                {status && !error ? (
                  <>
                    <Loader />
                    <span className="ml-2 capitalize">{status}...</span>
                  </>
                ) : null}
                {error ? <span className="text-red-500">{error}</span> : null}
                {!status && !error && `File "${file.name}" ready for transcription`}
              </div>
            )}
          </div>
        ) : null}
        <audio
          ref={audio}
          controls
          className={`w-full" id="audio sticky bottom-4 mt-4 w-full ${status == "done" ? "" : "hidden"}`}
          onTimeUpdate={(event) => handleOnTimeUpdate(Number(audio.current?.currentTime))}
        />
      </div>
    </div>
  );
}

export default App;
