"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Home, Search, Compass } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-full w-full items-center justify-center overflow-hidden bg-background px-4 py-16 sm:px-6 lg:px-8">
      {/* Ambient grid background */}
      <div
        className="pointer-events-none absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,theme(colors.border)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border)_1px,transparent_1px)] opacity-40"
        aria-hidden="true"
      />

      {/* Radial fade so the grid isn't uniform */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_70%)]"
        aria-hidden="true"
      />

      {/* Soft glow accent */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* <div className="mb-6 flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <Compass className="h-3.5 w-3.5" />
          <span>LAT 0.000, LON 0.000 — off the map</span>
        </div> */}

        {/* Big 404 */}
        <h1 className="select-none bg-gradient-to-b from-foreground to-foreground/30 bg-clip-text text-[7rem] font-black leading-none tracking-tight text-transparent sm:text-[9rem] md:text-[11rem]">
          404
        </h1>

        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          This page wandered off
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground sm:text-base">
          We couldn&apos;t find what you were looking for. It may have been
          moved, renamed, or never existed in the first place.
        </p>

        {/* Search box (optional quick recovery path) */}
        {/* <form
          className="mt-8 flex w-full max-w-sm items-center gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Try searching instead..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">
            Search
          </Button>
        </form> */}

        {/* Actions */}
        <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>

        {/* Divider + help link */}
        <div className="mt-10 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px w-8 bg-border" />
          <span>
            Still stuck?{" "}
            <Link
              href="/contact"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Contact support
            </Link>
          </span>
          <span className="h-px w-8 bg-border" />
        </div>
      </div>
    </main>
  );
}
