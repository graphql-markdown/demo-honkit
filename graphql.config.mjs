import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mdxParserPath = path.join(__dirname, "honkit-mdx.cjs");

const remoteEndpoint =
  process.env.GRAPHQL_ENDPOINT ?? "https://countries.trevorblades.com/graphql";

const remoteHeaders = {
  ...(process.env.GRAPHQL_AUTH_HEADER
    ? { Authorization: process.env.GRAPHQL_AUTH_HEADER }
    : {}),
};

/** @type {import('graphql-config').IGraphQLConfig} */
const config = {
  projects: {
    local: {
      schema: "./schema/local.graphql",
      extensions: {
        "graphql-markdown": {
          rootPath: "./docs",
          baseURL: "graphql",
          linkRoot: "/",
          homepage: false,
          mdxParser: mdxParserPath,
          loaders: {
            GraphQLFileLoader: "@graphql-tools/graphql-file-loader",
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
    },
    remote: {
      schema: remoteEndpoint,
      extensions: {
        "graphql-markdown": {
          rootPath: "./docs",
          baseURL: "graphql-remote",
          linkRoot: "/",
          homepage: false,
          mdxParser: mdxParserPath,
          loaders: {
            UrlLoader: {
              module: "@graphql-tools/url-loader",
              options: {
                method: "POST",
                headers: remoteHeaders,
              },
            },
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
    },
  },
};

export default config;
