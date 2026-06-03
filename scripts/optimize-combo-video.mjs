import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { basename, extname, resolve } from "node:path";

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

function runFfmpeg(args) {
  const result = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runCommand(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function hasCommand(command) {
  const result = spawnSync("which", [command], {
    encoding: "utf8",
  });
  return result.status === 0;
}

function hasFfmpegEncoder(name) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-encoders"], {
    encoding: "utf8",
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  return output.includes(name);
}

function parseTimeToSeconds(value, label) {
  if (!value) return null;
  if (/^\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }

  const parts = value.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) {
    console.error(`${label} must be seconds or HH:MM:SS.`);
    process.exit(1);
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  console.error(`${label} must be seconds or HH:MM:SS.`);
  process.exit(1);
}

function detectSceneStart({ source, trimArgs, threshold, minTime, offset }) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      ...trimArgs,
      "-i",
      source,
      "-vf",
      `select='gt(scene,${threshold})',metadata=print:file=-`,
      "-an",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" }
  );

  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  const matches = [...output.matchAll(/pts_time:(\d+(?:\.\d+)?)/g)]
    .map((match) => Number(match[1]))
    .filter((time) => Number.isFinite(time) && time >= minTime);

  const firstSceneTime = matches[0];
  if (firstSceneTime === undefined) {
    console.error(
      `Could not detect an SA scene change. Try lowering --sa-detect-threshold or set --sa-start manually.`
    );
    process.exit(1);
  }

  const detectedStart = Number((firstSceneTime + offset).toFixed(3));
  console.log(
    `Detected SA scene change at ${firstSceneTime.toFixed(3)}s; using --sa-start ${detectedStart.toFixed(3)}s.`
  );
  return detectedStart;
}

function buildVideoFilter({ speed, saStart, saEnd, saSpeed }) {
  const baseFilter = "scale=-2:720,fps=30";
  if (saStart === null && saEnd === null && saSpeed === null) {
    return {
      args: ["-vf", `${baseFilter}${speed === 1 ? "" : `,setpts=PTS/${speed}`}`],
      map: [],
    };
  }

  if (saStart === null || saEnd === null || saSpeed === null) {
    console.error("--sa-start, --sa-end, and --sa-speed must be used together.");
    process.exit(1);
  }
  if (speed !== 1) {
    console.error("--speed cannot be combined with --sa-start/--sa-end/--sa-speed. Use --sa-speed for the SA section.");
    process.exit(1);
  }
  if (saStart < 0 || saEnd <= saStart) {
    console.error("--sa-end must be greater than --sa-start.");
    process.exit(1);
  }
  if (!Number.isFinite(saSpeed) || saSpeed <= 0) {
    console.error("--sa-speed must be a positive number.");
    process.exit(1);
  }

  const segments = [];
  const filters = [`[0:v]${baseFilter},split=3[pre_src][sa_src][post_src]`];
  if (saStart > 0) {
    filters.push(`[pre_src]trim=start=0:end=${saStart},setpts=PTS-STARTPTS[pre]`);
    segments.push("[pre]");
  }
  filters.push(`[sa_src]trim=start=${saStart}:end=${saEnd},setpts=(PTS-STARTPTS)/${saSpeed}[sa]`);
  segments.push("[sa]");
  filters.push(`[post_src]trim=start=${saEnd},setpts=PTS-STARTPTS[post]`);
  segments.push("[post]");
  filters.push(`${segments.join("")}concat=n=${segments.length}:v=1:a=0[v]`);

  return {
    args: ["-filter_complex", filters.join(";")],
    map: ["-map", "[v]"],
  };
}

const args = readArgs(process.argv.slice(2));
const input = args.get("input");

if (!input) {
  console.error("Usage: pnpm video:optimize -- --input ./raw/combo_17.mp4 --id combo_17 [--ss 00:00:01] [--to 00:00:08] [--speed 1.5] [--sa-start 12|auto --sa-end 17.5 --sa-speed 4] [--sa-offset 0.5] [--thumb-format auto|webp|png]");
  process.exit(1);
}

