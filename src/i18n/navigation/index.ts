import defaultTranslations from './default.json';
import cobrifyTranslations from './tenants/cobrify.json';
import demoTranslations from './tenants/demo.json';
import candaresTranslations from './tenants/candares.json';
import hubinnovacionTranslations from './tenants/hubinnovacion.json';

type NavigationTranslations = typeof defaultTranslations;
export type NavigationTranslationKey = keyof NavigationTranslations;

type NavigationTranslationsOverride = Partial<Record<NavigationTranslationKey, string>>;

const tenantNavigationTranslations: Record<string, NavigationTranslationsOverride> = {
  cobrify: cobrifyTranslations,
  demo: demoTranslations,
  hubinnovacion: hubinnovacionTranslations,
  candares: candaresTranslations,
};

export const getNavigationTranslations = (tenantId?: string): NavigationTranslations => {
  const tenantTranslations = tenantId ? tenantNavigationTranslations[tenantId] : undefined;

  return {
    ...defaultTranslations,
    ...tenantTranslations,
  };
};

export const createNavigationTranslator = (tenantId?: string) => {
  const translations = getNavigationTranslations(tenantId);
  console.log({tenantId, translations});
  return (key: NavigationTranslationKey): string => {
    return translations[key] ?? defaultTranslations[key] ?? key;
  };
};
