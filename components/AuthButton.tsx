import { auth, signIn, signOut } from "@/auth";

export default async function AuthButton() {
  const session = await auth();

  if (session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white">
          Logout
        </button>
      </form>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <button className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">
        Login
      </button>
    </form>
  );
}
