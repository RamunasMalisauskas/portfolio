import fs from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import type { Plugin } from "vite";

const MAX_BODY = 12 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const VISUALS = new Set(["shop", "signal", "mobile"]);

type StoredProject = {
  title: string;
  kind: string;
  description: string;
  stack: string[];
  liveUrl: string;
  sourceUrl: string;
  placeholder: boolean;
  visual: string;
  mobile?: boolean;
  images: string[];
};

function projectsFile(root: string) {
  return path.join(root, "src/data/projects.json");
}

function publicDir(root: string) {
  return path.join(root, "public");
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("Upload is larger than 8MB"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function isSafeImageName(name: string) {
  return (
    name === path.basename(name) &&
    !name.includes("..") &&
    IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase())
  );
}

function safeImageName(name: string) {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "");
  const ext = path.extname(base).toLowerCase();
  const stem = path.basename(base, path.extname(base));
  if (!stem || !IMAGE_EXTENSIONS.has(ext)) {
    throw new Error("Use a png, jpg, webp, or gif image");
  }
  return `${stem}${ext}`;
}

function uniqueName(directory: string, name: string) {
  if (!fs.existsSync(path.join(directory, name))) return name;
  const ext = path.extname(name);
  const stem = path.basename(name, ext);
  let index = 2;
  while (fs.existsSync(path.join(directory, `${stem}-${index}${ext}`))) {
    index += 1;
  }
  return `${stem}-${index}${ext}`;
}

function normalizeProject(value: unknown, directory: string): StoredProject {
  if (!value || typeof value !== "object") {
    throw new Error("Each work needs the project fields");
  }

  const project = value as Record<string, unknown>;
  const title = typeof project.title === "string" ? project.title.trim() : "";
  const kind = typeof project.kind === "string" ? project.kind.trim() : "";
  const description =
    typeof project.description === "string" ? project.description.trim() : "";
  const liveUrl =
    typeof project.liveUrl === "string" ? project.liveUrl.trim() : "";
  const sourceUrl =
    typeof project.sourceUrl === "string" ? project.sourceUrl.trim() : "";
  const visual = typeof project.visual === "string" ? project.visual : "";

  if (!title) throw new Error("A title is required");
  if (!Array.isArray(project.stack) || project.stack.some((item) => typeof item !== "string")) {
    throw new Error(`Stack for “${title}” must be a list of labels`);
  }
  if (typeof project.placeholder !== "boolean") {
    throw new Error(`Placeholder for “${title}” must be true or false`);
  }
  if (!VISUALS.has(visual)) {
    throw new Error(`Visual for “${title}” must be shop, signal, or mobile`);
  }
  if (project.mobile !== undefined && typeof project.mobile !== "boolean") {
    throw new Error(`Mobile for “${title}” must be true or false`);
  }
  if (
    !Array.isArray(project.images) ||
    project.images.some((item) => typeof item !== "string" || !isSafeImageName(item))
  ) {
    throw new Error(`Images for “${title}” must be image file names`);
  }

  const images = project.images as string[];
  const missing = images.find((name) => !fs.existsSync(path.join(directory, name)));
  if (missing) throw new Error(`Missing image file: ${missing}`);

  return {
    title,
    kind,
    description,
    stack: (project.stack as string[]).map((item) => item.trim()).filter(Boolean),
    liveUrl,
    sourceUrl,
    placeholder: project.placeholder,
    visual,
    mobile: project.mobile === true,
    images,
  };
}

function stringifyProjects(projects: StoredProject[]) {
  const entries = projects.map((project) => {
    const images =
      project.images.length === 0
        ? "[]"
        : `[\n${project.images
            .map((name) => `      ${JSON.stringify(name)}`)
            .join(",\n")}\n    ]`;
    const fields = [
      `    "title": ${JSON.stringify(project.title)}`,
      `    "kind": ${JSON.stringify(project.kind)}`,
      `    "description": ${JSON.stringify(project.description)}`,
      `    "stack": [${project.stack.map((item) => JSON.stringify(item)).join(", ")}]`,
      `    "liveUrl": ${JSON.stringify(project.liveUrl)}`,
      `    "sourceUrl": ${JSON.stringify(project.sourceUrl)}`,
      `    "placeholder": ${project.placeholder}`,
      `    "visual": ${JSON.stringify(project.visual)}`,
      `    "mobile": ${project.mobile === true}`,
      `    "images": ${images}`,
    ];
    return `  {\n${fields.join(",\n")}\n  }`;
  });
  return `[\n${entries.join(",\n")}\n]\n`;
}

function readProjects(root: string) {
  return fs.readFileSync(projectsFile(root), "utf8");
}

function writeProjects(root: string, projects: StoredProject[]) {
  const titles = new Set<string>();
  for (const project of projects) {
    if (titles.has(project.title)) {
      throw new Error(`“${project.title}” is already in the list`);
    }
    titles.add(project.title);
  }

  const file = projectsFile(root);
  const temp = `${file}.tmp`;
  fs.writeFileSync(temp, stringifyProjects(projects));
  fs.renameSync(temp, file);
}

async function handle(req: IncomingMessage, res: ServerResponse, root: string) {
  const pathname = req.url?.split("?")[0];

  if (pathname === "/api/projects" && req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(readProjects(root));
    return;
  }

  if (pathname === "/api/projects" && req.method === "PUT") {
    const parsed: unknown = JSON.parse(await readBody(req));
    if (!Array.isArray(parsed)) throw new Error("Works must be a list");
    const directory = publicDir(root);
    const projects = parsed.map((project) => normalizeProject(project, directory));
    writeProjects(root, projects);
    send(res, 200, projects);
    return;
  }

  if (pathname === "/api/uploads" && req.method === "POST") {
    const parsed: unknown = JSON.parse(await readBody(req));
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Upload needs a file name and data");
    }
    const upload = parsed as { name?: unknown; data?: unknown };
    if (typeof upload.name !== "string" || typeof upload.data !== "string") {
      throw new Error("Upload needs a file name and data");
    }

    const directory = publicDir(root);
    const name = uniqueName(directory, safeImageName(upload.name));
    fs.writeFileSync(path.join(directory, name), Buffer.from(upload.data, "base64"));
    send(res, 200, { name });
    return;
  }

  send(res, 405, { error: "Method not allowed" });
}

export function projectsApi(): Plugin {
  return {
    name: "projects-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname !== "/api/projects" && pathname !== "/api/uploads") {
          next();
          return;
        }

        void handle(req, res, server.config.root).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Request failed";
          if (!res.headersSent) send(res, 400, { error: message });
        });
      });
    },
  };
}
