"use client";

import { Button } from "@craft-apex/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@craft-apex/ui/components/card";
import { useCounterStore } from "@/store/counter";
import { useQuery } from "@tanstack/react-query";

async function fetchWelcomeData() {
  // Simulated API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    message: "Welcome to Partner Portal!",
    technologies: [
      "Turborepo",
      "Next.js",
      "Tailwind CSS",
      "Zustand",
      "TanStack Query",
      "shadcn/ui",
    ],
  };
}

export default function Home() {
  const { count, increment, decrement, reset } = useCounterStore();

  const { data, isLoading } = useQuery({
    queryKey: ["welcome"],
    queryFn: fetchWelcomeData,
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-gradient-to-br from-background via-background to-muted">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Partner Portal
        </h1>
        <p className="text-lg text-muted-foreground max-w-[600px]">
          A monorepo powered by Turborepo with Next.js, Tailwind CSS, Zustand,
          TanStack Query, and shadcn/ui.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 max-w-3xl w-full">
        {/* Zustand Demo Card */}
        <Card>
          <CardHeader>
            <CardTitle>Zustand Store</CardTitle>
            <CardDescription>
              Global state management with Zustand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold text-center tabular-nums">
              {count}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={decrement}>
                −
              </Button>
              <Button variant="outline" size="sm" onClick={reset}>
                Reset
              </Button>
              <Button size="sm" onClick={increment}>
                +
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TanStack Query Demo Card */}
        <Card>
          <CardHeader>
            <CardTitle>TanStack Query</CardTitle>
            <CardDescription>
              Server state management with React Query
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">{data?.message}</p>
                <div className="flex flex-wrap gap-1.5">
                  {data?.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="text-sm text-muted-foreground mt-8">
        Built with ❤️ using Turborepo
      </footer>
    </main>
  );
}
