"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, AlertCircle, Scan, FileText } from "lucide-react";

interface ContractUploadProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
  analysisStep: string | null;
  text: string;
  onTextChange: (text: string) => void;
}

export default function ContractUpload({
  onAnalyze,
  isAnalyzing,
  analysisStep,
  text,
  onTextChange,
}: ContractUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedFileName, setParsedFileName] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setError(null);
    setIsParsing(true);
    setParsedFileName(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: formData });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to parse file");
      }

      const data = await res.json();
      if (data.text) {
        onTextChange(data.text);
        setParsedFileName(file.name);
      } else {
        setError("Could not extract text from this file.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error reading file.");
    } finally {
      setIsParsing(false);
    }
  }, [onTextChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  return (
    <div className="w-full space-y-6">
      
      {/* ── Dash-Border Yellow Dropzone ── */}
      <div
        {...getRootProps()}
        className={`w-full py-16 px-6 text-center cursor-pointer transition-all duration-100 flex flex-col items-center justify-center border-3 border-dashed border-[#1a1a1a] bg-[#ffe082] ${
          isDragActive
            ? "translate-y-[-2px] shadow-[6px_6px_0px_0px_#1a1a1a]"
            : "hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#1a1a1a]"
        }`}
      >
        <input {...getInputProps()} />

        <div className="w-16 h-16 bg-[#ffffff] border-2 border-[#1a1a1a] neo-shadow-sm flex items-center justify-center mb-6">
          <Upload className="w-8 h-8 text-[#1a1a1a]" />
        </div>

        <p className="text-xl font-extrabold tracking-tight text-[#1a1a1a] leading-snug">
          <span className="underline decoration-3 decoration-[#1a1a1a] hover:text-[#555555]">
            Choose file to upload
          </span>
        </p>
        
        <p className="text-xs font-mono font-black uppercase text-[#555555] tracking-wider mt-1.5">
          or drag and drop
        </p>

        {/* Black Mono Banner */}
        <div className="mt-6 px-4 py-2 bg-[#1a1a1a] text-[#ffffff] font-mono text-[9px] font-black tracking-widest uppercase">
          SUPPORTS PDF, DOCX UP TO 10MB
        </div>
      </div>

      {/* ── Status indicators ── */}
      {isParsing && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-[#ffe082] border-2 border-[#1a1a1a] text-xs font-black uppercase tracking-wider">
          <div className="w-4 h-4 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full animate-spin flex-shrink-0" />
          <span>Extracting document text...</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-[#ff8a80] border-2 border-[#1a1a1a] text-xs font-bold text-[#1a1a1a]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {parsedFileName && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#a7ffeb] border-2 border-[#1a1a1a] text-xs font-black uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>LOADED: {parsedFileName}</span>
        </div>
      )}

      {/* ── Or Paste Text area ── */}
      <div className="space-y-2">
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t-2 border-[#1a1a1a]"></div>
          <span className="flex-shrink mx-4 text-[10px] font-black font-mono tracking-widest text-[#1a1a1a] uppercase">
            or paste raw text
          </span>
          <div className="flex-grow border-t-2 border-[#1a1a1a]"></div>
        </div>

        <div className="relative bg-[#ffffff] border-2 border-[#1a1a1a] neo-shadow">
          <textarea
            value={text}
            onChange={(e) => {
              onTextChange(e.target.value);
              if (parsedFileName) setParsedFileName(null);
            }}
            placeholder="// paste your agreement contents here..."
            rows={8}
            className="w-full p-4 bg-[#ffffff] text-sm leading-relaxed outline-none border-none text-[#1a1a1a] font-mono resize-y"
          />
          {text && (
            <div className="absolute bottom-3 right-4 text-[10px] font-mono font-black text-[#555555]">
              {text.length.toLocaleString()} CHARS
            </div>
          )}
        </div>
      </div>

      {/* ── Submit CTA ── */}
      <button
        onClick={() => onAnalyze(text)}
        disabled={!text.trim() || isAnalyzing}
        className="w-full py-4.5 bg-[#ff8a80] text-sm font-black tracking-wider uppercase rounded-none border-2 border-[#1a1a1a] neo-shadow hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#1a1a1a] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1a1a1a] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 text-[#1a1a1a]"
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
            <span>{analysisStep || "Analyzing..."}</span>
          </>
        ) : (
          <>
            <Scan className="w-4 h-4" />
            <span>Initiate AI Scan</span>
          </>
        )}
      </button>

    </div>
  );
}
