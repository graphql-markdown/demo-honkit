# GraphQL-Markdown + HonKit demo

This project demonstrates how to generate GraphQL documentation with GraphQL-Markdown for a [HonKit](https://honkit.netlify.app/) site.

**Live demo:** [graphql-markdown.dev/demo-honkit](https://graphql-markdown.dev/demo-honkit/)

## 🚀 Project Structure

Inside your GraphQL-Markdown + [HonKit](https://honkit.netlify.app/) project, you'll see the following folders and files:

```text
.
├── docs/                        # Generated output (git-ignored)
│   ├── graphql/                 # Generated GraphQL docs
│   ├── _nav/                    # Auto-generated sidebar nav pages
│   ├── _icons/                  # SVG icons used in the sidebar
│   ├── _layouts/website/        # Custom page layout (footer, badge tagging)
│   ├── styles/website.css       # Reference polish (light + night theme) and landing page styles
│   ├── README.md                # Landing page (HTML hero, schema preview, highlights)
│   ├── about.md                 # Intro text about the demo
│   └── SUMMARY.md               # GitBook/HonKit table of contents
├── scripts/
│   ├── build-summary.mjs        # Generates docs/SUMMARY.md
│   └── honkit-mdx.mjs           # Custom formatter for HonKit output
├── tests/visual/site.spec.ts    # Playwright + Argos visual tests
├── playwright.config.ts         # Playwright config (serves docs/_book on :4173)
├── graphql.config.mjs           # GraphQL-Markdown configuration
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run generate` | Generate docs from the GraphQL schema |
| `npm run summary` | Build `docs/SUMMARY.md` (table of contents) |
| `npm run dev` | Generate docs + serve a local HonKit preview |
| `npm run build` | Generate docs + build a static site to `docs/_book` |
| `npm run test:visual` | Run the Playwright + Argos visual tests (build first with `npx honkit build docs _book`) |
| `npm run clean` | Remove all generated files |

## 🏎️ Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:4000`.

> 🧑‍🚀 Edit `graphql.config.mjs` to try with your own GraphQL schema.

### Visual tests

Screenshots of the landing page and one page per GraphQL type kind (plus the night theme) are captured with [Playwright](https://playwright.dev/) and uploaded to [Argos](https://argos-ci.com/) by `.github/workflows/visual.yml` when `ARGOS_TOKEN` is set.

```bash
npx playwright install chromium
npm run prepare && npx honkit build docs _book
npm run test:visual
```

The night theme is HonKit's font-settings theme: the tests seed `localStorage[":fontState"]` with `{ theme: 2 }`.

### Schema

The demo documents the [shared GraphQL-Markdown demo schema](https://github.com/graphql-markdown/graphql-markdown/blob/main/tests/e2e/__data__/demo_schema.graphql), the same schema used by every GraphQL-Markdown demo. It is loaded from its raw URL by `graphql.config.mjs`.

## 🗂️ GitBook.com import workflow

1. Run `npm run generate`.
2. In GitBook.com, create or open a space.
3. Import files from the `docs/` folder:
   - include `docs/README.md`
   - include `docs/graphql/`
4. Publish or preview the imported pages.

> The formatter in `honkit-mdx.cjs` keeps output Markdown-compatible for HonKit and GitBook.com imports.

## 👀 Want to learn more?

Check out [GraphQL-Markdown's docs](https://graphql-markdown.dev/).
