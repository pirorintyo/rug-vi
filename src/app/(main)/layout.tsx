import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NavBar } from "@/components/ui/NavBar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar user={session?.user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
