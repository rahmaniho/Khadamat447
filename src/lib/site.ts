import { ensureBootstrap } from "@/lib/bootstrap";
import { getSiteConfig, type PublicSiteConfig, envOnly } from "@/lib/settings";
import { getActiveServices, type Service } from "@/lib/queries";
import { IS_STATIC, staticGetSiteConfig } from "@/lib/static-data";

export async function loadSite(): Promise<PublicSiteConfig> {
  if (IS_STATIC) return staticGetSiteConfig();
  await ensureBootstrap();
  return getSiteConfig();
}

export async function loadSiteWithServices(): Promise<{ site: PublicSiteConfig; services: Service[] }> {
  if (IS_STATIC) {
    const site = staticGetSiteConfig();
    const services = await getActiveServices();
    return { site, services };
  }
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
