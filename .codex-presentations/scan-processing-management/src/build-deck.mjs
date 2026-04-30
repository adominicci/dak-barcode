/** @jsxRuntime automatic */
/** @jsxImportSource @oai/artifact-tool/presentation-jsx */

import {
  Presentation,
  PresentationFile,
  row,
  column,
  grid,
  layers,
  panel,
  text,
  image,
  shape,
  rule,
  fill,
  hug,
  fixed,
  wrap,
  grow,
  fr,
  auto,
} from "@oai/artifact-tool";

const W = 1920;
const H = 1080;
const OUT = "/Users/andresdominicci/Projects/dak-barcode/.codex-presentations/scan-processing-management";
const assets = `${OUT}/scratch/assets`;
const previews = `${OUT}/scratch/previews`;
const pptxPath = `${OUT}/output/output.pptx`;

const { readFile, mkdir, writeFile } = await import("node:fs/promises");

async function dataUrl(path) {
  const bytes = await readFile(path);
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

const oldLocalPathImage = await dataUrl(`${assets}/old-local-path.png`);
const newWebPathImage = await dataUrl(`${assets}/new-web-path.png`);

const colors = {
  ink: "#0B1220",
  muted: "#475569",
  light: "#F8FAFC",
  line: "#CBD5E1",
  blue: "#2563EB",
  blueDark: "#1E3A8A",
  green: "#16803C",
  orange: "#EA580C",
  red: "#DC2626",
  amberLight: "#FFF7ED",
  blueLight: "#EFF6FF",
  greenLight: "#ECFDF5",
  slateLight: "#F1F5F9",
};

const titleStyle = { fontSize: 62, bold: true, color: colors.ink, fontFace: "Aptos Display" };
const bodyStyle = { fontSize: 30, color: colors.muted, fontFace: "Aptos" };
const smallStyle = { fontSize: 22, color: colors.muted, fontFace: "Aptos" };
const labelStyle = { fontSize: 24, bold: true, color: colors.ink, fontFace: "Aptos" };

const presentation = Presentation.create({
  slideSize: { width: W, height: H },
});

function addSlide(build, notes) {
  const slide = presentation.slides.add();
  build(slide);
  if (notes) slide.speakerNotes.setText(notes);
  return slide;
}

function root(children, opts = {}) {
  return column(
    {
      name: opts.name ?? "slide-root",
      width: fill,
      height: fill,
      padding: opts.padding ?? { x: 92, y: 70 },
      gap: opts.gap ?? 34,
      align: opts.align ?? "start",
      justify: opts.justify ?? "start",
    },
    children,
  );
}

function sectionTitle(value, subtitle) {
  return column({ name: "title-stack", width: fill, height: hug, gap: 14 }, [
    text(value, { name: "slide-title", width: fill, height: hug, style: titleStyle }),
    subtitle
      ? text(subtitle, {
          name: "slide-subtitle",
          width: wrap(1260),
          height: hug,
          style: { ...bodyStyle, fontSize: 29 },
        })
      : rule({ name: "title-rule", width: fixed(220), stroke: colors.blue, weight: 5 }),
  ]);
}

function metric(value, label, color) {
  return column({ name: `metric-${label}`, width: fill, height: hug, gap: 8 }, [
    text(value, {
      width: fill,
      height: hug,
      style: { fontSize: 78, bold: true, color, fontFace: "Aptos Display" },
    }),
    text(label, { width: fill, height: hug, style: { ...smallStyle, color: colors.ink } }),
  ]);
}

function step(title, detail, tone = colors.blue) {
  return panel(
    {
      name: `step-${title}`,
      width: fill,
      height: hug,
      padding: { x: 30, y: 24 },
      fill: "#FFFFFF",
      line: { color: colors.line, width: 2 },
      borderRadius: 12,
    },
    row({ width: fill, height: hug, gap: 20, align: "center" }, [
      shape({
        width: fixed(16),
        height: fixed(74),
        fill: tone,
        borderRadius: 8,
      }),
      column({ width: fill, height: hug, gap: 6 }, [
        text(title, { width: fill, height: hug, style: { ...labelStyle, fontSize: 23 } }),
        text(detail, { width: fill, height: hug, style: { ...smallStyle, fontSize: 19 } }),
      ]),
    ]),
  );
}

function decisionRow(option, benefit, tradeoff, tone) {
  return grid(
    {
      name: `decision-${option}`,
      width: fill,
      height: hug,
      columns: [fr(0.55), fr(1), fr(1)],
      columnGap: 24,
      padding: { x: 0, y: 14 },
      alignItems: "center",
    },
    [
      text(option, {
        width: fill,
        height: hug,
        style: { ...labelStyle, color: tone },
      }),
      text(benefit, { width: fill, height: hug, style: { ...smallStyle, fontSize: 20 } }),
      text(tradeoff, { width: fill, height: hug, style: { ...smallStyle, fontSize: 20 } }),
    ],
  );
}

addSlide(
  (slide) => {
    slide.compose(
      layers({ width: fill, height: fill }, [
        shape({ name: "bg", width: fill, height: fill, fill: colors.light }),
        root(
          [
            panel(
              {
                name: "cover-kicker",
                width: hug,
                height: hug,
                padding: { x: 22, y: 10 },
                fill: colors.blueLight,
                borderRadius: 999,
              },
              text("Barcode scan processing decision", {
                width: hug,
                height: hug,
                style: { ...smallStyle, bold: true, color: colors.blueDark },
              }),
            ),
            text("Why scans feel slower in the new web workflow", {
              name: "cover-title",
              width: wrap(1280),
              height: hug,
              style: { fontSize: 82, bold: true, color: colors.ink, fontFace: "Aptos Display" },
            }),
            text(
              "The current Loading flow protects backend consistency, but it creates a short busy window that can miss rapid back-to-back scans.",
              {
                name: "cover-subtitle",
                width: wrap(1120),
                height: hug,
                style: { ...bodyStyle, fontSize: 34 },
              },
            ),
            row({ width: fill, height: hug, gap: 70, align: "center", padding: { y: 36 } }, [
              metric("2-3 sec", "Typical full scan cycle", colors.orange),
              metric("1 at a time", "Current processing model", colors.blue),
              metric("50?", "Management queue decision", colors.green),
            ]),
            text("Goal: decide how much scan-ahead behavior production should support.", {
              width: fill,
              height: hug,
              style: { ...smallStyle, fontSize: 24, color: colors.ink },
            }),
          ],
          { justify: "center", gap: 32 },
        ),
      ]),
      { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
    );
  },
  "Open with the business point: this is not a scanner hardware problem. It is a workflow and architecture decision about how much scan-ahead behavior we want to support.",
);

addSlide(
  (slide) => {
    slide.compose(
      image({
        name: "old-local-path",
        dataUrl: oldLocalPathImage,
        width: fill,
        height: fill,
        fit: "contain",
        alt: "Old desktop app local network path diagram",
      }),
      { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
    );
  },
  "The old app feels instant because the scan stays inside the building. The desktop app talks to local SQL across the LAN and the result comes straight back.",
);

addSlide(
  (slide) => {
    slide.compose(
      image({
        name: "new-web-path",
        dataUrl: newWebPathImage,
        width: fill,
        height: fill,
        fit: "contain",
        alt: "New web app longer round trip diagram",
      }),
      { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
    );
  },
  "The new web workflow has more hops. The client sends the scan to FastAPI, FastAPI reaches back to the local SQL servers, and the response returns to the client.",
);

addSlide(
  (slide) => {
    slide.compose(
      root([
        sectionTitle(
          "What happens after one Loading scan",
          "The app waits for the full backend cycle before it is clearly ready for the next label.",
        ),
        grid(
          {
            name: "scan-cycle-grid",
            width: fill,
            height: fill,
            columns: [fr(1), fixed(80), fr(1), fixed(80), fr(1)],
            rows: [fr(1)],
            columnGap: 14,
            alignItems: "center",
          },
          [
            step("1. Scan accepted", "Scanner input submits one barcode into the Loading page.", colors.green),
            text("->", { width: fill, height: hug, style: { fontSize: 42, bold: true, color: colors.muted } }),
            step("2. Backend work", "App waits for the FastAPI scan response from the SQL-backed process.", colors.blue),
            text("->", { width: fill, height: hug, style: { fontSize: 42, bold: true, color: colors.muted } }),
            step("3. Data refresh", "Loading data refreshes, then the input is ready again.", colors.orange),
          ],
        ),
        panel(
          {
            name: "cycle-callout",
            width: fill,
            height: hug,
            padding: { x: 34, y: 22 },
            fill: colors.amberLight,
            borderRadius: 14,
            line: { color: "#FDBA74", width: 2 },
          },
          text("In real use, that full cycle could take around 2-3 seconds. During that window, the scanner input was effectively busy.", {
            width: fill,
            height: hug,
            style: { ...bodyStyle, fontSize: 30, color: colors.ink },
          }),
        ),
      ]),
      { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
    );
  },
  "This slide explains the real bottleneck. We were processing one scan at a time: accept scan, wait for backend response, refresh loading data, then accept the next scan.",
);

addSlide(
  (slide) => {
    slide.compose(
      root([
        sectionTitle(
          "Why operators experienced lag",
          "The issue was most visible when labels were scanned back-to-back quickly.",
        ),
        grid(
          {
            name: "impact-grid",
            width: fill,
            height: fill,
            columns: [fr(1), fr(1)],
            rows: [auto, auto, auto],
            columnGap: 38,
            rowGap: 26,
          },
          [
            step("Busy window", "While one scan was processing, another scan could arrive too early.", colors.orange),
            step("Missed label risk", "If a second label arrived during that window, the app could ignore or miss it.", colors.red),
            step("No busy signal", "There was no clear on-screen state showing the app was unable to accept the next scan.", colors.blue),
            step("No queue visibility", "Operators could not see which scans were waiting, processed, or failed.", colors.blue),
            step("Barcode reality", "If a scan is missed, operators cannot reliably know which barcode needs to be repeated.", colors.red),
            step("Old workflow perception", "The old app let operators keep scanning without noticing the same dead time.", colors.green),
          ],
        ),
      ]),
      { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
    );
  },
  "The operator experience matters: this felt like a scanner or app problem. The higher-risk case is fast batch scanning, because a missed barcode is hard to identify afterward.",
);

addSlide(
  (slide) => {
    slide.compose(
      root([
        sectionTitle(
          "What the queue change is meant to fix",
          "A queue does not make the backend instant. It protects scans entered while the app is busy.",
        ),
        grid(
          {
            name: "queue-grid",
            width: fill,
            height: fill,
            columns: [fr(1), fixed(80), fr(1), fixed(80), fr(1)],
            columnGap: 16,
            alignItems: "center",
          },
          [
            panel(
              { width: fill, height: hug, padding: { x: 32, y: 30 }, fill: colors.greenLight, borderRadius: 14 },
              column({ width: fill, height: hug, gap: 8 }, [
                text("Scan ahead", { width: fill, height: hug, style: { ...labelStyle, fontSize: 34 } }),
                text("Operator can scan while the prior label is still processing.", {
                  width: fill,
                  height: hug,
                  style: { ...smallStyle, fontSize: 22 },
                }),
              ]),
            ),
            text("->", { width: fill, height: hug, style: { fontSize: 42, bold: true, color: colors.muted } }),
            panel(
              { width: fill, height: hug, padding: { x: 32, y: 30 }, fill: colors.blueLight, borderRadius: 14 },
              column({ width: fill, height: hug, gap: 8 }, [
                text("Visible queue", { width: fill, height: hug, style: { ...labelStyle, fontSize: 34 } }),
                text("The app holds waiting scans and shows pending, processed, and failed states.", {
                  width: fill,
                  height: hug,
                  style: { ...smallStyle, fontSize: 22 },
                }),
              ]),
            ),
            text("->", { width: fill, height: hug, style: { fontSize: 42, bold: true, color: colors.muted } }),
            panel(
              { width: fill, height: hug, padding: { x: 32, y: 30 }, fill: colors.amberLight, borderRadius: 14 },
              column({ width: fill, height: hug, gap: 8 }, [
                text("One-by-one backend", { width: fill, height: hug, style: { ...labelStyle, fontSize: 34 } }),
                text("The backend still processes in order, reducing missed scans without changing core scan behavior.", {
                  width: fill,
                  height: hug,
                  style: { ...smallStyle, fontSize: 22 },
                }),
              ]),
            ),
          ],
        ),
        text("The first queue size was conservative at 5: enough for small bursts, not enough for fast larger batches.", {
          width: fill,
          height: hug,
          style: { ...bodyStyle, fontSize: 30, color: colors.ink },
        }),
      ]),
      { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
    );
  },
  "The key distinction: a queue is not a performance optimization by itself. It is a reliability and operator-flow improvement. It prevents scans from disappearing while the backend is busy.",
);

addSlide(
  (slide) => {
    slide.compose(
      root([
        sectionTitle(
          "Decision needed: how much scan-ahead should production allow?",
          "The queue size is a business risk choice, not only a technical setting.",
        ),
        column(
          { name: "decision-table", width: fill, height: hug, gap: 14 },
          [
            grid(
              {
                name: "decision-header",
                width: fill,
                height: hug,
                columns: [fr(0.55), fr(1), fr(1)],
                columnGap: 24,
              },
              [
                text("Option", { width: fill, height: hug, style: { ...labelStyle, color: colors.muted } }),
                text("What it helps", { width: fill, height: hug, style: { ...labelStyle, color: colors.muted } }),
                text("Tradeoff", { width: fill, height: hug, style: { ...labelStyle, color: colors.muted } }),
              ],
            ),
            rule({ width: fill, stroke: colors.line, weight: 2 }),
            decisionRow("5", "Small bursts; lowest behavior change from current production.", "Still exposes larger fast batches to missed-scan risk.", colors.orange),
            rule({ width: fill, stroke: colors.line, weight: 2 }),
            decisionRow("50", "Supports real scan-ahead behavior for production batch work.", "Requires clear visible queue states and operator guidance.", colors.green),
            rule({ width: fill, stroke: colors.line, weight: 2 }),
          ],
        ),
        panel(
          {
            name: "recommendation",
            width: fill,
            height: hug,
            padding: { x: 34, y: 24 },
            fill: colors.greenLight,
            borderRadius: 14,
            line: { color: "#86EFAC", width: 2 },
          },
          text("Recommended direction: approve a larger visible queue for Loading, with pending / processed / failed status visible on screen.", {
            width: fill,
            height: hug,
            style: { ...bodyStyle, fontSize: 31, color: colors.ink },
          }),
        ),
      ]),
      { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
    );
  },
  "Close with the decision. If management wants operators to scan like they did before, a larger visible queue is the practical direction. If they prefer minimal behavior change, keep 5 and accept that it only handles small bursts.",
);

const pptxBlob = await PresentationFile.exportPptx(presentation);
await pptxBlob.save(pptxPath);

await mkdir(previews, { recursive: true });
for (let i = 0; i < presentation.slides.count; i += 1) {
  const slide = presentation.slides.getItem(i);
  const png = await slide.export({ format: "png" });
  await writeFile(`${previews}/slide-${String(i + 1).padStart(2, "0")}.png`, Buffer.from(await png.arrayBuffer()));
}

console.log(JSON.stringify({ pptxPath, previews }, null, 2));
