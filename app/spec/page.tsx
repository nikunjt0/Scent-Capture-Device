"use client";

import Link from "next/link";
import { Fragment, useEffect, type CSSProperties } from "react";

const LABEL = "font-mono text-xs tracking-[0.3em] text-black/45";
const HEADING =
  "font-die-grotesk leading-[0.95] tracking-tight text-5xl md:text-7xl";
const BIG_HEADING =
  "font-die-grotesk leading-[0.92] tracking-tight text-6xl md:text-[7.5rem]";
const BODY = "text-base leading-relaxed text-black/70 md:text-lg";
const HAIRLINE = "border-t border-black/15";

function delay(ms: number): CSSProperties {
  return { transitionDelay: `${ms}ms` };
}

const STATS = [
  { label: "BOM", value: "$235—280", note: "CM4 build, all-in" },
  { label: "EXTERNAL", value: "101×71×31", note: "mm — credit-card footprint" },
  { label: "CYCLE", value: "5–10 s", note: "warm-up to profile-write" },
  { label: "FINGERPRINT", value: "80-dim", note: "8 sensors × 10 heater steps" },
  { label: "VENDOR CLOUD", value: "None", note: "all data on your infra" },
];

const ARCH = [
  {
    stage: "01",
    name: "Intake",
    part: "GORE PolyVent Snap-In",
    note: "ePTFE hydrophobic membrane. Blocks dust + droplets.",
  },
  {
    stage: "02",
    name: "Sensor Array",
    part: "BME690 8× shuttle board",
    note: "8 chips, gas + T/RH/P. Each runs a 10-step heater profile in parallel.",
  },
  {
    stage: "03",
    name: "Flow Verifier",
    part: "Sensirion SFM3019",
    note: "Confirms each capture sees the same volume of air.",
  },
  {
    stage: "04",
    name: "Pump",
    part: "KNF NMP 03",
    note: "Diaphragm pump · 0.33 L/min · 600 mbar vacuum.",
  },
  {
    stage: "05",
    name: "Exhaust",
    part: "Filtered vent",
    note: "Releases sampled air away from the intake.",
  },
];

const COMPONENTS = [
  {
    part: "Bosch BME690 8× shuttle board",
    role: "Gas sensor array",
    iface: "I²C",
    price: "$25",
  },
  {
    part: "TCA9548A I²C multiplexer",
    role: "Bus expander",
    iface: "I²C",
    price: "~$7",
  },
  {
    part: "KNF NMP 03 (KPDC-L)",
    role: "Suction pump",
    iface: "PWM motor",
    price: "~$200 sample",
  },
  {
    part: "Honeywell HAF / Sensirion SFM3019",
    role: "Flow verification",
    iface: "I²C",
    price: "~$60—80",
  },
  {
    part: "GORE PolyVent Snap-In",
    role: "Intake barrier",
    iface: "Mechanical",
    price: "~$3",
  },
  {
    part: "Raspberry Pi CM4 (4 GB / 32 GB eMMC / Wi-Fi)",
    role: "Host compute",
    iface: "Linux",
    price: "~$80",
  },
  {
    part: "Carrier PCB · motor driver · battery · USB-C · shell",
    role: "Support",
    iface: "—",
    price: "~$40",
  },
];

const SIZES = [
  { c: "BME690 8× shuttle board", l: "~40", w: "~30", h: "~1.5" },
  { c: "KNF NMP 03 pump", l: "24.2", w: "12.9", h: "21.4" },
  { c: "Flow sensor (HAF)", l: "36", w: "20", h: "10" },
  { c: "GORE PolyVent", l: "17 Ø", w: "17 Ø", h: "12.9" },
  { c: "Raspberry Pi CM4", l: "55", w: "40", h: "4.7" },
  { c: "Li-Po battery (2000 mAh)", l: "~50", w: "~35", h: "~8" },
  { c: "Minimum interior envelope", l: "~95", w: "~65", h: "~25", strong: true },
  { c: "External (3 mm shell, CM4 build)", l: "~101", w: "~71", h: "~31", strong: true },
  { c: "External (ESP32-S3 build)", l: "~70", w: "~50", h: "~22", strong: true },
];

