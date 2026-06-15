import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

function readArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args.set(key, "true");
      continue;
    }
    args.set(key, next);
    i += 1;
  }
  return args;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: options.encoding ?? "utf8",
    stdio: options.stdio ?? "pipe",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
    throw new Error(`${command} failed${output ? `:\n${output}` : ""}`);
  }
  return result;
}

function hasCommand(command) {
  return spawnSync("which", [command], { encoding: "utf8" }).status === 0;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function secondsLabel(value) {
  return `${value.toFixed(2)}s`;
}

function bytesLabel(value) {
  if (!Number.isFinite(value)) return null;
  const units = ["B", "KB", "MB", "GB"];
  let amount = value;
  let unitIndex = 0;
  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }
  return `${amount.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function probeVideo(input) {
  const result = run("ffprobe", [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    input,
  ]);
  const data = JSON.parse(result.stdout);
  const videoStream = data.streams?.find((stream) => stream.codec_type === "video") || {};
  return {
    duration: toNumber(data.format?.duration, 0),
    size: toNumber(data.format?.size, 0),
    width: toNumber(videoStream.width, 0),
    height: toNumber(videoStream.height, 0),
    frameRate: videoStream.r_frame_rate || null,
  };
}

function getNextComboNumber(character) {
  const characterFile = resolve(`client/src/lib/characters/${character}.ts`);
  if (!existsSync(characterFile)) return null;

  const text = readFileSync(characterFile, "utf8");
  const numbers = [...text.matchAll(/number:\s*(\d+)/g)].map((match) => Number(match[1]));
  if (numbers.length === 0) return null;
  return Math.max(...numbers) + 1;
}

function uniqueTimes(times, duration) {
  const seen = new Set();
  return times
    .map((time) => Math.max(0, Math.min(duration > 0 ? duration - 0.15 : time, time)))
    .map((time) => Number(time.toFixed(2)))
    .filter((time) => {
      const key = time.toFixed(2);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function extractFrames({ input, outputDir, duration }) {
  const times = uniqueTimes(
    [1, duration * 0.45, duration * 0.72, Math.max(duration - 1.5, 0)],
    duration
  );
  return times.map((time, index) => {
    const label = index === 0 ? "start" : index === times.length - 1 ? "final" : `mid_${index}`;
    const output = join(outputDir, `frame_${String(index + 1).padStart(2, "0")}_${label}.png`);
    run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-ss",
      String(time),
      "-i",
      input,
      "-frames:v",
      "1",
      "-vf",
      "scale=1280:-2",
      output,
    ]);
    return { time, label, file: output };
  });
}

function buildSnippet({ number, id, characterName }) {
  return `  {\n    id: "combo_${number}",\n    number: ${number},\n    title: "要確認",\n    startup: "要確認",\n    notation: "要確認",\n    damage: 0,\n    knockdown: "要確認",\n    position: "どこでも",\n    difficulty: "中",\n    stock: "0",\n    description: "要確認",\n    videoAsset: comboVideoAsset("${id}", "${characterName} #${String(number).padStart(2, "0")} 要確認"),\n  },`;
}

const args = readArgs(process.argv.slice(2));
const inputArg = args.get("input");
const character = args.get("character") || "ingrid";
const characterName = args.get("character-name") || (character === "ingrid" ? "イングリッド" : character);
const explicitNumber = args.get("number") ? Number(args.get("number")) : null;
const outputRoot = resolve(args.get("out") || "combo-drafts");

if (!inputArg) {
  console.error("Usage: pnpm combo:draft -- --input ./raw.mp4 --character ingrid [--number 47] [--id ingrid_47]");
  process.exit(1);
}

if (!hasCommand("ffmpeg") || !hasCommand("ffprobe")) {
  console.error("ffmpeg and ffprobe are required. Install with: brew install ffmpeg");
  process.exit(1);
}

const input = resolve(inputArg);
if (!existsSync(input)) {
  console.error(`Input video not found: ${input}`);
  process.exit(1);
}

const nextNumber = getNextComboNumber(character);
const number = explicitNumber || nextNumber || 1;
if (!Number.isFinite(number) || number <= 0) {
  console.error("--number must be a positive number.");
  process.exit(1);
}

const id = args.get("id") || `${character}_${String(number).padStart(2, "0")}`;
const safeInputName = basename(input, extname(input)).replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 48);
const draftDir = join(outputRoot, `${id}_${safeInputName}`);
mkdirSync(draftDir, { recursive: true });

const probe = probeVideo(input);
const frames = extractFrames({ input, outputDir: draftDir, duration: probe.duration });
const hasTesseract = hasCommand("tesseract");

const draft = {
  status: "draft",
  character,
  suggestedNumber: number,
  suggestedAssetId: id,
  sourceVideo: input,
  video: {
    durationSeconds: Number(probe.duration.toFixed(3)),
    sizeBytes: probe.size,
    sizeLabel: bytesLabel(probe.size),
    width: probe.width,
    height: probe.height,
    frameRate: probe.frameRate,
  },
  extractedFrames: frames.map((frame) => ({
    label: frame.label,
    timeSeconds: frame.time,
    timeLabel: secondsLabel(frame.time),
    file: frame.file,
  })),
  autoRead: {
    damage: null,
    knockdown: null,
    notation: null,
    note: hasTesseract
      ? "OCR is available, but automatic reading is not enabled yet. Use the frames for confirmation."
      : "OCR tool tesseract is not installed. Please confirm damage, knockdown, and notation from the extracted frames.",
  },
  comboTemplate: {
    id: `combo_${number}`,
    number,
    title: "要確認",
    startup: "要確認",
    notation: "要確認",
    damage: 0,
    knockdown: "要確認",
    position: "どこでも",
    difficulty: "中",
    stock: "0",
    description: "要確認",
    videoAsset: `comboVideoAsset(\"${id}\", \"${characterName} #${String(number).padStart(2, "0")} 要確認\")`,
  },
  nextSteps: [
    `Open ${frames[frames.length - 1]?.file || "the final frame"} and confirm combo damage.`,
    "Confirm position, purpose/startup, knockdown advantage, stock, and description.",
    `Run video optimization when ready: pnpm video:optimize -- --input \"${input}\" --id ${id}`,
    `Paste the TypeScript snippet into client/src/lib/characters/${character}.ts.`,
  ],
};

const jsonPath = join(draftDir, "combo-draft.json");
const snippetPath = join(draftDir, "combo-snippet.ts.txt");
writeFileSync(jsonPath, `${JSON.stringify(draft, null, 2)}\n`);
writeFileSync(snippetPath, `${buildSnippet({ number, id, characterName })}\n`);

console.log(`Draft created: ${jsonPath}`);
console.log(`Snippet created: ${snippetPath}`);
console.log(`Suggested combo: ${characterName} #${String(number).padStart(2, "0")} / asset ${id}`);
console.log("Frames:");
for (const frame of frames) {
  console.log(`- ${frame.label} (${secondsLabel(frame.time)}): ${frame.file}`);
}
if (!hasTesseract) {
  console.log("OCR is not installed, so damage/notation are left as confirmation fields.");
}
