import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { SiWhatsapp, SiInstagram, SiTiktok, SiYoutube, SiDiscord } from "react-icons/si";
import { Menu, X } from "lucide-react";
import { MusicPlayer } from "@/components/music-player";
import imgPacksFamosos  from "@assets/B904F514-8B52-4DE3-A1A0-C4D95A29658C_1782378165734.png";
import imgXitAndroid    from "@assets/AD2E4752-911B-46EA-91ED-3C2A1D6E1060_1782113892813.png";
import imgXitIphone     from "@assets/82DE07C7-5D51-4EF6-92E2-B8CABDE3F0A7_1782114063629.png";
import imgProxy         from "@assets/275C19BF-150A-4284-A57A-CC3BB7FFDAE2_1782114196971.png";
import imgOptimizacion  from "@assets/5240705F-8DCC-43AB-95BC-7738266BEB49_1782115776696.png";
import imgProyectos     from "@assets/13485FB2-BB07-47A6-9D8C-0FE0EAA95DA4_1782175055753.png";
import imgHudFamosos    from "@assets/7C310EFA-E93F-47E1-BD8F-A8AEB5142137_1782362930624.png";

const CATALOGS = [
  { slug: "packs-famosos",   label: "Packs de Famosos", img: imgPacksFamosos  },
  { slug: "xit-android",     label: "Xit Android",      img: imgXitAndroid    },
  { slug: "xit-iphone",      label: "Xit iPhone",       img: imgXitIphone     },
  { slug: "proxy",           label: "Proxy",            img: imgProxy         },
  { slug: "optimizacion",    label: "Optimización",     img: imgOptimizacion  },
  { slug: "hud-famosos",     label: "HUD de Famosos",   img: imgHudFamosos    },
  { slug: "proyectos-beast", label: "Proyectos Beast",  img: imgProyectos     },
];

const DEFAULT_WA = "https://wa.me/526462676766?text=Hola,%20quiero%20comprar%20acceso%20VIP%20a%20Beast%20Sensi%207";
const DEFAULT_IG = "https://www.instagram.com/victor_lopez1091?igsh=bmcxNm9uOHJjcWI1&utm_source=qr";
const DEFAULT_DC = "https://discord.gg/xE7e4j54za";

