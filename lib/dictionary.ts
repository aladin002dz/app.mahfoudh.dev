import 'server-only';

const dictionaries = {
    en: () => import('../dictionaries/en').then((module) => module.en),
    fr: () => import('../dictionaries/fr').then((module) => module.fr),
    ar: () => import('../dictionaries/ar').then((module) => module.ar),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export const getDictionary = async (locale: string): Promise<Dictionary> => {
    if (locale in dictionaries) {
        return dictionaries[locale as keyof typeof dictionaries]();
    }
    return dictionaries.en();
};
