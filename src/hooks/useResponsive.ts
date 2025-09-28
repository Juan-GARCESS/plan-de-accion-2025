import { useState, useEffect } from 'react';

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getResponsiveStyle = (mobileStyle: React.CSSProperties, tabletStyle?: React.CSSProperties, desktopStyle?: React.CSSProperties) => {
    if (isMobile) return mobileStyle;
    if (isTablet && tabletStyle) return tabletStyle;
    return desktopStyle || mobileStyle;
  };

  const getGridCols = (mobile: number, tablet?: number, desktop?: number) => {
    if (isMobile) return `repeat(${mobile}, 1fr)`;
    if (isTablet && tablet) return `repeat(${tablet}, 1fr)`;
    return `repeat(${desktop || mobile}, 1fr)`;
  };

  const getPadding = (mobile: string, tablet?: string, desktop?: string) => {
    if (isMobile) return mobile;
    if (isTablet && tablet) return tablet;
    return desktop || mobile;
  };

  const getFontSize = (mobile: string, tablet?: string, desktop?: string) => {
    if (isMobile) return mobile;
    if (isTablet && tablet) return tablet;
    return desktop || mobile;
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    getResponsiveStyle,
    getGridCols,
    getPadding,
    getFontSize
  };
}