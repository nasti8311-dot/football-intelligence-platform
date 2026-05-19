import Image from "next/image";
import { auth, signIn, signOut } from "@/auth";

export default async function AuthButton() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={34}
            height={34}
            className="rounded-full border border-white/10"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-sm font-black text-slate-950">
            {session.user.name?.[0] || "U"}
          </div>
        )}

        <div className="hidden leading-tight md:block">
          <p className="text-sm font-black text-white">
            {session.user.name || "Member"}
          </p>
          <p className="text-xs text-slate-500">Beta Member</p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15">
            Logout
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <button className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 shadow-lg shadow-cyan-400/20">
        Login
      </button>
    </form>
  );
}