async function getSetting(key: string): Promise<string | null> {
  try {
    const r = await fetch(`/api/settings/${key}`);
    if (!r.ok) return null;
    const d = await r.json();
    return d?.value ?? null;
  } catch {
    return null;
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [particles, setParticles] = useState<{ id: number; left: string; delay: string; duration: string }[]>([]);
  const [social, setSocial] = useState({
    whatsapp: DEFAULT_WA,
    instagram: DEFAULT_IG,
    tiktok: "#",
    youtube: "#",
    discord: DEFAULT_DC,
  });
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  const isVipRoute = location.startsWith("/vip");
  const isVipUser = typeof window !== "undefined" && localStorage.getItem("beast-access") === "vip";

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 10}s`,
    }));
    setParticles(newParticles);

    // Load dynamic social links + announcement
    Promise.all([
      getSetting("social_whatsapp"),
      getSetting("social_instagram"),
      getSetting("social_tiktok"),
      getSetting("social_youtube"),
      getSetting("social_discord"),
      getSetting("site_announcement_on"),
      getSetting("site_announcement"),
    ]).then(([wa, ig, tt, yt, dc, annOn, annText]) => {
      setSocial({
        whatsapp: wa || DEFAULT_WA,
        instagram: ig || DEFAULT_IG,
        tiktok: tt || "#",
        youtube: yt || "#",
        discord: dc || DEFAULT_DC,
      });
      if (annOn === "1" && annText) setAnnouncement(annText);
    });
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden dark text-foreground">
      {/* Global Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]" />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map(p => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                bottom: "-10px",
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      </div>

      {/* Announcement bar */}
      {announcement && !announcementDismissed && !isVipRoute && (
        <div className="relative z-50 w-full flex items-center justify-center gap-3 px-4 py-2 text-sm font-bold text-white text-center"
          style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7,#7c3aed)", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }}>
          <span className="text-base">📢</span>
          <span className="font-mono text-xs sm:text-sm tracking-wide">{announcement}</span>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-lg leading-none"
          >×</button>
        </div>
      )}

      {/* Navbar - hidden on VIP routes where sidebar takes over */}
      {!isVipRoute && (
        <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-black/60 backdrop-blur-md shadow-[0_4px_30px_rgba(139,92,246,0.1)]">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/beast-logo.png" alt="Beast Sensi 7 Logo" className="h-10 w-auto object-contain" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className={`text-sm font-display font-medium uppercase tracking-wider transition-all relative py-2 ${location === '/' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                Inicio
                {location === '/' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />}
              </Link>

              {isVipUser ? (
                <Link href="/vip" className={`text-sm font-display font-medium uppercase tracking-wider transition-all relative py-2 ${location.startsWith('/vip') ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                  PANEL VIP
                  {location.startsWith('/vip') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />}
                </Link>
              ) : (
                <Link href="/redeem" className={`text-sm font-display font-medium uppercase tracking-wider transition-all relative py-2 ${location === '/redeem' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                  VIP
                  {location === '/redeem' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />}
                </Link>
              )}

              <Link href="/sensitivity" className={`text-sm font-display font-medium uppercase tracking-wider transition-all relative py-2 ${location === '/sensitivity' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                Sensi
                {location === '/sensitivity' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />}
              </Link>

              <Link href="/descargas" className={`text-sm font-display font-medium uppercase tracking-wider transition-all relative py-2 ${location === '/descargas' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                Descargas
                {location === '/descargas' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />}
              </Link>

              <Link href="/faq" className={`text-sm font-display font-medium uppercase tracking-wider transition-all relative py-2 ${location === '/faq' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                FAQ
                {location === '/faq' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />}
              </Link>

              <Link href="/referencias" className={`text-sm font-display font-medium uppercase tracking-wider transition-all relative py-2 ${location === '/referencias' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                Referencias
                {location === '/referencias' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />}
              </Link>
            </nav>

            {/* Mobile Nav Toggle */}
            <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Nav Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-black/95 backdrop-blur-lg border-b border-primary/20 py-4 px-4 flex flex-col gap-4 shadow-xl z-50">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className={`text-lg font-display uppercase tracking-wider ${location === '/' ? 'text-primary' : 'text-white'}`}>
                Inicio
              </Link>
              {isVipUser ? (
                <Link href="/vip" onClick={() => setIsMenuOpen(false)} className={`text-lg font-display uppercase tracking-wider ${location.startsWith('/vip') ? 'text-primary' : 'text-white'}`}>
                  PANEL VIP
                </Link>
              ) : (
                <Link href="/redeem" onClick={() => setIsMenuOpen(false)} className={`text-lg font-display uppercase tracking-wider ${location === '/redeem' ? 'text-primary' : 'text-white'}`}>
                  VIP
                </Link>
              )}
              <Link href="/sensitivity" onClick={() => setIsMenuOpen(false)} className={`text-lg font-display uppercase tracking-wider ${location === '/sensitivity' ? 'text-primary' : 'text-white'}`}>
                Sensi
              </Link>
              <Link href="/faq" onClick={() => setIsMenuOpen(false)} className={`text-lg font-display uppercase tracking-wider ${location === '/faq' ? 'text-primary' : 'text-white'}`}>
                FAQ
              </Link>
              <Link href="/referencias" onClick={() => setIsMenuOpen(false)} className={`text-lg font-display uppercase tracking-wider ${location === '/referencias' ? 'text-primary' : 'text-white'}`}>
                Referencias
              </Link>
              <a
                href="https://chat.whatsapp.com/KS0Wu6RRyaz8V28rSwPiT6?s=cl&p=i&mlu=4"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-lg font-display uppercase tracking-wider text-green-400 hover:text-green-300 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Grupo Comunidad
              </a>

              {/* Divider — Catalogs with images */}
              <div className="border-t border-primary/20 pt-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-3 font-mono">Descargas</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATALOGS.map(({ slug, label, img }) => (
                    <Link
                      key={slug}
                      href={`/descargas/${slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`relative overflow-hidden rounded-xl border transition-all ${location === `/descargas/${slug}` ? 'border-primary' : 'border-primary/20 hover:border-primary/60'}`}
                    >
                      <img src={img} alt={label} className="w-full h-20 object-cover object-center" />
                      <div
                        className="absolute inset-0 flex items-end p-2"
                        style={{ background: "linear-gradient(to top, rgba(5,3,15,0.92) 0%, rgba(5,3,15,0.3) 70%, transparent 100%)" }}
                      >
                        <span className="text-[10px] font-display font-bold uppercase tracking-wider text-white leading-tight">
                          {label}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 relative z-10 flex flex-col ${isVipRoute ? 'h-screen' : ''}`}>
        {children}
      </main>

      {/* Footer - Hidden on VIP routes */}
      {!isVipRoute && (
        <footer className="border-t border-primary/20 bg-black/40 backdrop-blur-sm py-12 relative z-10 mt-auto">
          <div className="container mx-auto px-4 flex flex-col items-center">
            <img src="/beast-logo.png" alt="Beast Sensi 7 Logo" className="h-16 w-auto object-contain mb-6 opacity-80" />

            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm uppercase tracking-wider font-display font-medium text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
              <Link href="/sensitivity" className="hover:text-primary transition-colors">Sensibilidad</Link>
              <Link href="/redeem" className="hover:text-primary transition-colors">Premium</Link>
              <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Contacto</a>
            </div>

            <div className="flex gap-6 mb-8">
              {social.instagram !== "#" && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform"><SiInstagram size={24} /></a>
              )}
              {social.tiktok !== "#" && (
                <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform"><SiTiktok size={24} /></a>
              )}
              {social.youtube !== "#" && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform"><SiYoutube size={24} /></a>
              )}
              {social.discord !== "#" && (
                <a href={social.discord} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform"><SiDiscord size={24} /></a>
              )}
            </div>

            <p className="text-xs text-muted-foreground/50 font-mono tracking-widest text-center">
              &copy; {new Date().getFullYear()} BEAST SENSI 7. TODOS LOS DERECHOS RESERVADOS.
            </p>
          </div>
        </footer>
      )}

      {/* WhatsApp Floating Button - Hidden on VIP routes */}
      {!isVipRoute && (
        <a
          href={social.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] animate-pulse"
        >
          <SiWhatsapp className="w-7 h-7" />
        </a>
      )}

      {/* Global Music Player */}
      <MusicPlayer />
    </div>
  );
}
