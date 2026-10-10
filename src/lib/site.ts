import { ensureBootstrap } from "@/lib/bootstrap";
import { getSiteConfig, type PublicSiteConfig, envOnly } from "@/lib/settings";
import { getActiveServices, type Service } from "@/lib/queries";

export async function loadSite(): Promise<PublicSiteConfig> {
  await ensureBootstrap();
  return getSiteConfig();
}

export async function loadSiteWithServices(): Promise<{ site: PublicSiteConfig; services: Service[] }> {
  await ensureBootstrap();
  const [site, services] = await Promise.all([getSiteConfig(), getActiveServices()]);
  return { site, services };
}

export function absoluteUrl(site: PublicSiteConfig, path = "/"): string {
  const base = site.siteUrl || "";
  return base ? `${base}${path}` : path;
}

export function mapsUrl(site: PublicSiteConfig): string {
  return site.mapUrl || `https://www.google.com/maps?q=${site.lat},${site.lng}`;
}

export function toFaPhone(p: string): string {
  return p.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export { envOnly };
