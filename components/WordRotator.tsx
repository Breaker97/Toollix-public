"use client";

import { useState, useEffect } from "react";

const words = ["Creators", "People", "Developers", "Vector Stream", "Designers", "Entrepreneurs"];

export default function WordRotator() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 500); // Wait for fade out to complete
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-grid transition-opacity duration-500 ${
        fade ? "opacity-100" : "opacity-0"
      } text-[#c5a059] tracking-tighter italic place-items-center`}
      style={{ gridTemplateColumns: '1fr' }}
    >
      <span className="col-start-1 row-start-1">{words[index]}</span>
      {/* Invisible spacer to maintain width of longest word and prevent CLS */}
      <span className="col-start-1 row-start-1 invisible h-0">Entrepreneurs</span>
    </span>
  );
}
