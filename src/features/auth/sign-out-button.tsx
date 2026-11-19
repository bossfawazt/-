import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="secondary" size="sm" className="h-10 border-border">
        <LogOut aria-hidden />
        تسجيل الخروج
      </Button>
    </form>
  );
}
