import Link from "next/link";
import { FORMS, SERVICE_KEYS } from "@zooli/vendor-forms";

export const metadata = { title: "Become a Zooli vendor" };

export default function RegisterChooser() {
  return (
    <div className="min-h-screen bg-[#f6f4fb]">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zooli-logo.png" alt="Zooli" className="h-11 w-auto" />
          <Link href="/login" className="text-sm font-semibold text-purple-700 hover:underline">Already registered? Sign in</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900">Register your business with Zooli</h1>
        <p className="text-gray-500 mt-1.5">Choose the service you want to offer. Keep your Aadhaar, PAN and bank details handy — it takes about 10 minutes.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {SERVICE_KEYS.map((k) => {
            const f = FORMS[k];
            return (
              <Link key={k} href={`/register/${k}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-purple-300 hover:shadow-md transition">
                <div className="text-4xl">{f.emoji}</div>
                <h2 className="mt-3 text-base font-bold text-indigo-900 group-hover:text-purple-700">{f.shortTitle}</h2>
                <p className="text-sm text-gray-500 mt-1">{f.blurb}</p>
                <p className="text-xs font-semibold text-purple-700 mt-3">Start registration →</p>
              </Link>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-8">Need help? support@zooli.in · 8985956617</p>
      </main>
    </div>
  );
}
