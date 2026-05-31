import HonKitFormatter from "@graphql-markdown/formatters/honkit";

export const mdxExtension = HonKitFormatter.mdxExtension;

// ---------------------------------------------------------------------------
// Entity-kind badge colours
// ---------------------------------------------------------------------------
const KIND_THEME = {
  query:        { bg: "#f0fdf4", border: "#bbf7d0", color: "#14532d" },
  mutation:     { bg: "#fdf4ff", border: "#e9d5ff", color: "#581c87" },
  subscription: { bg: "#fff7ed", border: "#fed7aa", color: "#7c2d12" },
  object:       { bg: "#eff6ff", border: "#bfdbfe", color: "#1e3a8a" },
  input:        { bg: "#fefce8", border: "#fef08a", color: "#713f12" },
  enum:         { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
  scalar:       { bg: "#f8fafc", border: "#cbd5e1", color: "#334155" },
  interface:    { bg: "#eef2ff", border: "#c7d2fe", color: "#3730a3" },
  union:        { bg: "#fff1f2", border: "#fecdd3", color: "#881337" },
  directive:    { bg: "#fdf2f8", border: "#f0abfc", color: "#86198f" },
};

const makeKindBadge = (kind) => {
  const theme = KIND_THEME[kind] ?? { bg: "#f6f7f9", border: "#d1d5db", color: "#374151" };
  return `<span style="display:inline-block;padding:0.12rem 0.5rem;margin-left:0.5rem;border:1px solid ${theme.border};border-radius:999px;background:${theme.bg};color:${theme.color};font-size:1.5rem;font-weight:600;line-height:1.2;vertical-align:middle;">${kind}</span>`;
};

const getEntityKind = (type, schema) => {
  if (!type) return null;
  const ctor = type.constructor?.name;

  if (typeof type.astNode !== "undefined") {
    const kind = type.astNode?.kind;
    if (kind === "ObjectTypeDefinition" || ctor === "GraphQLObjectType") {
      if (schema) {
        if (schema.getQueryType?.()?.name === type.name) return "query";
        if (schema.getMutationType?.()?.name === type.name) return "mutation";
        if (schema.getSubscriptionType?.()?.name === type.name) return "subscription";
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

  if (ctor === "GraphQLObjectType")      return "object";
  if (ctor === "GraphQLInputObjectType") return "input";
  if (ctor === "GraphQLEnumType")        return "enum";
  if (ctor === "GraphQLScalarType")      return "scalar";
  if (ctor === "GraphQLInterfaceType")   return "interface";
  if (ctor === "GraphQLUnionType")       return "union";
  if (ctor === "GraphQLDirective")       return "directive";

  if (schema && type.type !== undefined && type.args !== undefined) {
    const queryFields = schema.getQueryType?.()?.getFields?.();
    if (queryFields && Object.values(queryFields).includes(type)) return "query";
    const mutFields = schema.getMutationType?.()?.getFields?.();
    if (mutFields && Object.values(mutFields).includes(type)) return "mutation";
    const subFields = schema.getSubscriptionType?.()?.getFields?.();
    if (subFields && Object.values(subFields).includes(type)) return "subscription";
    return "query";
  }

  return null;
};

// ---------------------------------------------------------------------------
// On-this-page TOC
// ---------------------------------------------------------------------------
const collectTocEntries = (section, entries) => {
  if (!section) return;
  if (typeof section === "string") {
    const re = /^###\s+(.+)$/mg;
    let m;
    while ((m = re.exec(section)) !== null) {
      const raw = m[1].replace(/<[^>]+>/g, "").trim();
      if (raw) entries.push({ text: raw, anchor: raw.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") });
    }
    return;
  }
  if (Array.isArray(section)) { for (const item of section) collectTocEntries(item, entries); return; }
  if (typeof section === "object") {
    if (typeof section.title === "string" && section.title.trim()) {
      const raw = section.title.replace(/<[^>]+>/g, "").trim();
      if (raw) entries.push({ text: raw, anchor: raw.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") });
    }
    if (section.content !== undefined) collectTocEntries(section.content, entries);
  }
};

const buildPageToc = (sections, outputKeys) => {
  const items = [];
  for (const key of outputKeys) collectTocEntries(sections[key], items);
  if (items.length < 2) return null;
  const links = items.map(({ text, anchor }) => `<li><a href="#${anchor}">${text}</a></li>`).join("");
  return [
    `<aside class="on-this-page" aria-label="On this page">`,
    `  <div class="on-this-page__title">On this page</div>`,
    `  <ul class="on-this-page__list">${links}</ul>`,
    `</aside>`,
    "",
  ].join("\n");
};

// ---------------------------------------------------------------------------
// Lifecycle hook
// ---------------------------------------------------------------------------
export const beforeComposePageTypeHook = async (event) => {
  const { type, options, sections } = event.data;
  const schema = options?.schema;
  const kind = getEntityKind(type, schema);
  if (!kind) return;

  const badge = makeKindBadge(kind);
  const header = sections?.header;
  if (header && typeof header.content === "string") {
    header.content = header.content.replace(/^(#\s+.+)$/m, (_, h1) => `${h1} ${badge}`);
  }

  const toc = buildPageToc(sections, event.output);
  if (toc) {
    sections.toc = { content: toc };
    event.output.unshift("toc");
  }
};

// ---------------------------------------------------------------------------
// Default export — formatter preset + custom hook
// ---------------------------------------------------------------------------
const { createMDXFormatter } = HonKitFormatter;

export default {
  ...(typeof createMDXFormatter === "function" ? createMDXFormatter() : HonKitFormatter),
  mdxExtension,
  beforeComposePageTypeHook,
};
