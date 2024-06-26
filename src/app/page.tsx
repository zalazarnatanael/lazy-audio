"use client";
import {useCallback, useEffect, useRef, useState} from "react";

import messages from "../data/transcript.json";
import AUDIO from "../data/audio.wav";

interface Message {
  content: string;
  role: "agent" | "user";
  start: number;
  end: number;
}

export default function HomePage() {
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState<number>(0);
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

  const handleTimeUpdate = (time: number) => {
    const message = messages.findLast((mess) => mess.start < time);

    setProgress(time);

    const messageElement = document.getElementById(String(message?.start));

    if (!isScrolling) messageElement?.scrollIntoView({behavior: "smooth", block: "center"});
  };

  const handleClick = (time: number) => {
    audio.current!.currentTime = time;
    audio.current?.play();
  };

  return (
    <section className="">
      <div className="grid gap-4">
        {messages.map(({start, content, role}) => (
          <button
            key={start}
            className={`
              ${progress < start ? "opacity-50" : "opacity-100"} 
              max-w-[90%] rounded  p-4 
              ${role == "user" ? "justify-self-end bg-neutral-500" : "bg-neutral-600"}`}
            id={String(start)}
            type="button"
            onClick={() => handleClick(start)}
          >
            <span>{content}</span>
          </button>
        ))}

        <audio
          ref={audio}
          controls
          className="sticky bottom-4 w-full pt-4"
          src={AUDIO}
          onTimeUpdate={(event) => handleTimeUpdate(audio.current!.currentTime)}
        />
      </div>
    </section>
  );
}
