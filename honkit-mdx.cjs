const formatMDXBadge = ({ text, classname }) => {
  const label = String(text).trim();
  const tone = String(classname || "default").toLowerCase();

  const themeByTone = {
    deprecated: {
      bg: "#fff3f2",
      border: "#fecaca",
      color: "#9f1239",
    },
    required: {
      bg: "#eef9ff",
      border: "#bfdbfe",
      color: "#1e3a8a",
    },
    default: {
      bg: "#f6f7f9",
      border: "#d1d5db",
      color: "#374151",
    },
  };

  const theme = themeByTone[tone] || themeByTone.default;

  return `<span style="display:inline-block;padding:0.12rem 0.5rem;margin-right:0.35rem;border:1px solid ${theme.border};border-radius:999px;background:${theme.bg};color:${theme.color};font-size:1.15rem;font-weight:600;line-height:1.2;vertical-align:middle;">${label}</span>`;
};

const formatMDXAdmonition = ({ text, title, type }) => {
  const prefix = type === "warning" ? "WARNING" : "INFO";
  return `> **${prefix} - ${title}**\n>\n> ${text}`;
};

const formatMDXBullet = (text = "") => ` • ${text}`;

const formatMDXDetails = ({ dataOpen, dataClose = "" }) => {
  return `\n<details>\n<summary>${dataOpen}</summary>\n\r${dataClose}\n</details>\n`;
};

