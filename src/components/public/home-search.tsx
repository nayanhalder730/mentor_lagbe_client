"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Uses the public catalogue's real `search` query parameter. */
export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = query.trim();

    router.push(
      value === "" ? "/tuitions" : `/tuitions?search=${encodeURIComponent(value)}`,
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
    >
      <label htmlFor="hero-search" className="sr-only">
        Search tuitions by title or subject
      </label>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#075b55]/45"
          aria-hidden="true"
        />
        <Input
          id="hero-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by tuition title or subject"
          className="h-11 border-white/20 bg-white/95 pl-9 text-[#075b55] placeholder:text-[#075b55]/45 focus-visible:border-white/40 focus-visible:ring-white/40 dark:border-white/15 dark:bg-white/10 dark:text-[#f5f5ed] dark:placeholder:text-[#f5f5ed]/45"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-11 bg-[#d5b36a] px-6 text-[#0b1f1c] hover:bg-[#e3c585]"
      >
        Search tuitions
      </Button>
    </form>
  );
}
