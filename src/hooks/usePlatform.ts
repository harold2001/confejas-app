import { useEffect, useState } from 'react';
import { getPlatform } from '../utils/platform';

function debounce(func: (...args: unknown[]) => void, wait: number) {
  let timeout: number | null = null;
  return (...args: unknown[]) => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

const usePlatform = () => {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop' | 'mobile'>(getPlatform());

  useEffect(() => {
    const updatePlatform = () => {
      const newPlatform = getPlatform();
      if (newPlatform !== platform) {
        setPlatform(newPlatform);
      }
    };

    const debouncedUpdate = debounce(updatePlatform, 200);
    window.addEventListener('resize', debouncedUpdate);

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
    };
  }, [platform]);

  const isAndroid = () => platform === 'android';

  const isIOS = () => platform === 'ios';

  const isMobileNative = () => isAndroid() || isIOS();

  const isMobile = () => platform === 'mobile' || isAndroid() || isIOS();

  const isDesktop = () => platform === 'desktop';

  return { platform, setPlatform, isAndroid, isIOS, isMobileNative, isDesktop, isMobile } as const;
};

export default usePlatform;
