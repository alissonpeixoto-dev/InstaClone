import React from "react";
import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#262626] mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2.5 text-sm bg-[#fafafa] border rounded-lg outline-none",
            "placeholder:text-[#8e8e8e] text-[#262626]",
            "focus:border-[#a8a8a8] focus:bg-white",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#dbdbdb]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#8e8e8e]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
