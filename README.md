# GraphQL-Markdown + HonKit demo

## 🚀 Project Structure

Inside your GraphQL-Markdown + [HonKit](https://honkit.netlify.app/) project, you'll see the following folders and files:

```text
.
├── docs/                        # Generated output (git-ignored)
│   ├── graphql/                 # Docs from the local schema
│   ├── graphql-remote/          # Docs from the remote schema
│   ├── _nav/                    # Auto-generated sidebar nav pages
│   ├── _icons/                  # SVG icons used in the sidebar
│   ├── README.md                # GitBook homepage
│   └── SUMMARY.md               # GitBook/HonKit table of contents
├── schema/
│   └── local.graphql            # Sample local GraphQL schema
├── scripts/
│   └── build-summary.mjs        # Generates docs/SUMMARY.md
├── honkit-mdx.cjs               # Custom MDX formatter for HonKit output
├── graphql.config.mjs           # GraphQL-Markdown configuration
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run generate:local` | Generate docs from the local GraphQL schema |
| `npm run generate:remote` | Generate docs from the remote GraphQL schema |
| `npm run generate` | Generate docs from both schemas |
| `npm run summary` | Build `docs/SUMMARY.md` (table of contents) |
| `npm run dev` | Generate docs + serve a local HonKit preview |
| `npm run build` | Generate docs + build a static site to `docs/_book` |
| `npm run clean` | Remove all generated files |

## 🏎️ Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:4000`.

> 🧑‍🚀 Edit `graphql.config.mjs` to try with your own GraphQL schema.

### Override the remote schema endpoint

By default the remote project points to `https://countries.trevorblades.com/graphql`.
Copy the example env file, then edit the values:

```bash
cp .env.example .env
```

```bash
GRAPHQL_ENDPOINT="https://your-api/graphql" npm run generate:remote
```

## 🗂️ GitBook.com import workflow

1. Run `npm run generate` (or one of the per-schema commands).
2. In GitBook.com, create or open a space.
3. Import files from the `docs/` folder:
   - include `docs/README.md`
   - include `docs/graphql/` and/or `docs/graphql-remote/`
4. Publish or preview the imported pages.

> The formatter in `honkit-mdx.cjs` keeps output Markdown-compatible for HonKit and GitBook.com imports.

## 👀 Want to learn more?

Check out [GraphQL-Markdown's docs](https://graphql-markdown.dev/).
