"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/cn";

type OTPInputProps = {
  length?: number;
  value?: string;
  onChange: (value: string) => void;
};

export function OTPInput({ length = 6, value = "", onChange }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array.from({ length }, (_, index) => value[index] ?? ""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const next = Array.from({ length }, (_, index) => value[index] ?? "");
    setValues(next);
  }, [length, value]);

  const otp = useMemo(() => values.join(""), [values]);

  useEffect(() => {
    onChange(otp);
  }, [otp, onChange]);

  return (
    <div className="flex gap-2">
      {values.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          onChange={(event) => {
            const nextValue = event.target.value.replace(/\D/g, "").slice(0, 1);
            const next = [...values];
            next[index] = nextValue;
            setValues(next);
            if (nextValue && index < length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          className={cn(
            "h-12 w-12 rounded-2xl border border-black/10 text-center text-base font-medium outline-none transition focus:border-black",
            digit ? "bg-black text-white" : "bg-white",
          )}
        />
      ))}
    </div>
  );
}
