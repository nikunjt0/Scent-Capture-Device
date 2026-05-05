"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import GlbViewer from "../_components/GlbViewer";
import StlViewer from "../_components/StlViewer";
import WaveCrystallization from "../_components/WaveCrystallization";

// File names ship with spaces and a Unicode en-dash; encodeURI handles them.
const CHARS = [
  "/scent-characters/Amber Vittoria's imperfect digital characters sum up what it means to be human 1.png",
  "/scent-characters/TJ Park – SAVEE.jpeg",
  "/scent-characters/_ (1).jpeg",
  "/scent-characters/_.jpeg",
].map(encodeURI);

const FOOTER_IMG = encodeURI("/ChatGPT Image May 5, 2026, 05_36_59 PM.png");

const NUMBER_LABEL = "font-mono text-xs tracking-[0.3em] text-black/40";
const HEADING =
  "font-die-grotesk leading-[0.95] tracking-tight text-5xl md:text-7xl";
const BIG_HEADING =
  "font-die-grotesk leading-[0.92] tracking-tight text-6xl md:text-[8.5rem]";
const BODY = "text-base leading-relaxed text-black/70 md:text-lg";

function rest(deg: number, delayMs = 0): CSSProperties {
  return {
    "--rest-rotate": `${deg}deg`,
    transitionDelay: `${delayMs}ms`,
  } as CSSProperties;
}

function delay(delayMs: number): CSSProperties {
  return { transitionDelay: `${delayMs}ms` };
}

// Inverted (white-on-image) Scentia logo, lifted from the industrial footer
// so the personal footer matches the same visual language. Wrapped in a Link
// so it doubles as a way back to the splash.
function ScentiaFooterLogo() {
  return (
    <Link
      href="/#choose"
      aria-label="Back to choose"
      className="absolute bottom-6 right-8 transition-opacity hover:opacity-80"
    >
      <svg
        className="w-36"
        aria-label="Scentia logo"
        viewBox="0 0 501.72 117.46"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <text
            transform="translate(68.75 93.56)"
            fill="#ffffff"
            fontFamily="'Avenir Next', 'Segoe UI', sans-serif"
            fontSize="108.16"
            fontWeight="600"
            letterSpacing="-0.03em"
          >
            <tspan x="0" y="0">
              S
            </tspan>
            <tspan dx="-4.5">CENTIA</tspan>
          </text>
          <rect fill="#ffffff" y="12.39" width="62.5" height="81.17" />
          <polygon
            fill="#000000"
            points="31.25 87.31 43.75 62.31 56.25 87.31 31.25 87.31"
          />
        </g>
      </svg>
    </Link>
  );
}

// Mobile fallback — re-uses the wave-crystallization SVG with progress pinned
// at 0, which is the "calm motion" state (base amplitude, full horizontal
// drift, no banding). A short message tells visitors to switch to desktop.
function MobileGate() {
  const progressRef = useRef(0);
  return (
    <div className="fixed inset-0 overflow-hidden bg-white">
      <WaveCrystallization progressRef={progressRef} />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <span className="font-mono text-[10px] tracking-[0.4em] text-black/55">
          SCENTIA · PERSONAL
        </span>
        <h1 className="mt-6 font-die-grotesk text-4xl leading-[0.95] tracking-tight">
          Best viewed
          <br />
          on a bigger
          <br />
          screen.
        </h1>
        <p className="mt-8 max-w-xs text-sm leading-relaxed text-black/65">
          The personal experience plays back on desktop. Open this on a
          computer to spin through the catalogue, meet the characters, and
          watch the device come together.
        </p>
        <Link
          href="/#choose"
          className="mt-10 font-die-grotesk text-sm tracking-tight text-black/60 transition-colors hover:text-black"
        >
          ← Back
        </Link>
      </div>
    </div>
  );
}

