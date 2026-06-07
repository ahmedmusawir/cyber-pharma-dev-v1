"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

export default function MembersPortalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await useAuthStore.getState().logout();
      router.refresh();
      router.push("/auth");
    } catch {
      console.error("Failed to log out");
    }
  };

  return (
    <main className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="font-brand text-3xl font-light">Members Portal</CardTitle>
          <CardDescription className="uppercase text-xs font-bold tracking-wide text-muted-foreground">
            Coming in Phase 2
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Your member dashboard is being prepared. Check back soon.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button asChild variant="outline">
              <Link href="/members-portal/profile">View profile</Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
