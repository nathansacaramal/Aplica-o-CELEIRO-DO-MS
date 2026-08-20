import type { ReactElement } from "react";

export function MaintenancePage(): ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center text-zinc-900">
      <img
        src="/celeiro_ms_logo.jpg"
        alt="Celeiro do MS"
        className="mb-6 h-16 w-16 rounded-full object-cover"
      />

      <p className="mb-1 text-sm font-medium text-zinc-500">Celeiro do MS</p>

      <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
        Site em manutenção
      </h1>

      <p className="max-w-md text-zinc-600">
        Estamos realizando algumas melhorias no sistema. Em breve o site
        estará disponível novamente.
      </p>
    </div>
  );
}
