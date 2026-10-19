import GuestbookContent, { guestbookMetadata } from "../../components/GuestbookContent";
import { DEFAULT_LOCALE } from "../../../lib/site";

export const generateMetadata = () => guestbookMetadata(DEFAULT_LOCALE);

export default async function GuestbookPage({ searchParams }: { searchParams: Promise<{ before?: string | string[] }> }) {
    const { before } = await searchParams;
    return <GuestbookContent lang={DEFAULT_LOCALE} before={before} />;
}
