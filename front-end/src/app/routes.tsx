import type { ReactElement } from "react";
import { Navigate, useRoutes } from "react-router-dom";

import {
  AdminBlogPostFormPageLazy,
  AdminBlogPostsListPageLazy,
  AdminCitiesListPageLazy,
  AdminCityFormPageLazy,
  AdminDashboardPageLazy,
  AdminEventFormPageLazy,
  AdminEventsListPageLazy,
  AdminHomeHighlightsPageLazy,
  AdminInstitutionalPageLazy,
  AdminLoginPageLazy,
  AdminSettingsPageLazy,
  AdminSocialLinksPageLazy,
  AdminTouristPointFormPageLazy,
  AdminTouristPointsListPageLazy,
} from "@/app/adminLazyPages";
import { MaintenanceModeGate } from "@/shell/public/maintenance/MaintenanceModeGate";
import { AdminAuthBoundary } from "@/shell/admin/AdminAuthBoundary";
import { AdminAuthLayout } from "@/shell/admin/layouts/AdminAuthLayout";
import { AdminLayout } from "@/shell/admin/layouts/AdminLayout";

import { HomePage } from "@/domains/home-institucional/pages/HomePage";
import { EventosPage } from "@/domains/catalogo-publico/eventos/pages/EventosPage";
import { EventoDetailsPage } from "@/domains/catalogo-publico/eventos/pages/EventoDetailsPage";
import { PontosTuristicosPage } from "@/domains/catalogo-publico/pontos/pages/PontosTuristicosPage";
import { PontoTuristicoDetailsPage } from "@/domains/catalogo-publico/pontos/pages/PontoTuristicoDetailsPage";
import { CidadesPage } from "@/domains/cidades-institucional/pages/CidadesPage";
import { HoteisPage } from "@/domains/catalogo-publico/hoteis/pages/HoteisPage";
import { CityDetailsPage } from "@/domains/cidades-institucional/pages/CityDetailsPage";
import { AboutPage } from "@/domains/institucional/pages/AboutPage";
import { BlogPostDetailsPage } from "@/domains/catalogo-publico/blog/pages/BlogPostDetailsPage";

import { AdminRouteGuard } from "@/domains/admin-cms/auth/guards/AdminRouteGuard";
import { PublicNotFoundPage } from "@/shell/public/pages/PublicNotFoundPage";

export function AppRoutes(): ReactElement | null {
  return useRoutes([
    {
      path: "/",
      element: <MaintenanceModeGate />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "eventos", element: <EventosPage /> },
        { path: "eventos/:slug", element: <EventoDetailsPage /> },
        { path: "pontos-turisticos", element: <PontosTuristicosPage /> },
        {
          path: "pontos-turisticos/:slug",
          element: <PontoTuristicoDetailsPage />,
        },
        { path: "cidades", element: <CidadesPage /> },
        { path: "cidades/:slug", element: <CityDetailsPage /> },
        { path: "hoteis", element: <HoteisPage /> },
        { path: "sobre", element: <AboutPage /> },
        { path: "blog/:slug", element: <BlogPostDetailsPage /> },
      ],
    },
    {
      path: "/admin",
      element: <AdminAuthBoundary />,
      children: [
        {
          element: <AdminAuthLayout />,
          children: [{ path: "login", element: <AdminLoginPageLazy /> }],
        },
        {
          element: <AdminRouteGuard />,
          children: [
            {
              element: <AdminLayout />,
              children: [
                { index: true, element: <AdminDashboardPageLazy /> },
                {
                  path: "institucional",
                  element: <AdminInstitutionalPageLazy />,
                },
                {
                  path: "home",
                  element: <Navigate to="/admin/home/destaques" replace />,
                },
                {
                  path: "home/destaques",
                  element: <AdminHomeHighlightsPageLazy />,
                },
                {
                  path: "midias-sociais",
                  element: <AdminSocialLinksPageLazy />,
                },
                {
                  path: "configuracoes",
                  element: <AdminSettingsPageLazy />,
                },
                {
                  path: "cidades",
                  element: <AdminCitiesListPageLazy />,
                },
                {
                  path: "cidades/nova",
                  element: <AdminCityFormPageLazy />,
                },
                {
                  path: "cidades/editar",
                  element: <AdminCityFormPageLazy />,
                },
                {
                  path: "eventos",
                  element: <AdminEventsListPageLazy />,
                },
                {
                  path: "eventos/novo",
                  element: <AdminEventFormPageLazy />,
                },
                {
                  path: "eventos/editar",
                  element: <AdminEventFormPageLazy />,
                },
                {
                  path: "pontos-turisticos",
                  element: <AdminTouristPointsListPageLazy />,
                },
                {
                  path: "pontos-turisticos/novo",
                  element: <AdminTouristPointFormPageLazy />,
                },
                {
                  path: "pontos-turisticos/editar",
                  element: <AdminTouristPointFormPageLazy />,
                },
                {
                  path: "blog",
                  element: <AdminBlogPostsListPageLazy />,
                },
                {
                  path: "blog/novo",
                  element: <AdminBlogPostFormPageLazy />,
                },
                {
                  path: "blog/editar",
                  element: <AdminBlogPostFormPageLazy />,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <MaintenanceModeGate />,
      children: [{ path: "*", element: <PublicNotFoundPage /> }],
    },
  ]);
}
