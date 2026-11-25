import { expect, test, type Page } from "@playwright/test";
import { argosScreenshot } from "@argos-ci/playwright";

// HonKit renders one page per type under /graphql/<kind>-<slug>.html.
// One entry per GraphQL type kind the formatter renders differently.
const pages = [
  ["object", "objects-project", "Project"],
  ["enum", "enums-project-status", "ProjectStatus"],
  ["interface", "interfaces-node", "Node"],
  ["union", "unions-search-result", "SearchResult"],
  ["input", "inputs-create-project-input", "CreateProjectInput"],
  ["scalar", "scalars-date-time", "DateTime"],
  ["query", "queries-projects", "projects"],
  ["mutation", "mutations-create-project", "createProject"],
  ["subscription", "subscriptions-project-changed", "projectChanged"],
  ["directive", "directives-deprecated", "deprecated"],
] as const;

// Element screenshots are stitched while scrolling, so the sticky book header
// and the footer would be painted over the content. Hide them for those shots.
const hideChrome = [
  ".book-header, .gqlmd-footer { display: none !important; }",
  ".markdown-section .on-this-page { position: static !important; }",
].join("\n");

// HonKit's night theme is not tied to prefers-color-scheme: the font settings
// plugin persists its state in localStorage (`:fontState`, empty base key) and
// applies `.color-theme-2` to `.book`. Seed it before the page scripts run.
const useNightTheme = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      ":fontState",
      JSON.stringify({ size: 2, family: 1, theme: 2 }),
    );
  });
};

const content = (page: Page) => page.locator(".markdown-section");

test("home", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator(".markdown-section h1")).toHaveText("Your API, mapped with intent.");
  await argosScreenshot(page, "home", { argosCSS: hideChrome });
});

for (const [kind, slug, name] of pages) {
  test(`page: ${kind}`, async ({ page }) => {
    const response = await page.goto(`/graphql/${slug}.html`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(".markdown-section h1")).toContainText(name);
    await argosScreenshot(page, `page-${kind}`, {
      element: content(page),
      argosCSS: hideChrome,
    });
  });
}

test("markdown copy", async ({ request }) => {
  const response = await request.get("/graphql/objects-project.md");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body.startsWith("# ")).toBe(true);
  expect(body).not.toContain("<span");
});

test("deprecation reason links to a type page", async ({ page }) => {
  await page.goto("/graphql/objects-project.html");
  const link = page
    .locator(".markdown-section")
    .locator("a", { hasText: "ProjectStatus" })
    .first();
  await expect(link).toHaveAttribute("href", /enums-project-status\.html$/);
});

// The type-level `@deprecatedType` notice renders with a link to `Project`.
test("deprecated type shows a notice with a link", async ({ page }) => {
  await page.goto("/graphql/objects-legacy-project.html");
  const notice = page.locator(".markdown-section p", { hasText: "Replaced by" }).first();
  await expect(notice).toBeVisible();
  await expect(notice.locator("a", { hasText: /^Project$/ })).toHaveAttribute(
    "href",
    /objects-project\.html$/,
  );
});

test.describe("dark mode", () => {
  test.beforeEach(async ({ page }) => {
    await useNightTheme(page);
  });

  test("home", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".book.color-theme-2")).toBeVisible();
    await argosScreenshot(page, "home-dark", { argosCSS: hideChrome });
  });

  test("page: object", async ({ page }) => {
    const response = await page.goto("/graphql/objects-project.html");
    expect(response?.status()).toBe(200);
    await expect(page.locator(".book.color-theme-2")).toBeVisible();
    await expect(page.locator(".markdown-section h1")).toContainText("Project");
    await argosScreenshot(page, "page-object-dark", {
      element: content(page),
      argosCSS: hideChrome,
    });
  });
});