export default function PersonalPage() {
  const [shell, setShell] = useState<"loading" | "mobile" | "desktop">(
    "loading",
  );
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () =>
      setShell(
        window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Drive the hero swipe-up off scrollY. Only attach when the desktop tree is
  // actually mounted — otherwise the stage element doesn't exist.
  useEffect(() => {
    if (shell !== "desktop") return;
    function update() {
      const stage = stageRef.current;
      if (!stage) return;
      const winH = window.innerHeight;
      const start = winH * 0.18;
      const end = winH * 0.95;
      const t = Math.max(
        0,
        Math.min(1, (window.scrollY - start) / (end - start)),
      );
      const eased = t * t * (3 - 2 * t);
      stage.style.transform = `translate3d(0, ${(-eased * 110).toFixed(2)}%, 0) scale(${(1 - eased * 0.18).toFixed(3)})`;
      stage.style.opacity = `${(1 - eased).toFixed(3)}`;
      stage.style.pointerEvents = eased >= 0.99 ? "none" : "";
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [shell]);

  // Reveal blocks on scroll-into-view.
  useEffect(() => {
    if (shell !== "desktop") return;
    const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [shell]);

  if (shell === "loading") {
    // Render a blank white frame during the brief client-mount measurement.
    // Avoids flashing the desktop tree on phones before we know the size.
    return <div className="min-h-screen bg-white" />;
  }

  if (shell === "mobile") {
    return <MobileGate />;
  }

  return (
    <div className="relative bg-white text-black">
      {/* Hero stage — fixed, pointer-events-none so the content below can
          receive scroll/clicks even while the canvases are visible. */}
      <div
        ref={stageRef}
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          transformOrigin: "50% 32%",
          willChange: "transform, opacity",
        }}
      >
        <StlViewer
          stlPath="/personal.stl"
          scale={8}
          initialRotation={[-Math.PI / 2, 0, 0]}
        />
        <GlbViewer
          glbPath="/liam_smell_device.glb"
          instances={[
            {
              position: [0, 1.6, 0],
              scale: 16,
              initialRotation: [0.3, 0, 0],
              colorway: "original",
            },
            {
              position: [-3, 0.4, 0],
              scale: 16,
              initialRotation: [0.4, 0.8, 0.2],
              rotationSpeed: [0.12, 0.4, 0.25],
              breathePhase: 1.2,
              colorway: "purple-gold",
            },
            {
              position: [3, -0.4, 0],
              scale: 16,
              initialRotation: [-0.2, -0.6, 0.1],
              rotationSpeed: [0.25, 0.2, 0.4],
              breathePhase: 2.4,
              colorway: "blue-silver",
            },
          ]}
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-start px-12 pt-6 pb-12">
          <Link
            href="/#choose"
            className="pointer-events-auto absolute left-6 top-6 font-die-grotesk text-sm tracking-tight text-black/50 transition-colors hover:text-black"
          >
            ← Back
          </Link>
          <h1 className="mt-6 font-die-grotesk text-lg tracking-tight">
            Personal
          </h1>
          <div className="pointer-events-none absolute bottom-10 left-0 right-0 flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.4em] text-black/35">
              SCROLL
            </span>
            <span
              aria-hidden
              className="h-8 w-px bg-black/30"
              style={{ animation: "scrollHint 1.8s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>

      {/* Spacer reserves a viewport so content begins below the hero. */}
      <div aria-hidden className="h-screen" />

      {/* Editorial section — sits above the hero stage at z-20. */}
      <main className="relative z-20 bg-white">
        {/* 01 — Capture (trigger button) */}
        <section className="border-t border-black/10 px-8 py-32 md:px-16 md:py-40">
          <div className="mx-auto flex max-w-6xl flex-col gap-20 md:flex-row md:items-end">
            <div className="flex-1">
              <span className={`reveal ${NUMBER_LABEL}`}>01 / CAPTURE</span>
              <h2 className={`reveal mt-8 ${HEADING}`} style={delay(120)}>
                Grandma&rsquo;s
                <br />
                kitchen,
                <br />
                last Tuesday.
              </h2>
            </div>
            <div className="flex flex-1 flex-col items-end gap-10">
              <img
                src={CHARS[0]}
                alt=""
                className="reveal w-64 rounded-sm object-cover shadow-2xl md:w-80"
                style={rest(-3.5, 200)}
              />
              <p className={`reveal max-w-sm ${BODY}`} style={delay(360)}>
                The pot of sauce that&rsquo;s been on the stove since you got
                there — browned butter, onions, bay leaf, the way the air feels
                different in her apartment than anywhere else. Hold the device,
                press the trigger button: the LED turns amber, the pump pulls
                that exact air through a sealed chamber for five seconds, and
                eighty dimensions of Tuesday afternoon get hashed and filed.
              </p>
            </div>
          </div>
        </section>

        {/* 02 — Place */}
        <section className="border-t border-black/10 px-8 py-32 md:px-16 md:py-40">
          <div className="mx-auto flex max-w-6xl flex-col gap-20 md:flex-row-reverse md:items-start">
            <div className="flex-1">
              <span className={`reveal ${NUMBER_LABEL}`}>02 / PLACE</span>
              <h2 className={`reveal mt-8 ${HEADING}`} style={delay(120)}>
                After it rains,
                <br />
                the alley
                <br />
                behind your
                <br />
                building.
              </h2>
              <p
                className={`reveal mt-12 max-w-md ${BODY}`}
                style={delay(280)}
              >
                Petrichor. Wet brick. The metallic edge where street water meets
                drain water. The tree on the corner that smells different when
                it&rsquo;s soaked. Capture it before it dries — every one of
                those notes is a heater step on the sensor&rsquo;s hot plate,
                ten temperatures from 200 to 400 °C, each one a virtual sensor
                channel.
              </p>
            </div>
            <div className="flex flex-1 items-center justify-start">
              <img
                src={CHARS[1]}
                alt=""
                className="reveal w-72 rounded-sm object-cover shadow-2xl md:w-96"
                style={rest(2.5, 200)}
              />
            </div>
          </div>
        </section>

        {/* 03 — Discover */}
        <section className="relative overflow-hidden border-t border-black/10 py-32 md:py-40">
          <div className="mx-auto max-w-7xl px-8 md:px-16">
            <span className={`reveal ${NUMBER_LABEL}`}>03 / DISCOVER</span>
            <h2
              className={`reveal mt-8 max-w-5xl ${BIG_HEADING}`}
              style={delay(120)}
            >
              A flower
              <br />
              you can&rsquo;t
              <br />
              name.
            </h2>
          </div>
          <div className="mx-auto mt-16 flex max-w-6xl flex-col items-end gap-12 px-8 md:flex-row md:items-end md:justify-between md:px-16">
            <p className={`reveal max-w-md ${BODY}`} style={delay(220)}>
              You don&rsquo;t know what it is. You don&rsquo;t have to. The
              80-dimensional fingerprint doesn&rsquo;t care about Latin names —
              it&rsquo;s the chemistry that&rsquo;s the key. Tag it whatever
              you want, <em>yellow alley flower, may</em>, and it&rsquo;s filed
              under the hash of its own shape.
            </p>
            <img
              src={CHARS[2]}
              alt=""
              className="reveal w-56 rounded-sm object-cover shadow-2xl md:w-72"
              style={rest(-2, 380)}
            />
          </div>
        </section>

        {/* 04 — Browse: scroll wheel through catalogue */}
        <section className="border-t border-black/10 px-8 py-32 md:px-16 md:py-40">
          <div className="mx-auto max-w-6xl">
            <span className={`reveal ${NUMBER_LABEL}`}>04 / BROWSE</span>
            <div className="mt-8 flex flex-col-reverse gap-16 md:flex-row md:items-center md:gap-20">
              <div className="flex-1">
                <h2 className={`reveal ${HEADING}`} style={delay(120)}>
                  Spin the wheel.
                  <br />
                  Flip through
                  <br />
                  your catalogue.
                </h2>
                <p
                  className={`reveal mt-10 max-w-xl text-base leading-relaxed text-black/70 md:text-lg`}
                  style={delay(280)}
                >
                  The scroll wheel is how you move through your collection —
                  every capture you&rsquo;ve ever taken sits on the device,
                  ordered by capture date or by hash neighbourhood. The e-ink
                  screen reads more like a page than a display: paper-like,
                  always on, no glare. It plays back the metadata for whatever
                  you&rsquo;ve landed on — <em>when</em> you took it,{" "}
                  <em>where</em>, what you called it, the eighty-number
                  signature it&rsquo;s filed under. Spin slow to read. Spin
                  fast to fly through three years of your life in air.
                </p>
              </div>
              <div
                className="reveal relative aspect-square w-full max-w-xl flex-shrink-0 md:w-[36rem]"
                style={delay(360)}
              >
                <GlbViewer
                  glbPath="/liam_smell_device.glb"
                  instances={[
                    {
                      position: [0, 0, 0],
                      scale: 22,
                      initialRotation: [Math.PI / 2, (Math.PI / 180) * 25, 0],
                      rotationSpeed: [0, 0, 0],
                      breatheAmplitude: 0,
                      colorway: "original",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 05 — Journal (speech) */}
        <section className="relative border-t border-black/10 px-8 py-32 md:px-16 md:py-40">
          <div className="mx-auto flex max-w-6xl flex-col gap-20 md:flex-row md:items-center">
            <div className="flex-1">
              <span className={`reveal ${NUMBER_LABEL}`}>05 / JOURNAL</span>
              <h2 className={`reveal mt-8 ${HEADING}`} style={delay(120)}>
                Talk to it
                <br />
                while it&rsquo;s
                <br />
                still warm.
              </h2>
              <p
                className={`reveal mt-12 max-w-md ${BODY}`}
                style={delay(280)}
              >
                After the capture, the device is listening. Hold the trigger,
                speak. The chamber smelled like the apartment her mother kept
                until 2009. The flower is the one near the bus stop, you
                don&rsquo;t know what it is. Whatever you said gets stored
                alongside the fingerprint — every scent in your library is also
                a voice memo, a journal entry, a moment in your own words.
              </p>
            </div>
            <div className="flex flex-1 justify-center">
              <img
                src={CHARS[3]}
                alt=""
                className="reveal w-72 rounded-sm object-cover shadow-2xl md:w-96"
                style={rest(3, 220)}
              />
            </div>
          </div>
        </section>

        {/* 06 — Trade */}
        <section className="border-t border-black/10 px-8 py-32 md:px-16 md:py-40">
          <div className="mx-auto max-w-6xl">
            <span className={`reveal ${NUMBER_LABEL}`}>06 / TRADE</span>
            <h2 className={`reveal mt-8 ${BIG_HEADING}`} style={delay(120)}>
              A scent is
              <br />
              a few
              <br />
              hundred bytes.
            </h2>
            <div className="mt-16 grid gap-12 md:grid-cols-2">
              <p className={`reveal max-w-md ${BODY}`} style={delay(220)}>
                The fingerprint is eighty numbers and a hash. Bluetooth, AirDrop,
                pasted into a message — it doesn&rsquo;t matter how it travels.
                The other person&rsquo;s device adds it to their library under
                the same key. You can&rsquo;t hand someone a smell. You can hand
                them the way back to it.
              </p>
              <p
                className={`reveal max-w-md font-mono text-xs leading-relaxed text-black/55 md:text-sm`}
                style={delay(360)}
              >
                fingerprint_hash · 80-dim normalized
                <br />
                env_log · T / RH / P at capture
                <br />
                user_label · grandma&rsquo;s kitchen
                <br />
                voice_note · 11s, 47kb
                <br />
                <span className="text-black/30">
                  └ filed under sha256 a93f1c…&nbsp;·&nbsp;trade-ready
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* 07 — Collect */}
        <section className="border-t border-black/10 px-8 py-32 md:px-16 md:py-40">
          <div className="mx-auto max-w-6xl">
            <span className={`reveal ${NUMBER_LABEL}`}>07 / COLLECT</span>
            <h2 className={`reveal mt-8 ${BIG_HEADING}`} style={delay(120)}>
              Every fingerprint
              <br />
              gets a face.
            </h2>
            <p className={`reveal mt-12 max-w-xl ${BODY}`} style={delay(260)}>
              The device generates a character from each scent&rsquo;s
              eighty-dimensional shape — same input, same face, every time.
              Some are ugly. Some are beautiful. They&rsquo;re the ones you
              trade, the ones you keep, the ones you frame on the wall when
              somebody asks what your collection looks like.
            </p>
            <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
              {CHARS.map((src, i) => {
                const tilt = (i % 2 === 0 ? -1 : 1) * (2 + i * 0.7);
                const labels = [
                  "BUTTER-12 · Lila",
                  "PETRICHOR-04 · Marcell",
                  "ALLEY-FLOWER-77 · Iris",
                  "HER-VOICE-01 · Ronan",
                ];
                return (
                  <figure key={src} className="flex flex-col gap-4">
                    <img
                      src={src}
                      alt=""
                      className="reveal aspect-square w-full rounded-sm object-cover shadow-2xl"
                      style={rest(tilt, 100 * i)}
                    />
                    <figcaption
                      className={`reveal font-mono text-[10px] tracking-[0.2em] text-black/45`}
                      style={delay(150 + 100 * i)}
                    >
                      {labels[i]}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer — full-width image. As the user scrolls in, the prior content
            naturally scrolls up past the viewport while the image takes over,
            mirroring the industrial page's footer behavior. The Scentia logo
            sits bottom-right and links back to the splash. */}
        <footer className="relative z-30 w-full">
          <img
            src={FOOTER_IMG}
            alt=""
            className="block w-full object-cover"
          />
          <ScentiaFooterLogo />
        </footer>
      </main>
    </div>
  );
}
