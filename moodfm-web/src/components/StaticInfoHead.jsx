import { useEffect } from "react";
import { useStaticInfo } from "../context/StaticInfoContext";

/**
 * Updates document head from static info (MoodFM channel only):
 * - Favicon and apple-touch-icon from API
 * - Document title and meta description when available
 */
const StaticInfoHead = () => {
  const { staticInfo, loading } = useStaticInfo();

  useEffect(() => {
    if (loading || !staticInfo) return;

    const faviconUrl = staticInfo.favIcon;
    if (faviconUrl) {
      let linkIcon = document.querySelector('link[rel="icon"]');
      let linkApple = document.querySelector('link[rel="apple-touch-icon"]');
      if (!linkIcon) {
        linkIcon = document.createElement("link");
        linkIcon.rel = "icon";
        document.head.appendChild(linkIcon);
      }
      if (!linkApple) {
        linkApple = document.createElement("link");
        linkApple.rel = "apple-touch-icon";
        document.head.appendChild(linkApple);
      }
      linkIcon.href = faviconUrl;
      linkApple.href = faviconUrl;
    }

    if (staticInfo.metaDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = staticInfo.metaDescription;
    }

    if (staticInfo.channelName) {
      document.title = staticInfo.channelName;
    }
  }, [staticInfo, loading]);

  return null;
};

export default StaticInfoHead;
