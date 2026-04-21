import { ReactNode } from "react";
import { cn } from "@/utils/cn";

type AdminInputProps = {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  textarea?: boolean;
  rows?: number;
  options?: Array<{ label: string; value: string | number }>;
  min?: number;
  max?: number;
};

export function AdminInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  icon,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  className,
  textarea = false,
  rows = 4,
  options,
  min,
  max,
}: AdminInputProps) {
  const baseStyles =
    "w-full px-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-black/2.5 disabled:cursor-not-allowed";

  const borderStyles = error
    ? "border-black bg-white/80"
    : "border-black/10 bg-white hover:border-black/20 focus:border-black";

  const inputValue = value ?? "";

  const commonProps = {
    disabled,
    placeholder,
    className: cn(baseStyles, borderStyles, icon && "pl-10", className),
    value: inputValue,
    onChange,
    readOnly,
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-black">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-black/40">
            {icon}
          </div>
        )}

        {textarea ? (
          <textarea
            {...(commonProps as any)}
            rows={rows}
          />
        ) : options ? (
          <select
            {...(commonProps as any)}
          >
            <option value="">-- Sélectionner --</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...commonProps}
            type={type}
            min={min}
            max={max}
          />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-black/50">{helperText}</p>}
    </div>
  );
}
