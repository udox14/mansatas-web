import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react'

const QUICK_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/#program', label: 'Program Unggulan' },
  { href: '/artikel', label: 'Berita & Artikel' },
  { href: '/#galeri', label: 'Galeri' },
  { href: '/#kontak', label: 'Hubungi Kami' },
]

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/man1tasikmalaya', label: 'Instagram' },
  { href: 'https://www.youtube.com/@man1tasikmalaya', label: 'YouTube' },
  { href: 'https://www.facebook.com/man1tasikmalaya', label: 'Facebook' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-800 dark:bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Identitas */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                M1
              </div>
              <div>
                <p className="font-heading font-bold text-white text-sm">MAN 1 Tasikmalaya</p>
                <p className="text-xs text-slate-400">Singaparna</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Madrasah Aliyah Negeri 1 Tasikmalaya — Unggul dalam Iman, Ilmu, dan Amal. 
              Mencetak generasi yang berakhlak mulia dan berwawasan global.
            </p>
          </div>

          {/* Col 2: Link Cepat */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm mb-4">
              Link Cepat
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Kontak */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm mb-4">
              Kontak
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <MapPin size={16} className="text-primary-400 mt-0.5 shrink-0" />
                <span className="text-slate-400">
                  Jl. Letjend. Mashudi No. 112, Singaparna, Tasikmalaya, Jawa Barat 46411
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <Phone size={16} className="text-primary-400 mt-0.5 shrink-0" />
                <span className="text-slate-400">(0265) 544717</span>
              </li>
              <li className="flex gap-3 text-sm">
                <Mail size={16} className="text-primary-400 mt-0.5 shrink-0" />
                <span className="text-slate-400">info@man1tasik.sch.id</span>
              </li>
              <li className="flex gap-3 text-sm">
                <Clock size={16} className="text-primary-400 mt-0.5 shrink-0" />
                <span className="text-slate-400">Senin — Sabtu, 07.00 — 15.30 WIB</span>
              </li>
            </ul>
            {/* Social */}
            <div className="flex gap-3 mt-5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-400 transition-colors"
                >
                  <ExternalLink size={12} />
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 4: Map */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm mb-4">
              Lokasi
            </h3>
            <div className="rounded-xl overflow-hidden border border-slate-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.0!2d108.1147!3d-7.3517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f57001a0a0001%3A0x3030bfbcaf770b0!2sMAN%201%20Tasikmalaya!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi MAN 1 Tasikmalaya"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} MAN 1 Tasikmalaya. Hak cipta dilindungi.
          </p>
          <p className="text-xs text-slate-500">
            Dibangun dengan teknologi modern
          </p>
        </div>
      </div>
    </footer>
  )
}
