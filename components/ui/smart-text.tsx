"use client";

import React from "react";

interface SmartTextProps {
  text: string;
}

/**
 * SmartText automatically parses basic markdown-style formatting:
 * - **bold** or __bold__ -> <strong>
 * - *italic* or _italic_ -> <em>
 * 
 * It is designed for use in hardcoded strings or props where 
 * full ReactMarkdown would be overkill or cause layout issues.
 */
export function SmartText({ text }: SmartTextProps) {
  if (!text) return null;

  // 1. Split by Bold patterns (**text** or __text__)
  // Regex uses capturing group to keep the delimiters in the array
  const boldParts = text.split(/(\*\*.*?\*\*|__.*?__)/g);

  return (
    <>
      {boldParts.map((part, i) => {
        if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
          const innerText = part.slice(2, -2);
          return <strong key={i}>{parseItalic(innerText)}</strong>;
        }
        return <React.Fragment key={i}>{parseItalic(part)}</React.Fragment>;
      })}
    </>
  );
}

/**
 * Helper to parse italics (*text* or _text_)
 */
function parseItalic(text: string) {
  if (!text) return "";
  
  const italicParts = text.split(/(\*.*?\*|_.*?_)/g);
  
  return (
    <>
      {italicParts.map((part, i) => {
        if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
}