const source = resolve(input);
const id = args.get("id") || basename(input, extname(input));
const speed = Number(args.get("speed") || "1");
const start = args.get("ss");
const end = args.get("to");
const saStartInput = args.get("sa-start");
const saEnd = parseTimeToSeconds(args.get("sa-end"), "--sa-end");
const saSpeed = args.has("sa-speed") ? Number(args.get("sa-speed")) : null;
const saOffset = Number(args.get("sa-offset") || "0.5");
const saDetectThreshold = Number(args.get("sa-detect-threshold") || "0.35");
const saDetectAfter = Number(args.get("sa-detect-after") || "2");
const thumbFormatRequest = args.get("thumb-format") || "auto";

if (!Number.isFinite(speed) || speed <= 0) {
  console.error("--speed must be a positive number.");
  process.exit(1);
}
if (!Number.isFinite(saOffset) || saOffset < 0) {
  console.error("--sa-offset must be zero or a positive number.");
  process.exit(1);
}
if (!Number.isFinite(saDetectThreshold) || saDetectThreshold <= 0 || saDetectThreshold >= 1) {
  console.error("--sa-detect-threshold must be greater than 0 and less than 1.");
  process.exit(1);
}
if (!Number.isFinite(saDetectAfter) || saDetectAfter < 0) {
  console.error("--sa-detect-after must be zero or a positive number.");
  process.exit(1);
}

const videoDir = resolve("client/public/videos");
const thumbDir = resolve("client/public/thumbs");
mkdirSync(videoDir, { recursive: true });
mkdirSync(thumbDir, { recursive: true });

const hasWebpEncoder = hasFfmpegEncoder("libwebp");
const hasCwebp = hasCommand("cwebp");
const thumbFormat =
  thumbFormatRequest === "auto"
    ? hasWebpEncoder || hasCwebp
      ? "webp"
      : "png"
    : thumbFormatRequest;

if (thumbFormat !== "webp" && thumbFormat !== "png") {
  console.error("--thumb-format must be auto, webp, or png.");
  process.exit(1);
}
if (thumbFormat === "webp" && !hasWebpEncoder && !hasCwebp) {
  console.error("WebP output needs ffmpeg with libwebp or the cwebp command. Install it with: brew install webp");
  process.exit(1);
}

const trimArgs = [];
if (start) trimArgs.push("-ss", start);
if (end) trimArgs.push("-to", end);

const saStart =
  saStartInput === "auto"
    ? detectSceneStart({
        source,
        trimArgs,
        threshold: saDetectThreshold,
        minTime: saDetectAfter,
        offset: saOffset,
      })
    : parseTimeToSeconds(saStartInput, "--sa-start");

const videoOut = resolve(videoDir, `${id}.webm`);
const thumbOut = resolve(thumbDir, `${id}.${thumbFormat}`);
const tempThumbOut = resolve(thumbDir, `${id}.thumb-source.png`);
const videoFilter = buildVideoFilter({ speed, saStart, saEnd, saSpeed });

runFfmpeg([
  "-y",
  ...trimArgs,
  "-i",
  source,
  "-an",
  ...videoFilter.args,
  ...videoFilter.map,
  "-c:v",
  "libvpx-vp9",
  "-b:v",
  "0",
  "-crf",
  "32",
  "-row-mt",
  "1",
  videoOut,
]);

runFfmpeg([
  "-y",
  ...trimArgs,
  "-i",
  source,
  "-frames:v",
  "1",
  "-update",
  "1",
  "-vf",
  "scale=-2:720",
  ...(thumbFormat === "webp" && hasWebpEncoder ? ["-c:v", "libwebp", "-quality", "80"] : []),
  thumbFormat === "webp" && !hasWebpEncoder ? tempThumbOut : thumbOut,
]);

if (thumbFormat === "webp" && !hasWebpEncoder) {
  runCommand("cwebp", ["-q", "80", tempThumbOut, "-o", thumbOut]);
  rmSync(tempThumbOut, { force: true });
}

console.log(`Created ${videoOut}`);
console.log(`Created ${thumbOut}`);
