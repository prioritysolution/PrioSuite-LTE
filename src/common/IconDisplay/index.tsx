"use client";

import React, { useEffect, useState } from "react";
import type { IconType } from "react-icons";

type IconModule = Record<string, IconType>;
type IconLoader = () => Promise<IconModule>;

const setLoaders: Record<string, IconLoader> = {
  fa: async () => (await import("react-icons/fa")) as unknown as IconModule,
  fa6: async () => (await import("react-icons/fa6")) as unknown as IconModule,
  md: async () => (await import("react-icons/md")) as unknown as IconModule,
  gi: async () => (await import("react-icons/gi")) as unknown as IconModule,
  io: async () => (await import("react-icons/io")) as unknown as IconModule,
  io5: async () => (await import("react-icons/io5")) as unknown as IconModule,
  ti: async () => (await import("react-icons/ti")) as unknown as IconModule,
  go: async () => (await import("react-icons/go")) as unknown as IconModule,
  si: async () => (await import("react-icons/si")) as unknown as IconModule,
  fi: async () => (await import("react-icons/fi")) as unknown as IconModule,
  ai: async () => (await import("react-icons/ai")) as unknown as IconModule,
  bs: async () => (await import("react-icons/bs")) as unknown as IconModule,
  bi: async () => (await import("react-icons/bi")) as unknown as IconModule,
  ri: async () => (await import("react-icons/ri")) as unknown as IconModule,
  cg: async () => (await import("react-icons/cg")) as unknown as IconModule,
  ci: async () => (await import("react-icons/ci")) as unknown as IconModule,
  im: async () => (await import("react-icons/im")) as unknown as IconModule,
  vsc: async () => (await import("react-icons/vsc")) as unknown as IconModule,
  hi: async () => (await import("react-icons/hi")) as unknown as IconModule,
  hi2: async () => (await import("react-icons/hi2")) as unknown as IconModule,
  tb: async () => (await import("react-icons/tb")) as unknown as IconModule,
  gr: async () => (await import("react-icons/gr")) as unknown as IconModule,
};

/** Prefer the set that matches the icon name prefix. */
const resolveSetKeys = (iconName: string, iconSet: string): string[] => {
  const name = String(iconName || "");
  const lower = name.toLowerCase();
  const set = String(iconSet || "").toLowerCase();

  if (lower.startsWith("fa6")) return ["fa6", "fa"];
  if (lower.startsWith("fa")) return ["fa", "fa6"];
  if (lower.startsWith("hi2")) return ["hi2", "hi"];
  if (lower.startsWith("hi")) return ["hi", "hi2"];
  if (lower.startsWith("io5")) return ["io5", "io"];
  if (lower.startsWith("io")) return ["io", "io5"];
  if (lower.startsWith("md")) return ["md"];
  if (lower.startsWith("gi")) return ["gi"];
  if (lower.startsWith("ti")) return ["ti"];
  if (lower.startsWith("go")) return ["go"];
  if (lower.startsWith("si")) return ["si"];
  if (lower.startsWith("fi")) return ["fi"];
  if (lower.startsWith("ai")) return ["ai"];
  if (lower.startsWith("bs")) return ["bs"];
  if (lower.startsWith("bi")) return ["bi"];
  if (lower.startsWith("ri")) return ["ri"];
  if (lower.startsWith("cg")) return ["cg"];
  if (lower.startsWith("ci")) return ["ci"];
  if (lower.startsWith("im")) return ["im"];
  if (lower.startsWith("vsc")) return ["vsc"];
  if (lower.startsWith("tb")) return ["tb"];
  if (lower.startsWith("gr")) return ["gr"];

  if (set === "fa") return ["fa", "fa6"];
  if (set === "io") return ["io", "io5"];
  if (set === "hi") return ["hi", "hi2"];
  return set ? [set] : [];
};

const moduleCache = new Map<string, Promise<IconModule>>();
const iconCache = new Map<string, IconType | null>();

const loadIconSet = (setKey: string) => {
  if (!moduleCache.has(setKey)) {
    const loader = setLoaders[setKey];
    moduleCache.set(
      setKey,
      loader
        ? loader().catch(() => ({} as IconModule))
        : Promise.resolve({} as IconModule),
    );
  }
  return moduleCache.get(setKey)!;
};

const resolveIcon = async (
  iconName: string,
  iconSet: string,
): Promise<IconType | null> => {
  const cacheKey = `${iconSet}::${iconName}`;
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey) ?? null;

  for (const setKey of resolveSetKeys(iconName, iconSet)) {
    const mod = await loadIconSet(setKey);
    const Icon = mod[iconName];
    if (Icon) {
      iconCache.set(cacheKey, Icon);
      return Icon;
    }
  }

  iconCache.set(cacheKey, null);
  return null;
};

interface IconDisplayProps {
  iconName: string;
  iconSet: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

const IconDisplay: React.FC<IconDisplayProps> = ({
  iconName,
  iconSet,
  ...rest
}) => {
  const [Icon, setIcon] = useState<IconType | null>(() => {
    const cacheKey = `${iconSet}::${iconName}`;
    return iconCache.get(cacheKey) ?? null;
  });

  useEffect(() => {
    if (!iconName) {
      setIcon(null);
      return;
    }

    let cancelled = false;
    resolveIcon(iconName, iconSet).then((resolved) => {
      if (!cancelled) setIcon(() => resolved);
    });

    return () => {
      cancelled = true;
    };
  }, [iconName, iconSet]);

  if (!Icon) {
    return <span {...rest} aria-hidden="true" />;
  }

  return (
    <span {...rest}>
      <Icon />
    </span>
  );
};

export default IconDisplay;
