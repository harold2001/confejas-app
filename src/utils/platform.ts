import { isPlatform } from '@ionic/react';

export const getPlatform = () => {
  const isNative = isPlatform('capacitor');

  if (isNative) {
    return isPlatform('ios') ? 'ios' : 'android';
  }

  const isDesktop = isPlatform('desktop');

  const isSmallScreen = window.innerWidth < 800;

  if (isSmallScreen) {
    return 'mobile';
  }

  if (isDesktop) {
    return 'desktop';
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);

  if (isMobile) {
    return 'mobile';
  }

  return 'desktop';
};
