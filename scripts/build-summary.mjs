import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const docsDir = path.join(rootDir, "docs");
const navDir = path.join(docsDir, "_nav");

const toTitle = (slug) =>
  slug
    .replace(/\.md$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const GROUPS = [
  { key: "operations", label: "Operations" },
  { key: "object", label: "Object Types" },
  { key: "input", label: "Input Types" },
  { key: "enum", label: "Enums" },
  { key: "scalar", label: "Scalars" },
  { key: "directive", label: "Directives" },
  { key: "other", label: "Other" },
];

const SECTION_LABELS = {
  local: "Local Schema",
  remote: "Remote Schema",
};

const ROOT_LABELS = {
  home: {
    label: "Home",
    icon: "_icons/home.svg",
  },
  local: {
    label: "Local Schema",
    icon: "_icons/local.svg",
  },
  remote: {
    label: "Remote Schema",
    icon: "_icons/remote.svg",
  },
};

const rootLabelWithIcon = (key, fallbackLabel) => {
  const root = ROOT_LABELS[key];
  if (!root) {
    return fallbackLabel;
  }

  return root.label;
};

const parseFrontmatter = (content) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/m.exec(content);
  if (!match) {
    return {};
  }

  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const keyValue = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!keyValue) {
      continue;
    }
    const key = keyValue[1];
    const value = keyValue[2].trim().replace(/^"|"$/g, "");
    meta[key] = value;
  }

  return meta;
};

const getSidebarTitle = async (folder, filename) => {
  const filePath = path.join(docsDir, folder, filename);

  try {
    const content = await readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(content);
    return frontmatter.title || frontmatter.id || toTitle(filename);
  } catch {
    return toTitle(filename);
  }
};

const getGraphQLSnippet = (content) => {
  const match = /```graphql\r?\n([\s\S]*?)\r?\n```/m.exec(content);
  return match?.[1]?.trim() ?? "";
};

const getPageGroupKey = (content) => {
  const snippet = getGraphQLSnippet(content);
  if (!snippet) {
    return "other";
  }

  const firstLine = snippet.split(/\r?\n/)[0].trim().toLowerCase();

  if (firstLine.startsWith("type ")) {
    return "object";
  }
  if (firstLine.startsWith("input ")) {
    return "input";
  }
  if (firstLine.startsWith("enum ")) {
    return "enum";
  }
  if (firstLine.startsWith("scalar ")) {
    return "scalar";
  }
  if (firstLine.startsWith("directive ")) {
    return "directive";
  }

  return "operations";
};

const navFileFor = (sectionKey, groupKey) => {
  return `_nav/${sectionKey}-${groupKey}.md`;
};

const sectionNavFileFor = (sectionKey) => {
  return `_nav/${sectionKey}-schema.md`;
};

const writeNavPages = async (sections) => {
  await mkdir(navDir, { recursive: true });

  const writes = [];
  for (const section of sections) {
    const sectionBody = [
      `# ${SECTION_LABELS[section.key]}`,
      "",
      "This page is auto-generated for sidebar grouping.",
      "",
      "Use the sidebar to expand categories and navigate type pages.",
      "",
    ].join("\n");

    writes.push(
      writeFile(path.join(docsDir, sectionNavFileFor(section.key)), sectionBody, "utf8"),
    );

    for (const group of GROUPS) {
      const pages = section.pages.filter((page) => page.groupKey === group.key);
      if (pages.length === 0) {
        continue;
      }

      const heading = `${SECTION_LABELS[section.key]} - ${group.label}`;
      const body = [
        `# ${heading}`,
        "",
        "This page is auto-generated for sidebar grouping.",
        "",
        "Use the sidebar to navigate to the detailed type pages.",
        "",
      ].join("\n");

      writes.push(
        writeFile(path.join(docsDir, navFileFor(section.key, group.key)), body, "utf8"),
      );
    }
  }

  await Promise.all(writes);
};

const getMarkdownPages = async (folder) => {
  const folderPath = path.join(docsDir, folder);

  let entries = [];
  try {
    entries = await readdir(folderPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .filter((entry) => entry.name.toLowerCase() !== "index.md");

  const pages = await Promise.all(
    files.map(async (entry) => {
      const filePath = path.join(docsDir, folder, entry.name);
      let content = "";
      try {
        content = await readFile(filePath, "utf8");
      } catch {
        content = "";
      }

      return {
        name: entry.name,
        title: await getSidebarTitle(folder, entry.name),
        href: `${folder}/${entry.name}`,
        groupKey: getPageGroupKey(content),
      };
    }),
  );

  return pages
    .sort((a, b) => a.title.localeCompare(b.title));
};

const localPages = await getMarkdownPages("graphql");
const remotePages = await getMarkdownPages("graphql-remote");

const sections = [
  { key: "local", label: "Local Schema", pages: localPages },
  { key: "remote", label: "Remote Schema", pages: remotePages },
];

await writeNavPages(sections);

const renderSchemaSection = (lines, section) => {
  const rootLabel = rootLabelWithIcon(section.key, section.label);
  lines.push(`* [${rootLabel}](${sectionNavFileFor(section.key)})`);

  if (section.pages.length === 0) {
    lines.push("  * [_No pages generated yet_](README.md)");
    return;
  }

  for (const group of GROUPS) {
    const pages = section.pages.filter((page) => page.groupKey === group.key);
    if (pages.length === 0) {
      continue;
    }

    lines.push(`  * [${group.label}](${navFileFor(section.key, group.key)})`);
    for (const page of pages) {
      lines.push(`    * [${page.title}](${page.href})`);
    }
  }
};

const lines = [
  "# Summary",
  "",
  `* [${rootLabelWithIcon("home", "Home")}](README.md)`,
];

for (const section of sections) {
  renderSchemaSection(lines, section);
}

lines.push("");

await writeFile(path.join(docsDir, "SUMMARY.md"), lines.join("\n"), "utf8");
console.log("Generated docs/SUMMARY.md");
