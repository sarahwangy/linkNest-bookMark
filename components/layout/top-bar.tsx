import { auth, signOut } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export async function TopBar() {
  const session = await auth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground w-48 justify-start text-xs"
          render={<Link href="/search">Search bookmarks...</Link>}
        />
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session?.user?.image ?? ""} />
                  <AvatarFallback>{session?.user?.name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {session?.user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings">Settings</Link>} />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button type="submit" className="w-full text-left cursor-pointer">
                    Sign out
                  </button>
                </form>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