const ELEC = [
  {
    connection: "BME690 ×8 → TCA9548A multiplexer",
    protocol: "I²C",
    pins: "8 channels, each chip @ 0x76",
    purpose: "Isolate sensors",
  },
  {
    connection: "TCA9548A → CM4",
    protocol: "I²C",
    pins: "I²C-1, mux @ 0x70",
    purpose: "Single bus to host",
  },
  {
    connection: "Flow sensor → CM4",
    protocol: "I²C",
    pins: "I²C-1, separate addr",
    purpose: "Flow verification",
  },
  {
    connection: "Pump motor → driver → CM4",
    protocol: "GPIO / PWM",
    pins: "GPIO18 (PWM0) + GPIO17 (EN)",
    purpose: "Speed + on/off",
  },
  {
    connection: "Capture button + LED",
    protocol: "GPIO",
    pins: "any free GPIOs",
    purpose: "User I/O",
  },
  {
    connection: "Battery → PMIC → CM4",
    protocol: "Power rail",
    pins: "5 V input on carrier",
    purpose: "System power",
  },
];

const CYCLE = [
  {
    step: "01",
    name: "Warm-up / purge",
    time: "~5 s",
    body: "Pump runs at low PWM. Sensors complete 2–3 heater cycles to stabilize. Baseline 80-dim vector is recorded.",
  },
  {
    step: "02",
    name: "Trigger",
    time: "instant",
    body: "User presses the capture button. LED turns amber.",
  },
  {
    step: "03",
    name: "Sample window",
    time: "~5 s",
    body: "Pump ramps to target flow rate. Each chip runs its 10-step heater profile twice. Host logs 8 × 10 = 80 gas-resistance values per cycle, plus T / RH / P from each chip and a continuous flow reading.",
  },
  {
    step: "04",
    name: "Recovery / purge",
    time: "~3 s",
    body: "Pump runs at higher flow to clear the chamber. LED turns green when the array stabilizes.",
  },
  {
    step: "05",
    name: "Profile write",
    time: "instant",
    body: "Host subtracts baseline, normalizes by T/RH/P and flow, computes the fingerprint vector, hashes it, writes to local storage, and queues for sync.",
  },
];

const PROFILE = `ScentProfile {
  capture_id        uuid                     // assigned at capture
  timestamp         iso8601_utc
  user_label        string                   // "grandma's kitchen"

  heater_profile    [°C × 10]                // e.g. 100,150,200,…,400
  raw_gas_matrix    [8 sensors × 10 steps × N cycles]   ohms
  baseline_matrix   [8 × 10 × N]             ohms      // captured during warm-up
  env_log           [t × T,RH,P]             // per chip, per second
  flow_log          [t × sccm]

  fingerprint       float32[80]              // sample − baseline, env-corrected
  fingerprint_hash  sha256                   // quantized; the library key
  voice_note        audio/wav (optional)     // journaled at capture
  device_meta       firmware, serial, calibration_date
}`;

const SETUP = [
  {
    step: "01",
    name: "Source",
    body: "Order the BME690 dev kit + 8× shuttle board (Mouser / Buyzero, ~$115). Pair with the carrier PCB, KNF NMP 03 pump, GORE PolyVent intake, and a 2000 mAh Li-Po battery.",
  },
  {
    step: "02",
    name: "Assemble",
    body: "Solder the shuttle board to the carrier; mount the pump, intake vent, and flow sensor along the airflow path; route the I²C bus through the multiplexer; wire the capture button and RGB LED to free GPIOs.",
  },
  {
    step: "03",
    name: "Flash firmware",
    body: "Boot Linux on the CM4 (or load BSEC2 onto an ESP32-S3 for the slim build). Configure the 10-step heater profile — 100, 150, 200, 250, 300, 320, 340, 360, 380, 400 °C — and load the capture daemon.",
  },
  {
    step: "04",
    name: "Calibrate",
    body: "Run the comparison protocol: 10 reference smells, 5 captures × 3 days, both sensors in parallel. Verify within-class similarity > 0.90, between-class < 0.85, discrimination margin > 0.15 on hard pairs.",
  },
  {
    step: "05",
    name: "Provision",
    body: "Burn calibration constants, firmware version, and shuttle-board serial into device meta. Pair the device to the user's local scent library (Wi-Fi or USB-C). Optional cloud mirror for off-site backup.",
  },
  {
    step: "06",
    name: "Trade-ready",
    body: "Expose the fingerprint hash + 80-dim vector over Bluetooth and AirDrop. Two devices reading the same scent should produce hashes within the discrimination margin.",
  },
];

