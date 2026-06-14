"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function NewsletterForm({ stacked = false }: { stacked?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="text-sm text-cream-100">
        Thank you! We&apos;ll keep you posted on fresh batches and offers.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
      className={cn(
        "flex w-full min-w-0 max-w-sm flex-col gap-3",
        !stacked && "md:flex-row",
      )}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="block min-h-[52px] w-full min-w-0 flex-1 rounded-full border border-cream-100/30 bg-cream-50/10 px-5 text-base text-cream-50 placeholder:text-cream-100/60 focus:outline-none focus:ring-2 focus:ring-saffron-400"
      />
      <Button
        type="submit"
        variant="secondary"
        size="lg"
        className={cn("min-h-[52px] shrink-0 px-7 text-base", stacked && "w-full")}
      >
        Subscribe
      </Button>
    </form>
  );
}
