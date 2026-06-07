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
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 overflow-hidden relative">
      {/* Subtle Background Glow - Teal/Green Kemenag Theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-900/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          
          {/* Col 1: Identitas */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center shrink-0">
                <img src="/logokemenag.png" alt="Kemenag" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div>
                <p className="font-heading font-black text-white text-lg tracking-tighter drop-shadow-sm">MAN 1 Tasikmalaya</p>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-400 mt-1">Jawa Barat</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Madrasah Aliyah Negeri 1 Tasikmalaya — Unggul dalam Iman, Ilmu, dan Amal. 
              Mencetak generasi yang berakhlak mulia dan berwawasan global.
            </p>
            {/* Social */}
            <div className="flex gap-3 pt-2">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-primary-600 text-slate-400 hover:text-white transition-all duration-300 border border-white/5 shadow-md hover:scale-110"
                  aria-label={s.label}
                  title={s.label}
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Link Cepat */}
          <div>
            <h3 className="font-heading font-black text-white text-sm uppercase tracking-widest mb-6 pb-2 border-b border-white/10 w-fit">
              Link Cepat
            </h3>
            <ul className="space-y-4">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-bold text-slate-400 hover:text-primary-400 transition-colors uppercase tracking-widest flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-primary-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Kontak */}
          <div>
            <h3 className="font-heading font-black text-white text-sm uppercase tracking-widest mb-6 pb-2 border-b border-white/10 w-fit">
              Hubungi Kami
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4 text-sm leading-relaxed text-slate-400 font-medium">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-sm">
                  <MapPin size={14} className="text-primary-400" />
                </div>
                <span className="pt-1">
                  Jl. Pahlawan KHZ. Musthafa Sukamanah, Sukarapih, Kec. Sukarame, Kabupaten Tasikmalaya, Jawa Barat 46461
                </span>
              </li>
              <li className="flex gap-4 text-sm items-center text-slate-400 font-medium">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-sm">
                  <Mail size={14} className="text-primary-400" />
                </div>
                <span>info@man1tasikmalaya.sch.id</span>
              </li>
              <li className="flex gap-4 text-sm items-center text-slate-400 font-medium">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-sm">
                  <Clock size={14} className="text-primary-400" />
                </div>
                <span>Senin — Sabtu, 07.00 — 15.30 WIB</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Map */}
          <div>
            <h3 className="font-heading font-black text-white text-sm uppercase tracking-widest mb-6 pb-2 border-b border-white/10 w-fit">
              Lokasi Madrasah
            </h3>
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group bg-slate-900">
              <div className="absolute inset-0 bg-primary-500/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500 pointer-events-none" />
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1233.2893755285368!2d108.13491956767561!3d-7.3777218326496685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f5683aaf0e91b%3A0x288e0a9b33915cff!2sMAN%201%20Tasikmalaya!5e0!3m2!1sen!2sid!4v1775534224933!5m2!1sen!2sid"
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi MAN 1 Tasikmalaya"
                className="grayscale-0 md:grayscale opacity-100 md:opacity-80 md:group-hover:grayscale-0 md:group-hover:opacity-100 transition-all duration-700"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-500">
            &copy; {new Date().getFullYear()} MAN 1 Tasikmalaya. Hak Cipta Dilindungi.
          </p>
          <div className="flex gap-6">
            <Link href="/pmb" className="text-xs uppercase font-bold tracking-widest text-slate-500 hover:text-primary-400 transition-colors">
              PMB {new Date().getFullYear()}
            </Link>
            <Link href="https://app.mansatas.com" className="text-xs uppercase font-bold tracking-widest text-slate-500 hover:text-primary-400 transition-colors">
              MANSATAS App
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
