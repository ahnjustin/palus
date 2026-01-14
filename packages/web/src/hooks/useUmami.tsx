import { useCallback } from "react";

const useUmami = () => {
  const track = useCallback(
    (eventName: string, eventData?: Record<string, any>) => {
      if (typeof window !== "undefined" && (window as any).umami) {
        (window as any).umami.track(eventName, eventData);
      }
    },
    []
  );

  return { track };
};

export default useUmami;
