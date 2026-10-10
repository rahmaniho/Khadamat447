import { Icon } from "@/components/icons";
import type { PublicSiteConfig } from "@/lib/settings";
import { mapsUrl } from "@/lib/site";

/**
 * نقشه تعاملی OpenStreetMap (iframe بدون نیاز به کلید API).
 * اگر سرویس نقشه مسدود باشد، لینک مستقیم مسیریابی همیشه در دسترس است.
 */
export function MapBlock({ site }: { site: PublicSiteConfig }) {
  const { lat, lng } = site;
  const d = 0.004;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
      <div className="relative aspect-[4/3] w-full bg-brand-50 md:aspect-[16/9]">
        <iframe
          title={`نقشه موقعیت ${site.name}`}
          src={embed}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-7 text-slate-700">
          <p className="font-bold text-slate-900">{site.addressFull}</p>
          <p className="ltr-num text-xs text-slate-500">
            {lat}, {lng}
          </p>
        </div>
        <a
          href={mapsUrl(site)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-800"
        >
          <Icon name="pin" size={18} /> مسیریابی در Google Maps
        </a>
      </div>
    </div>
  );
}
