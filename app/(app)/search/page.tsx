import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SearchClient from "./SearchClient";

export default async function SearchPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search across all your bookmarks
        </p>
      </div>
      <SearchClient />
    </div>
  );
}
