import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isValidSession } from "@/lib/auth";

const navigation = [
  { href: "/", label: "Overview", icon: "▦" },
  { href: "/customers", label: "Customers", icon: "◎" },
  { href: "/reports", label: "Reports", icon: "↗" },
];

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  if (!isValidSession(store.get(ADMIN_COOKIE)?.value)) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f6f8f5] text-[#17211c]">
      <header className="border-b border-[#dfe8df] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Tennis Line coach dashboard">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#173d2c] text-sm font-bold text-[#d8f36a]">TL</span>
            <span><span className="block text-sm font-bold tracking-tight text-[#173d2c]">Tennis Line</span><span className="hidden text-xs text-[#7b887f] sm:block">Coach workspace</span></span>
          </Link>
          <div className="flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-xs font-semibold text-[#173d2c]">Coach account</span><span className="block text-[11px] text-[#7b887f]">Bangkok · Online</span></span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8f36a] text-xs font-bold text-[#173d2c]">C</span><form action="/api/auth/logout" method="post"><button type="submit" className="ml-1 rounded-lg px-2 py-2 text-xs font-semibold text-[#7b887f] hover:bg-[#f1f5ef] hover:text-[#173d2c]">Sign out</button></form></div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <aside className="border-b border-[#dfe8df] bg-white px-4 py-3 lg:min-h-[calc(100vh-73px)] lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-8">
          <p className="hidden px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9aa69d] lg:block">Workspace</p>
          <nav className="flex gap-2 overflow-x-auto lg:mt-3 lg:block lg:space-y-1">
            {navigation.map((item) => <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#66746b] transition hover:bg-[#f1f5ef] hover:text-[#173d2c]"><span className="text-base text-[#9bb936]" aria-hidden="true">{item.icon}</span>{item.label}</Link>)}
          </nav>
          <div className="mt-10 hidden rounded-2xl bg-[#f5f8f4] p-4 lg:block"><p className="text-xs font-semibold text-[#173d2c]">Coach tip</p><p className="mt-2 text-xs leading-5 text-[#718076]">Sessions with one seat left convert best when the court photo is up to date.</p></div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <footer className="border-t border-[#dfe8df] bg-white px-5 py-5 text-center text-xs text-[#9aa69d]">Tennis Line coach workspace · Built for better court days</footer>
    </div>
  );
}
