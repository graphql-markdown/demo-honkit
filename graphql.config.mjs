import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const formatter = pathToFileURL(resolve("./scripts/honkit-mdx.mjs")).href;

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
          formatter,
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
          formatter,
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
