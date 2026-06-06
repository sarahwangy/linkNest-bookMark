import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">Linknest</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          All your bookmarks across every browser and account, finally in one place.
        </p>
      </div>
      <div className="flex gap-3">
        <Button render={<Link href="/demo">Try Demo</Link>} />
        <Button variant="outline" render={<Link href="/login">Get Started</Link>} />
      </div>
    </div>
  );
}
