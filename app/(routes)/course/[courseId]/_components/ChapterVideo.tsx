// CourseComposition.tsx

import React, { useEffect, useMemo, useRef } from "react";
import {
  AbsoluteFill,
  Audio,
  useVideoConfig,
  useCurrentFrame,
  Sequence,
} from "remotion";

/* ------------------------- Types ------------------------- */

type CaptionChunk = {
  timestamp: [number, number];
};

type Slide = {
  slideId: string;
  html: string;
  audioFileUrl: string;
  revealData?: {
    ids: string[];
    chunks: CaptionChunk[];
  };
};

/* ------------------- Reveal runtime ---------------------- */

const REVEAL_RUNTIME_SCRIPT = `
<script>
(function () {
  function reset() {
    document.querySelectorAll(".reveal").forEach(el => {
      el.classList.remove("is-on");
    });
  }

  function reveal(id) {
    var el = document.querySelector('[data-reveal="' + id + '"]');
    if (el) el.classList.add("is-on");
  }

  window.addEventListener("message", function (e) {
    var msg = e.data;
    if (!msg) return;
    if (msg.type === "RESET") reset();
    if (msg.type === "REVEAL") reveal(msg.id);
  });
})();
</script>
`;

const injectRevealRuntime = (html: string) => {
  if (html.includes("</body>")) {
    return html.replace("</body>", `${REVEAL_RUNTIME_SCRIPT}</body>`);
  }
  return html + REVEAL_RUNTIME_SCRIPT;
};

/* -------- Slide Frame with Reveal Control -------- */

const SlideFrameWithReveal = ({ slide }: { slide: Slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = React.useState(false);

  const revealPlan = useMemo(() => {
    const ids = slide.revealData?.ids ?? [];
    const chunks = slide.revealData?.chunks ?? [];

    return ids.map((id, i) => ({
      id,
      at: chunks[i]?.timestamp?.[0] ?? 0,
    }));
  }, [slide.revealData]);

  // On load → reset once
  const handleLoad = () => {
    setReady(true);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "RESET" },
      "*"
    );
  };

  // Sync reveals based on time
  useEffect(() => {
    if (!ready) return;

    const win = iframeRef.current?.contentWindow;
    if (!win) return;

    win.postMessage({ type: "RESET" }, "*");

    for (const step of revealPlan) {
      if (time >= step.at) {
        win.postMessage({ type: "REVEAL", id: step.id }, "*");
      }
    }
  }, [time, ready, revealPlan]);

  return (
    <AbsoluteFill>
      <iframe
        ref={iframeRef}
        srcDoc={injectRevealRuntime(slide.html)}
        onLoad={handleLoad}
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: 1280,
          height: 720,
          border: "none",
        }}
      />
      <Audio src={slide.audioFileUrl} />
    </AbsoluteFill>
  );
};

/* ---------------- Course Composition ---------------- */

type Props = {
  slides: Slide[];
  durationsBySlideId: Record<string, number>;
};

export const CourseComposition = ({
  slides,
  durationsBySlideId,
}: Props) => {
  const { fps } = useVideoConfig();

  const GAP_SECONDS = 1;
  const GAP_FRAMES = Math.round(GAP_SECONDS * fps);

  const timeline = useMemo(() => {
    let from = 0;

    return slides.map((slide) => {
      const dur =
        durationsBySlideId[slide.slideId] ??
        Math.ceil(6 * fps);

      const item = { slide, from, dur };

      from += dur + GAP_FRAMES;
      return item;
    });
  }, [slides, durationsBySlideId, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timeline.map(({ slide, from, dur }) => (
        <Sequence
          key={slide.slideId}
          from={from}
          durationInFrames={dur}
        >
          <SlideFrameWithReveal slide={slide} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};