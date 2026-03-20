import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Визуальный вариант (зарезервировано под будущие стили). */
  variant?: "primary" | "secondary";
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type="button" data-variant={variant} {...rest}>
      {children}
    </button>
  );
}
