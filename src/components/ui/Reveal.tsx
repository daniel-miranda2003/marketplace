"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import Fade from "@mui/material/Fade";

interface RevealProps {
  children: ReactNode;
  delay?: number;
}

const noopSubscribe = () => () => {};

export default function Reveal({ children, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref}>
      <Fade
        in={mounted && visible}
        timeout={600}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div>{children}</div>
      </Fade>
    </div>
  );
}
