import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { usePublicNav } from "@/domains/public-portal/settings/hooks/usePublicNav";
import { useSiteLogo } from "@/domains/public-portal/settings/hooks/useSiteLogo";

export function TopNav(): ReactElement {
  const { url: logoUrl } = useSiteLogo();
  const { items } = usePublicNav();
  const linkBase: string =
    "rounded-xl px-3 py-2 text-sm font-medium transition";
  const linkActive: string = "bg-black/5 text-zinc-900";
  const linkIdle: string = "text-zinc-600 hover:bg-black/5 hover:text-zinc-900";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 py-6">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:rgba(0,152,201,0.12)]">
            <img
              src={logoUrl}
              alt="Logo do Celeiro do MS"
              className="h-8 w-8 rounded-full object-cover"
            />
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-zinc-900">Celeiro do MS</p>
            <p className="text-xs text-zinc-500">Turismo &amp; Eventos</p>
          </div>
        </NavLink>

        <nav
          className="flex w-full items-center gap-1 overflow-x-auto md:w-auto"
          aria-label="Navegação principal"
        >
          <NavLink
            to="/"
            className={({ isActive }: { isActive: boolean }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Home
          </NavLink>

          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
