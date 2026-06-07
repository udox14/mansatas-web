import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, ExternalLink, Instagram, Youtube, Facebook, Music2 } from 'lucide-react'

const QUICK_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/#program', label: 'Program Unggulan' },
  { href: '/artikel', label: 'Berita & Artikel' },
  { href: '/#galeri', label: 'Galeri' },
  { href: '/#kontak', label: 'Hubungi Kami' },
]

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/mansatasofficial', label: 'Instagram', icon: Instagram },
  { href: 'https://www.youtube.com/@MansatasOfficial', label: 'YouTube', icon: Youtube },
  { href: 'https://www.tiktok.com/@mansatasofficial', label: 'TikTok', icon: Music2 },
  { href: 'https://www.facebook.com/61585855274287/', label: 'Facebook', icon: Facebook },
]

export default function Footer() {
  return (
    <footer className="bg-primary-950 dark:bg-slate-950 text-slate-300 border-t border-primary-900/40 dark:border-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Identitas */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 flex items-center justify-center shrink-0">
                <img src="/logokemenag.png" alt="Kemenag" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-heading font-extrabold text-white text-sm tracking-tight">MAN 1 Tasikmalaya</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-accent-400">Jawa Barat</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Madrasah Aliyah Negeri 1 Tasikmalaya — Unggul dalam Iman, Ilmu, dan Amal. 
              Mencetak generasi yang berakhlak mulia dan berwawasan global.
            </p>
            {/* Social */}
            <div className="flex gap-2 pt-2">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-accent-500 text-slate-350 hover:text-white transition-all duration-300 border border-white/5 shadow-sm"
                  aria-label={s.label}
                  title={s.label}
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Link Cepat */}
          <div>
            <h3 className="font-heading font-extrabold text-white text-xs uppercase tracking-wider mb-5 pb-1 border-b border-white/5 w-fit">
              Link Cepat
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-bold text-slate-400 hover:text-accent-400 transition-colors uppercase tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Kontak */}
          <div>
            <h3 className="font-heading font-extrabold text-white text-xs uppercase tracking-wider mb-5 pb-1 border-b border-white/5 w-fit">
              Hubungi Kami
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-xs leading-relaxed text-slate-400 font-medium">
                <MapPin size={16} className="text-accent-500 mt-0.5 shrink-0" />
                <span>
                  Jl. Pahlawan KHZ. Musthafa Sukamanah, Sukarapih, Kec. Sukarame, Kabupaten Tasikmalaya, Jawa Barat 46461
                </span>
              </li>
              <li className="flex gap-3 text-xs items-center text-slate-400 font-medium">
                <Mail size={16} className="text-accent-500 shrink-0" />
                <span>info@man1tasikmalaya.sch.id</span>
              </li>
              <li className="flex gap-3 text-xs items-center text-slate-400 font-medium">
                <Clock size={16} className="text-accent-500 shrink-0" />
                <span>Senin — Sabtu, 07.00 — 15.30 WIB</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Map */}
          <div>
            <h3 className="font-heading font-extrabold text-white text-xs uppercase tracking-wider mb-5 pb-1 border-b border-white/5 w-fit">
              Lokasi Madrasah
            </h3>
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1233.2893755285368!2d108.13491956767561!3d-7.3777218326496685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f5683aaf0e91b%3A0x288e0a9b33915cff!2sMAN%201%20Tasikmalaya!5e0!3m2!1sen!2sid!4v1775534224933!5m2!1sen!2sid"
                width="100%"
                height="150"
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
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            &copy; {new Date().getFullYear()} MAN 1 Tasikmalaya. Hak Cipta Dilindungi.
          </p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Ikhlas Beramal
          </p>
        </div>
      </div>
    </footer>
  )
}
