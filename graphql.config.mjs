import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const formatter = pathToFileURL(resolve(__dirname, "scripts/honkit-mdx.mjs")).href;

/** @type {import('graphql-config').IGraphQLConfig} */
const config = {
  // Shared schema documented by every GraphQL-Markdown demo.
  schema:
    "https://raw.githubusercontent.com/graphql-markdown/graphql-markdown/main/tests/e2e/__data__/demo_schema.graphql",
  extensions: {
    "graphql-markdown": {
      rootPath: "./docs",
      baseURL: "graphql",
      linkRoot: "/demo-honkit",
      homepage: false,
      telemetry: false,
      formatter,
      loaders: {
        UrlLoader: "@graphql-tools/url-loader",
      },
      docOptions: {
        index: false,
        sectionHeaderId: true,
      },
      printTypeOptions: {
        hierarchy: "flat",
        typeBadges: true,
        deprecated: "default",
      },
    },
  },
};

export default config;
