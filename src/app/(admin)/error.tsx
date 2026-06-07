"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="font-brand text-3xl font-light text-destructive">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            An unexpected error occurred in the admin area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            You can try again, or head back to your portal.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => reset()}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/admin-portal">Back to portal</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
