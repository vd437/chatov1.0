import { useState, useRef, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";

interface VerificationInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export function VerificationInput({ length = 6, value, onChange }: VerificationInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, newValue: string) => {
    const digit = newValue.slice(-1);
    if (!/^\d*$/.test(digit)) return;

    const newCode = value.split("");
    newCode[index] = digit;
    onChange(newCode.join(""));

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    onChange(pastedData.padEnd(length, " "));
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    setFocusedIndex(nextIndex);
  };

  return (
    <div className="flex gap-2 justify-center flex-wrap max-w-full">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold bg-card border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all flex-shrink-0"
        />
      ))}
    </div>
  );
}
