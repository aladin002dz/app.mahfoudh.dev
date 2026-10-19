import Link from "next/link";
import VisitCounter from "./VisitCounter";
import { Mail } from "lucide-react";
import { Github, Linkedin, Facebook, Twitter, Bluesky, Youtube } from "./Icons";
import type { Dictionary } from "../../lib/dictionary";
import { CONTACT_EMAIL, GUESTBOOK_PATH, YT_AR, YT_EN, YT_FR, localePath } from "../../lib/site";

const socials = [
    { label: "GitHub", href: "https://github.com/aladin002dz", Icon: Github },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mahfoudh-arous/", Icon: Linkedin },
    { label: "YouTube FR", href: YT_FR, Icon: Youtube },
    { label: "YouTube AR", href: YT_AR, Icon: Youtube },
    { label: "YouTube EN", href: YT_EN, Icon: Youtube },
    { label: "Facebook", href: "https://www.facebook.com/mahfoudh.arous", Icon: Facebook },
    { label: "X", href: "https://x.com/mahfoudh_arous", Icon: Twitter },
    { label: "Bluesky", href: "https://bsky.app/profile/mahfoudharous.bsky.social", Icon: Bluesky },
];

const linkClass = "inline-flex items-center gap-2 font-sans text-sm font-medium leading-none text-muted transition-colors duration-150 hover:text-accent";

export default function SiteFooter({ lang, dict }: { lang: string; dict: Dictionary }) {
    const guestbook = localePath(lang, GUESTBOOK_PATH);
    return (
        <footer className="mx-auto flex max-w-[1120px] flex-col gap-5 px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
                <nav dir="ltr" className="flex flex-wrap gap-x-6 gap-y-3">
                    {socials.map(({ label, href, Icon }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={linkClass}>
                            <Icon className="h-[18px] w-[18px] shrink-0" />
                            {label}
                        </a>
                    ))}
                    <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email" className={linkClass}>
                        <Mail className="h-[18px] w-[18px] shrink-0" />
                        Email
                    </a>
                </nav>
                <p className="flex gap-1.5 font-mono text-xs font-medium leading-[1.2] text-subtle">
                    <bdi dir="ltr">© {new Date().getFullYear()}</bdi>
                    <span>{dict.home.footer}</span>
                </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-3">
                <Link href={guestbook} className={linkClass}>{dict.guestbook.nav}</Link>
                <Link href={`${guestbook}#privacy`} className={linkClass}>{dict.guestbook.privacyLink}</Link>
            </nav>
            <VisitCounter lang={lang} label={dict.home.visits} since={dict.home.visitsSince} />
        </footer>
    );
}
