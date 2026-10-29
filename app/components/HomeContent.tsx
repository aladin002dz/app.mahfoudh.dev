import Image from "next/image";
import HeroSurface from "./HeroSurface";
import ProfileStructuredData from "./ProfileStructuredData";
import { Mail, ArrowUpRight, MessageSquare } from "lucide-react";
import { Linkedin } from "./Icons";
import ProjectCard from "./ProjectCard";
import TalkCard from "./TalkCard";
import Button from "./Button";
import SectionLabel from "./SectionLabel";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { getDictionary } from "../../lib/dictionary";
import { CONTACT_EMAIL, GUESTBOOK_PATH, YT_AR, YT_EN, YT_FR, localePath } from "../../lib/site";

export default async function HomeContent({ lang }: { lang: string }) {
    const dict = await getDictionary(lang);
    const isArabic = lang === "ar";

    const projects = [
        {
            title: "DonateBlood",
            eyebrow: dict.projects.donateblood.eyebrow,
            description: dict.projects.donateblood.description,
            tags: ["react-native", "firebase"],
            links: [
                { label: dict.projects.donateblood.buttons.github, url: "https://github.com/aladin002dz/DonateBlood" },
                { label: dict.projects.donateblood.buttons.demo, url: "https://www.soltana-dam.online/" },
            ],
        },
        {
            title: "ar.react.dev",
            eyebrow: dict.projects.reactar.eyebrow,
            description: dict.projects.reactar.description,
            tags: ["react", "i18n"],
            links: [
                { label: dict.projects.reactar.buttons.website, url: "https://ar.react.dev/" },
                { label: dict.projects.reactar.buttons.source, url: "https://github.com/reactjs/ar.react.dev" },
            ],
        },
        {
            title: "react-library-2025",
            eyebrow: dict.projects.reactlib.eyebrow,
            description: dict.projects.reactlib.description,
            tags: ["typescript", "cli", "npm"],
            links: [
                { label: dict.projects.reactlib.buttons.github, url: "https://github.com/aladin002dz/react-library-2025" },
                { label: dict.projects.reactlib.buttons.npm, url: "https://www.npmjs.com/package/aladin-ts-rc" },
            ],
        },
    ];

    const sp = dict.speaking;
    const photo = (slug: string, n: number, width: number, height: number, alt: string, ext = "webp") =>
        ({ src: `/speaking/${slug}/${n}.${ext}`, width, height, alt });
    const talks = [
        {
            slug: "777-2026", event: "7.77", year: 2026, role: sp.roles.speaker, description: sp.events.e777.description,
            photos: [
                photo("777-2026", 1, 1600, 1036, sp.events.e777.alts[0]),
                photo("777-2026", 2, 2048, 921, sp.events.e777.alts[1], "jpg"),
                photo("777-2026", 3, 1225, 919, sp.events.e777.alts[2], "jpg"),
            ],
        },
        {
            slug: "chlef-science-day-2025", event: "University of Chlef — Science Day", year: 2025, role: sp.roles.speaker, description: sp.events.chlef.description,
            photos: [
                photo("chlef-science-day-2025", 1, 1600, 1066, sp.events.chlef.alts[0]),
                photo("chlef-science-day-2025", 2, 1600, 1066, sp.events.chlef.alts[1]),
                photo("chlef-science-day-2025", 3, 1600, 1066, sp.events.chlef.alts[2]),
            ],
        },
        {
            slug: "algeria-2-0-2024", event: "Algeria 2.0", year: 2024, role: sp.roles.speaker, description: sp.events.algeria.description,
            photos: [photo("algeria-2-0-2024", 1, 1600, 1066, sp.events.algeria.alts[0])],
        },
        {
            slug: "fb-dev-circles-algiers-2019", event: "Facebook Developer Circles Algiers — Community Challenge Day", year: 2019, role: sp.roles.coach, description: sp.events.fb.description,
            photos: [
                photo("fb-dev-circles-algiers-2019", 1, 960, 720, sp.events.fb.alts[0]),
                photo("fb-dev-circles-algiers-2019", 2, 960, 720, sp.events.fb.alts[1]),
            ],
        },
        {
            slug: "gdg-io-extended-2017", event: "GDG I/O Extended", year: 2017, role: sp.roles.speaker, description: sp.events.gdg.description,
            photos: [
                photo("gdg-io-extended-2017", 1, 1600, 1200, sp.events.gdg.alts[0]),
                photo("gdg-io-extended-2017", 2, 1600, 1200, sp.events.gdg.alts[1]),
            ],
        },
    ];

    return (
        <div className={`min-h-screen bg-bg text-ink ${isArabic ? "font-arabic" : "font-sans"}`}>
            <ProfileStructuredData lang={lang} />
            <SiteHeader lang={lang} home />

            <main>
                <HeroSurface lang={lang}>
                    <div className="mx-auto grid max-w-[1120px] items-center gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr] md:gap-16 md:py-28">
                        <div className="motion-intro flex flex-col gap-6">
                            <SectionLabel index="00">{dict.home.hello}</SectionLabel>
                            <h1 className={`text-[clamp(44px,7vw,80px)] font-semibold leading-[1.05] text-balance ${isArabic ? "" : "tracking-[-0.035em]"}`}>
                                {dict.home.name}<span className="text-accent">.</span>
                            </h1>
                            <p className="max-w-[30ch] text-[clamp(20px,2.4vw,26px)] leading-snug text-muted text-pretty">{dict.home.role}</p>
                            <div className="flex flex-wrap gap-3">
                                <Button href="https://www.linkedin.com/in/mahfoudh-arous/" target="_blank" rel="noopener noreferrer" size="lg">
                                    <Linkedin className="h-[18px] w-[18px]" />
                                    <span>{dict.home.connect}</span>
                                </Button>
                                <Button href={`mailto:${CONTACT_EMAIL}`} variant="secondary" size="lg">
                                    <Mail className="h-[18px] w-[18px]" />
                                    <span>{dict.home.email}</span>
                                </Button>
                            </div>
                        </div>
                        <div className="motion-portrait justify-self-center w-full max-w-[380px] aspect-[4/5] overflow-hidden rounded-card border border-line bg-sunken">
                            <Image src="/me.webp" alt="Mahfoudh Arous" width={460} height={575} className="h-full w-full object-cover" priority />
                        </div>
                    </div>
                </HeroSurface>

                <section id="youtube" className="motion-reveal border-y border-line bg-sunken">
                    <div className="mx-auto grid max-w-[1120px] items-center gap-6 px-6 py-14 md:grid-cols-2 md:py-18">
                        <div className="flex flex-col gap-4">
                            <SectionLabel as="h2" index="01" tone="clay">YouTube</SectionLabel>
                            <p className="text-[clamp(22px,2.6vw,28px)] font-semibold leading-tight text-pretty">{dict.home.teach}</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                { code: "FR", label: dict.home.frChannel, href: YT_FR },
                                { code: "AR", label: dict.home.arChannel, href: YT_AR },
                                { code: "EN", label: dict.home.enChannel, href: YT_EN },
                            ].map((c) => (
                                <a key={c.code} href={c.href} target="_blank" rel="noopener noreferrer"
                                    className="motion-channel flex items-center gap-3.5 rounded-panel border border-line bg-surface px-5 py-4 text-ink transition-colors duration-150 hover:border-clay">
                                    <span className="grid h-10 w-10 place-items-center rounded-btn bg-clay-soft font-mono text-[13px] font-semibold text-clay">{c.code}</span>
                                    <span className="flex-1 font-medium">{c.label}</span>
                                    <ArrowUpRight className="h-4 w-4 text-clay rtl:-scale-x-100" />
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
                <section id="speaking" className="mx-auto flex max-w-[1120px] flex-col gap-6 px-6 py-16 md:py-22">
                    <SectionLabel as="h2" index="02">{sp.title}</SectionLabel>
                    <p className="max-w-[60ch] text-[clamp(18px,2vw,22px)] leading-snug text-muted text-pretty">
                        {/* `**word**` in the dictionary marks the emphasised parts. */}
                        {sp.intro.split(/\*\*(.+?)\*\*/).map((part: string, i: number) =>
                            i % 2 ? <strong key={i} className="font-semibold text-ink">{part}</strong> : part
                        )}
                    </p>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {talks.map(({ slug, ...talk }) => (
                            <TalkCard key={slug} {...talk} lightboxLabels={sp.lightbox} />
                        ))}
                    </div>
                </section>

                <section id="projects" className="motion-reveal mx-auto flex max-w-[1120px] flex-col gap-6 px-6 py-16 md:py-22">
                    <SectionLabel as="h2" index="03">{dict.home.projects}</SectionLabel>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard key={project.title} {...project} />
                        ))}
                    </div>
                </section>

                <section id="guestbook" className="border-t border-line bg-sunken">
                    <div className="mx-auto flex max-w-[1120px] flex-col items-start gap-5 px-6 py-14 md:flex-row md:items-center md:justify-between md:py-18">
                        <div className="flex flex-col gap-4">
                            <SectionLabel as="h2" index="04">{dict.guestbook.title}</SectionLabel>
                            <p className="max-w-[28ch] text-[clamp(22px,2.6vw,28px)] font-semibold leading-tight text-pretty">{dict.guestbook.prompt}</p>
                            <p className="text-muted">{dict.guestbook.intro}</p>
                        </div>
                        <Button href={localePath(lang, GUESTBOOK_PATH)} size="lg">
                            <MessageSquare className="h-[18px] w-[18px]" />
                            <span>{dict.guestbook.cta}</span>
                        </Button>
                    </div>
                </section>
            </main>

            <SiteFooter lang={lang} dict={dict} />
        </div>
    );
}