export default function SpecPage() {
  useEffect(() => {
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
  }, []);

  return (
    <div className="bg-white text-black">
      {/* Top header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black/10 bg-white/80 px-6 py-4 backdrop-blur md:px-10">
        <Link
          href="/"
          className="font-die-grotesk text-sm tracking-tight text-black/55 transition-colors hover:text-black"
        >
          ← Scentia
        </Link>
        <span className="font-mono text-[10px] tracking-[0.4em] text-black/45">
          SPEC SHEET · EDITION B
        </span>
        <Link
          href="/#choose"
          className="font-die-grotesk text-sm tracking-tight text-black/55 transition-colors hover:text-black"
        >
          choose →
        </Link>
      </header>

      {/* 00 — Hero */}
      <section className="px-8 pb-24 pt-28 md:px-16 md:pb-32 md:pt-40">
        <div className="mx-auto max-w-6xl">
          <span className={`reveal ${LABEL}`}>00 / OVERVIEW</span>
          <h1 className={`reveal mt-8 ${BIG_HEADING}`} style={delay(120)}>
            Scent Capture
            <br />
            Device.
          </h1>
          <p
            className={`reveal mt-12 max-w-2xl ${BODY}`}
            style={delay(280)}
          >
            Same goal as the original smell.Board edition: capture a complex
            scent, hash it, file it. Built around a commercial-grade Bosch
            BME690 sensor stack — <strong>10× cheaper BOM</strong>, full data
            ownership, mature developer ecosystem. Airflow, compute, and
            enclosure are identical to the original spec; only the sensing
            element changes.
          </p>
        </div>
      </section>

      {/* 01 — At a glance: 5 stats */}
      <section className={`${HAIRLINE} px-8 py-24 md:px-16 md:py-32`}>
        <div className="mx-auto max-w-6xl">
          <span className={`reveal ${LABEL}`}>01 / AT A GLANCE</span>
          <div className="mt-12 grid gap-12 md:grid-cols-5">
            {STATS.map((s, i) => (
              <div key={s.label} className="reveal" style={delay(60 * i)}>
                <span className={LABEL}>{s.label}</span>
                <div className="mt-4 font-die-grotesk text-3xl leading-none tracking-tight md:text-4xl">
                  {s.value}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-black/60">
                  {s.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 — Architecture: airflow diagram */}
      <section className={`${HAIRLINE} px-8 py-24 md:px-16 md:py-32`}>
        <div className="mx-auto max-w-6xl">
          <span className={`reveal ${LABEL}`}>02 / ARCHITECTURE</span>
          <h2 className={`reveal mt-8 ${HEADING}`} style={delay(120)}>
            Pump-driven airflow.
            <br />
            Sealed pneumatic chamber.
          </h2>
          <p className={`reveal mt-10 max-w-2xl ${BODY}`} style={delay(240)}>
            Air is <em>pulled</em> (not blown) through a sealed chamber, across
            the sensor array, past a flow verifier, through the diaphragm pump,
            and out the exhaust. This topology is non-negotiable for
            reproducibility — every capture has to see the same volume of air at
            the same flow rate.
          </p>

          <div className="reveal mt-16 flex flex-col gap-3 md:flex-row md:items-stretch md:gap-0">
            {ARCH.map((b, i) => (
              <Fragment key={b.stage}>
                <div className="flex-1 border border-black/15 p-6 md:border-r-0 md:last:border-r">
                  <span className={LABEL}>{b.stage}</span>
                  <div className="mt-4 font-die-grotesk text-2xl leading-tight tracking-tight">
                    {b.name}
                  </div>
                  <div className="mt-2 font-mono text-xs text-black/60">
                    {b.part}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-black/65">
                    {b.note}
                  </p>
                </div>
                {i < ARCH.length - 1 && (
                  <div
                    aria-hidden
                    className="flex items-center justify-center px-2 text-2xl text-black/30 md:px-3"
                  >
                    →
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          <p className="reveal mt-10 max-w-2xl text-sm leading-relaxed text-black/55">
            <strong>How the BME690 generates 80 channels from 1 chip:</strong>{" "}
            each sensor has one physical gas element, but its hot plate steps
            through ten temperatures (e.g. 100 → 400 °C). Different volatile
            compounds react to each step differently, so each step is a
            distinct &ldquo;virtual&rdquo; channel. 8 chips × 10 steps = 80
            virtual channels.
          </p>
        </div>
      </section>

      {/* 03 — Components table */}
      <section className={`${HAIRLINE} px-8 py-24 md:px-16 md:py-32`}>
        <div className="mx-auto max-w-6xl">
          <span className={`reveal ${LABEL}`}>03 / COMPONENTS</span>
          <h2 className={`reveal mt-8 ${HEADING}`} style={delay(120)}>
            What&rsquo;s inside.
          </h2>
          <div className="reveal mt-16 grid grid-cols-[2.5fr_1.5fr_1fr_auto] gap-x-6 text-sm md:text-base">
            <div className={`border-y border-black/20 py-3 ${LABEL}`}>
              PART
            </div>
            <div className={`border-y border-black/20 py-3 ${LABEL}`}>
              ROLE
            </div>
            <div className={`border-y border-black/20 py-3 ${LABEL}`}>
              INTERFACE
            </div>
            <div
              className={`border-y border-black/20 py-3 text-right ${LABEL}`}
            >
              EST. PRICE
            </div>
            {COMPONENTS.map((c) => (
              <Fragment key={c.part}>
                <div className="border-b border-black/10 py-5 font-die-grotesk text-base md:text-lg">
                  {c.part}
                </div>
                <div className="border-b border-black/10 py-5 text-black/70">
                  {c.role}
                </div>
                <div className="border-b border-black/10 py-5 font-mono text-xs text-black/60 md:text-sm">
                  {c.iface}
                </div>
                <div className="border-b border-black/10 py-5 text-right font-mono text-sm">
                  {c.price}
                </div>
              </Fragment>
            ))}
          </div>
          <p
            className="reveal mt-12 max-w-2xl text-sm leading-relaxed text-black/55"
            style={delay(160)}
          >
            Bill of materials totals <strong>$235—280</strong> for the CM4
            prototype, <strong>$160—200</strong> for the alt ESP32-S3 build —
            65–75 % cheaper than the smell.Board edition&rsquo;s ~$830—920.
            Volume pricing pulls BME690 chips down to ~$3 at 10k units.
          </p>
        </div>
      </section>

      {/* 04 — Physical layout */}
      <section className={`${HAIRLINE} px-8 py-24 md:px-16 md:py-32`}>
        <div className="mx-auto max-w-6xl">
          <span className={`reveal ${LABEL}`}>04 / PHYSICAL LAYOUT</span>
          <h2 className={`reveal mt-8 ${HEADING}`} style={delay(120)}>
            Credit card,
            <br />
            matchbox thick.
          </h2>
          <p className={`reveal mt-10 max-w-2xl ${BODY}`} style={delay(240)}>
            The BME690 chips are tiny (3 × 3 × 0.93 mm each). The shuttle board
            that carries them is ~1.5 mm thick. Sensing takes far less volume
            than the smell.Board, so the device can be noticeably smaller —
            roughly 15 % smaller for the CM4 build, and genuinely pocket-sized
            for the ESP32-S3 build.
          </p>

          <div className="reveal mt-16 grid grid-cols-[2.5fr_repeat(3,1fr)] gap-x-6 text-sm md:text-base">
            <div className={`border-y border-black/20 py-3 ${LABEL}`}>
              COMPONENT
            </div>
            <div
              className={`border-y border-black/20 py-3 text-right ${LABEL}`}
            >
              L (mm)
            </div>
            <div
              className={`border-y border-black/20 py-3 text-right ${LABEL}`}
            >
              W (mm)
            </div>
            <div
              className={`border-y border-black/20 py-3 text-right ${LABEL}`}
            >
              H (mm)
            </div>
            {SIZES.map((s) => (
              <Fragment key={s.c}>
                <div
                  className={`border-b border-black/10 py-4 ${
                    s.strong
                      ? "font-die-grotesk text-base md:text-lg"
                      : "text-black/75"
                  }`}
                >
                  {s.c}
                </div>
                <div className="border-b border-black/10 py-4 text-right font-mono text-sm md:text-base">
                  {s.l}
                </div>
                <div className="border-b border-black/10 py-4 text-right font-mono text-sm md:text-base">
                  {s.w}
                </div>
                <div className="border-b border-black/10 py-4 text-right font-mono text-sm md:text-base">
                  {s.h}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — Electrical */}
      <section className={`${HAIRLINE} px-8 py-24 md:px-16 md:py-32`}>
        <div className="mx-auto max-w-6xl">
          <span className={`reveal ${LABEL}`}>05 / ELECTRICAL</span>
          <h2 className={`reveal mt-8 ${HEADING}`} style={delay(120)}>
            One I²C bus,
            <br />
            eight sensors.
          </h2>
          <p className={`reveal mt-10 max-w-2xl ${BODY}`} style={delay(240)}>
            Eight BME690 chips share a single I²C bus through a TCA9548A
            multiplexer (each chip only has two address options, and we need
            eight). The CM4 sees one clean bus; everything else fans out
            behind the mux. Environmental correction (T/RH/P) comes for free
            on every gas reading — no separate SHT45 needed.
          </p>

          <div className="reveal mt-16 grid grid-cols-[2.2fr_1fr_1.6fr_1.4fr] gap-x-6 text-sm md:text-base">
            <div className={`border-y border-black/20 py-3 ${LABEL}`}>
              CONNECTION
            </div>
            <div className={`border-y border-black/20 py-3 ${LABEL}`}>
              PROTOCOL
            </div>
            <div className={`border-y border-black/20 py-3 ${LABEL}`}>
              PINS / ADDRESS
            </div>
            <div className={`border-y border-black/20 py-3 ${LABEL}`}>
              PURPOSE
            </div>
            {ELEC.map((e) => (
              <Fragment key={e.connection}>
                <div className="border-b border-black/10 py-5 font-die-grotesk">
                  {e.connection}
                </div>
                <div className="border-b border-black/10 py-5 font-mono text-xs text-black/60 md:text-sm">
                  {e.protocol}
                </div>
                <div className="border-b border-black/10 py-5 font-mono text-xs text-black/65 md:text-sm">
                  {e.pins}
                </div>
                <div className="border-b border-black/10 py-5 text-black/70">
                  {e.purpose}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — Capture cycle */}
      <section className={`${HAIRLINE} px-8 py-24 md:px-16 md:py-32`}>
        <div className="mx-auto max-w-6xl">
          <span className={`reveal ${LABEL}`}>06 / CAPTURE CYCLE</span>
          <h2 className={`reveal mt-8 ${HEADING}`} style={delay(120)}>
            Press a button,
            <br />
            wait ten seconds.
          </h2>
          <div className="mt-16 grid gap-6 md:grid-cols-5">
            {CYCLE.map((c, i) => (
              <div
                key={c.step}
                className="reveal flex flex-col gap-4 border border-black/15 p-6"
                style={delay(80 * i)}
              >
                <div className="flex items-baseline justify-between">
                  <span className={LABEL}>{c.step}</span>
                  <span className="font-mono text-xs text-black/45">
                    {c.time}
                  </span>
                </div>
                <div className="font-die-grotesk text-xl leading-tight tracking-tight">
                  {c.name}
                </div>
                <p className="text-sm leading-relaxed text-black/65">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07 — Output (scent profile) */}
      <section className={`${HAIRLINE} px-8 py-24 md:px-16 md:py-32`}>
        <div className="mx-auto max-w-6xl">
          <span className={`reveal ${LABEL}`}>07 / OUTPUT</span>
          <h2 className={`reveal mt-8 ${HEADING}`} style={delay(120)}>
            Every capture is
            <br />
            one ScentProfile.
          </h2>
          <p className={`reveal mt-10 max-w-2xl ${BODY}`} style={delay(240)}>
            Stored locally, synced to your scent library. The fingerprint hash
            is the library key — same scent, same hash, two devices, every
            time. Reproduction (turning a fingerprint back into a vial) is a
            separate tech spec, handled by a reference aromachemical library or
            a GC-MS partnership.
          </p>
          <pre
            className="reveal mt-16 overflow-x-auto rounded-sm border border-black/15 bg-black/[0.025] p-6 font-mono text-xs leading-relaxed text-black/80 md:p-8 md:text-sm"
            style={delay(160)}
          >
            {PROFILE}
          </pre>
        </div>
      </section>

      {/* 08 — Setup process */}
      <section className={`${HAIRLINE} px-8 py-24 md:px-16 md:py-32`}>
        <div className="mx-auto max-w-6xl">
          <span className={`reveal ${LABEL}`}>08 / SETUP</span>
          <h2 className={`reveal mt-8 ${HEADING}`} style={delay(120)}>
            How we ship one.
          </h2>
          <p className={`reveal mt-10 max-w-2xl ${BODY}`} style={delay(240)}>
            Six steps from purchase order to a calibrated, trade-ready unit.
            Bench time is ~40 hours across three weeks — most of it is the
            comparison protocol against the reference smell set.
          </p>

          <div className="mt-16 grid gap-12 md:grid-cols-2">
            {SETUP.map((s, i) => (
              <div
                key={s.step}
                className="reveal border-l-2 border-black/20 pl-8"
                style={delay(80 * i)}
              >
                <span className={LABEL}>{s.step}</span>
                <h3 className="mt-3 font-die-grotesk text-2xl tracking-tight md:text-3xl">
                  {s.name}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-black/70 md:text-base">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09 — Cost summary */}
      <section className={`${HAIRLINE} px-8 py-24 md:px-16 md:py-32`}>
        <div className="mx-auto max-w-6xl">
          <span className={`reveal ${LABEL}`}>09 / COST</span>
          <h2 className={`reveal mt-8 ${BIG_HEADING}`} style={delay(120)}>
            $235—280
          </h2>
          <p className={`reveal mt-10 max-w-2xl ${BODY}`} style={delay(240)}>
            All-in for the CM4 prototype, including the carrier PCB, motor
            driver, battery, USB-C, and shell. The ESP32-S3 alt build comes in
            at <strong>$160—200</strong>. At 10 k units, BME690 chips drop to
            ~$3 each — the gap to the smell.Board widens further at scale.
          </p>
          <div
            className="reveal mt-16 grid gap-6 md:grid-cols-3"
            style={delay(160)}
          >
            <div className="border border-black/15 p-6">
              <span className={LABEL}>PROTOTYPE · CM4</span>
              <div className="mt-4 font-die-grotesk text-3xl tracking-tight">
                $235—280
              </div>
              <p className="mt-3 text-xs leading-relaxed text-black/60">
                full Linux, full ML headroom, Wi-Fi + BLE on-module.
              </p>
            </div>
            <div className="border border-black/15 p-6">
              <span className={LABEL}>ALT · ESP32-S3</span>
              <div className="mt-4 font-die-grotesk text-3xl tracking-tight">
                $160—200
              </div>
              <p className="mt-3 text-xs leading-relaxed text-black/60">
                pocket-sized, BSEC2 on-device, no Linux.
              </p>
            </div>
            <div className="border border-black/15 p-6">
              <span className={LABEL}>SMELL.BOARD ·   COMPARISON</span>
              <div className="mt-4 font-die-grotesk text-3xl tracking-tight text-black/55">
                $830—920
              </div>
              <p className="mt-3 text-xs leading-relaxed text-black/60">
                Edition A, retained for fragrance-grade discrimination.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className={`${HAIRLINE} px-8 py-20 md:px-16`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className={LABEL}>
            SCENTIA · SPEC SHEET · BME690 · TECHNICAL SPECIFICATIONS V/B
          </p>
          <div className="flex gap-6">
            <Link
              href="/"
              className="font-die-grotesk text-sm tracking-tight text-black/55 transition-colors hover:text-black"
            >
              ← Home
            </Link>
            <Link
              href="/#choose"
              className="font-die-grotesk text-sm tracking-tight text-black/55 transition-colors hover:text-black"
            >
              choose →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
