import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { runGraphQLMarkdown } from "@graphql-markdown/cli";

import { decorators } from "../lib/decorators.mjs";

rmSync("./.markdown-copies", { force: true, recursive: true });

// Runs in its own process: the printer keeps the first run's formatter within
// a process, so a second run in the same script would reuse the HonKit preset.
// Plain Markdown copies, published next to each page by the build scripts.
await runGraphQLMarkdown(
  {
    schema:
      "https://raw.githubusercontent.com/graphql-markdown/graphql-markdown/main/tests/e2e/__data__/demo_schema.graphql",
    rootPath: "./.markdown-copies",
    baseURL: "graphql",
    homepage: false,
    formatter: pathToFileURL(resolve("./lib/markdown-copy.mjs")).href,
    loaders: {
      UrlLoader: "@graphql-tools/url-loader",
    },
    printTypeOptions: {
      hierarchy: "flat",
      typeBadges: true,
      deprecated: "default",
    },
    decorators,
    pretty: true,
    force: true,
    telemetry: false,
    docOptions: {
      index: false,
      sectionHeaderId: false,
    },
  },
  {},
);

console.log("Markdown copies generated in .markdown-copies");
