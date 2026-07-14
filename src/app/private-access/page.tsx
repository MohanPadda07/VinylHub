import { LockKeyhole } from "lucide-react";

export default function PrivateAccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(118,242,179,0.15),transparent_34%),#070807] px-6">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-emerald/25 bg-emerald/10 text-emerald">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-white">
          VinylHub is private
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          This app is locked to the owner account. Sign in with the approved
          email address to continue.
        </p>
      </section>
    </main>
  );
}
