import { useCallback, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { translations, TranslationKey } from './translations';

export const useTranslation = () => {
  const language = useStore(state => state.appSettings.language);
  
  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations['es'][key] || key;
  }, [language]);

  return useMemo(() => ({ t, language }), [t, language]);
};