const formatMDXFrontmatter = (props, formatted = []) => {
  if (!props || Object.keys(props).length === 0) {
    return "";
  }

  const entries = new Map(
    Object.entries(props).map(([key, value]) => [key, String(value)]),
  );

  for (const line of formatted) {
    const match = /^\s*([^:#\n]+)\s*:\s*(.*)\s*$/.exec(line);
    if (!match) {
      continue;
    }
    const key = match[1].trim();
    const value = match[2].trim();
    entries.set(key, value);
  }

  const lines = Array.from(entries.entries()).map(([key, value]) =>
    `${key}: ${value}`,
  );

  const title = (entries.get("title") || "").replace(/\r?\n/g, " ").trim();
  const heading = title ? `\n\n# ${title}` : "";

  return `---\n${lines.join("\n")}\n---${heading}`;
};

const formatMDXLink = ({ text, url }) => {
  const href = String(url || "").trim();

  if (!href) {
    return { text, url: href };
  }

  // Keep external/special links unchanged.
  if (/^(https?:|mailto:|tel:)/i.test(href) || href.startsWith("#")) {
    return { text, url: href };
  }

  const match = /^([^?#]*)([?#].*)?$/.exec(href);
  const pathname = (match && match[1]) || href;
  const suffix = (match && match[2]) || "";

  if (
    pathname.startsWith("/") &&
    pathname !== "/" &&
    !pathname.endsWith(".html")
  ) {
    return { text, url: `${pathname}.html${suffix}` };
  }

  return { text, url: href };
};

const formatMDXNameEntity = (name, parentType = "") => {
  return parentType ? `${parentType}.${name}` : name;
};

const formatMDXSpecifiedByLink = (url) => `\n\nSpecified by: ${url}`;

// ---------------------------------------------------------------------------
// Entity-kind badge colours
// ---------------------------------------------------------------------------
const KIND_THEME = {
  query:       { bg: "#f0fdf4", border: "#bbf7d0", color: "#14532d" },
  mutation:    { bg: "#fdf4ff", border: "#e9d5ff", color: "#581c87" },
  subscription:{ bg: "#fff7ed", border: "#fed7aa", color: "#7c2d12" },
  object:      { bg: "#eff6ff", border: "#bfdbfe", color: "#1e3a8a" },
  input:       { bg: "#fefce8", border: "#fef08a", color: "#713f12" },
  enum:        { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
  scalar:      { bg: "#f8fafc", border: "#cbd5e1", color: "#334155" },
  interface:   { bg: "#eef2ff", border: "#c7d2fe", color: "#3730a3" },
  union:       { bg: "#fff1f2", border: "#fecdd3", color: "#881337" },
  directive:   { bg: "#fdf2f8", border: "#f0abfc", color: "#86198f" },
};

const makeKindBadge = (kind) => {
  const theme = KIND_THEME[kind] || { bg: "#f6f7f9", border: "#d1d5db", color: "#374151" };
  return `<span style="display:inline-block;padding:0.12rem 0.5rem;margin-left:0.5rem;border:1px solid ${theme.border};border-radius:999px;background:${theme.bg};color:${theme.color};font-size:1.5rem;font-weight:600;line-height:1.2;vertical-align:middle;">${kind}</span>`;
};

/**
 * Determine the entity kind label for a GraphQL type.
 * For fields on root operation types, returns 'query', 'mutation', or 'subscription'.
 */
const getEntityKind = (type, schema) => {
  if (!type) return null;

  const ctor = type.constructor && type.constructor.name;

  // graphql-js predicates we can call without importing the package
  if (typeof type.astNode !== "undefined") {
    const kind = type.astNode && type.astNode.kind;

    if (kind === "ObjectTypeDefinition" || ctor === "GraphQLObjectType") {
      // Check if it's a root operation type
      if (schema) {
        const queryType = schema.getQueryType && schema.getQueryType();
        const mutType   = schema.getMutationType && schema.getMutationType();
        const subType   = schema.getSubscriptionType && schema.getSubscriptionType();
        if (queryType && queryType.name === type.name) return "query";
        if (mutType   && mutType.name   === type.name) return "mutation";
        if (subType   && subType.name   === type.name) return "subscription";
      }
      return "object";
    }
    if (kind === "InputObjectTypeDefinition" || ctor === "GraphQLInputObjectType") return "input";
    if (kind === "EnumTypeDefinition"        || ctor === "GraphQLEnumType")         return "enum";
    if (kind === "ScalarTypeDefinition"      || ctor === "GraphQLScalarType")       return "scalar";
    if (kind === "InterfaceTypeDefinition"   || ctor === "GraphQLInterfaceType")    return "interface";
    if (kind === "UnionTypeDefinition"       || ctor === "GraphQLUnionType")        return "union";
    if (kind === "DirectiveDefinition"       || ctor === "GraphQLDirective")        return "directive";
  }

  // Fallback: constructor name heuristics
  if (ctor === "GraphQLObjectType")      return "object";
  if (ctor === "GraphQLInputObjectType") return "input";
  if (ctor === "GraphQLEnumType")        return "enum";
  if (ctor === "GraphQLScalarType")      return "scalar";
  if (ctor === "GraphQLInterfaceType")   return "interface";
  if (ctor === "GraphQLUnionType")       return "union";
  if (ctor === "GraphQLDirective")       return "directive";

  // Operations: type is a GraphQLField-like object from root types
  // They have a `type` property and `args` but no astNode kind that matches above.
  // Infer from schema root fields.
  if (schema && type.type !== undefined && type.args !== undefined) {
    const queryType = schema.getQueryType && schema.getQueryType();
    const mutType   = schema.getMutationType && schema.getMutationType();
    const subType   = schema.getSubscriptionType && schema.getSubscriptionType();
    if (queryType) {
      const fields = queryType.getFields && queryType.getFields();
      if (fields && Object.values(fields).includes(type)) return "query";
    }
    if (mutType) {
      const fields = mutType.getFields && mutType.getFields();
      if (fields && Object.values(fields).includes(type)) return "mutation";
    }
    if (subType) {
      const fields = subType.getFields && subType.getFields();
      if (fields && Object.values(fields).includes(type)) return "subscription";
    }
    return "query"; // default for unknown root field
  }

  return null;
};

/**
 * Recursively collect TOC entries from a PageSection tree.
 */
const collectTocEntries = (section, entries) => {
  if (!section) return;

  if (typeof section === "string") {
    const re = /^###\s+(.+)$/mg;
    let m;
    while ((m = re.exec(section)) !== null) {
      const raw = m[1].replace(/<[^>]+>/g, "").trim();
      if (!raw) continue;
      const anchor = raw.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      entries.push({ text: raw, anchor });
    }
    return;
  }

  if (Array.isArray(section)) {
    for (const item of section) collectTocEntries(item, entries);
    return;
  }

  if (typeof section === "object") {
    if (typeof section.title === "string" && section.title.trim()) {
      const raw = section.title.replace(/<[^>]+>/g, "").trim();
      if (raw) {
        const anchor = raw.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        entries.push({ text: raw, anchor });
      }
    }
    if (section.content !== undefined) collectTocEntries(section.content, entries);
  }
};

/**
 * Build an "On this page" TOC from section headings.
 */
const buildPageToc = (sections, outputKeys) => {
  const items = [];

  for (const key of outputKeys) {
    const section = sections[key];
    if (!section) continue;
    collectTocEntries(section, items);
  }

  if (items.length < 2) return null;

  const links = items
    .map(
      ({ text, anchor }) =>
        `<li><a href="#${anchor}">${text}</a></li>`,
    )
    .join("");

  return [
    "<aside class=\"on-this-page\" aria-label=\"On this page\">",
    "  <div class=\"on-this-page__title\">On this page</div>",
    `  <ul class=\"on-this-page__list\">${links}</ul>`,
    "</aside>",
    "",
  ].join("\n");
};

const beforeComposePageTypeHook = async (event) => {
  const { type, options, sections } = event.data;
  const schema = options && options.schema;

  const kind = getEntityKind(type, schema);
  if (!kind) return;

  // 1. Inject entity-kind badge on the H1 heading
  const badge = makeKindBadge(kind);
  const header = sections && sections.header;
  if (header && typeof header.content === "string") {
    header.content = header.content.replace(
      /^(#\s+.+)$/m,
      (_, h1) => `${h1} ${badge}`,
    );
  }

  const toc = buildPageToc(sections, event.output);
  if (toc) {
    sections.toc = { content: toc };
    event.output.unshift("toc");
  }
};

module.exports = {
  mdxExtension: ".md",
  formatMDXBadge,
  formatMDXAdmonition,
  formatMDXBullet,
  formatMDXDetails,
  formatMDXFrontmatter,
  formatMDXLink,
  formatMDXNameEntity,
  formatMDXSpecifiedByLink,
  beforeComposePageTypeHook,
};
