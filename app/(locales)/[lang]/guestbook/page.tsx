import GuestbookContent, { guestbookMetadata } from "../../../components/GuestbookContent";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return guestbookMetadata(lang);
}

export default async function LocaleGuestbookPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ before?: string | string[] }>;
}) {
    const [{ lang }, { before }] = await Promise.all([params, searchParams]);
    return <GuestbookContent lang={lang} before={before} />;
}
