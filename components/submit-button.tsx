"use client";

import { useState } from "react";

type Props = {
  onClick?: () => Promise<void>;
  pendingText?: string;
  children: React.ReactNode;
};

export function SubmitButton({
  onClick,
  pendingText = "Submitting...",
  children,
  ...props
}: Props) {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (onClick) {
      setPending(true);
      try {
        await onClick();
      } finally {
        setPending(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      {...props}
    >
      {pending ? pendingText : children}
    </button>
  );
}