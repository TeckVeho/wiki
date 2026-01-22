import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "My Wiki",
  tagline: "Knowledge Base",
  favicon: "img/vehologo.png",

  url: "https://wiki.vw-dev.com",
  baseUrl: "/",
  trailingSlash: false,

  organizationName: "TeckVeho",
  projectName: "wiki",

  // グローバルな壊れたリンクの扱いを設定
  onBrokenLinks: "warn", // "throw"から"warn"に変更
  onBrokenAnchors: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  themes: ["@docusaurus/theme-mermaid"],
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },
  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/TeckVeho/wiki/edit/main/",
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          // ここから削除: onBrokenLinks: "warn" (docs設定内では許可されていない)
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
        pages: {
          path: "src/pages",
          routeBasePath: "/",
          include: ["**/*.{js,jsx,ts,tsx,md,mdx}"],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Veho Wiki",
      logo: {
        alt: "Veho Wiki Logo",
        src: "img/vehologo.png",
      },
      items: [
        {
          href: "https://github.com/TeckVeho/wiki",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Veho Wiki. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    docs: {
      sidebar: {
        autoCollapseCategories: true,
        hideable: true,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
