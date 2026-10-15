# Ramūnas Mališauskas — Frontend Portfolio

A fast, responsive, accessible React + TypeScript portfolio with CSS, a persistent light/dark theme, and project cards driven by JSON.

## Run locally

Requires Node.js 20.19 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To verify a production build:

```bash
npm run build
npm run preview
```

## Add or replace a project

Edit [`src/data/projects.json`](src/data/projects.json). Each entry uses this shape:

```json
{
  "title": "Project name",
  "kind": "Short category",
  "description": "What you made, the problem it solves, and your contribution.",
  "stack": ["React", "TypeScript", "SCSS"],
  "liveUrl": "https://your-live-demo.example",
  "sourceUrl": "https://github.com/your-name/your-project",
  "placeholder": false,
  "visual": "shop"
}
```

- Replace the three starter entries with real work; remove or add objects as needed.
- Keep `placeholder` set to `true` until the card contains a real project. Placeholder cards are labelled and do not show demo/source links.
- Set it to `false` for real work. Leave a URL empty to hide that link.
- `visual` accepts `shop`, `signal`, or `mobile`; it selects a small CSS illustration, not a project screenshot.
- Keep the JSON valid (double quotes, commas between properties and entries). Save, then run `npm run build` before publishing.

## Add contact links

Edit `src/data/site.json` and add an email address and/or public profile URLs. These fields are intentionally blank until Ramūnas chooses which contact details to publish. The contact links appear automatically when populated.

## Deploy (free tiers)

No paid services or subscriptions are required. Each host will ask you to sign in to the account you choose; this project does not create accounts or deploy itself.

### GitHub Pages

1. Push the `portfolio/` project to a GitHub repository.
2. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the build source.
3. Add `.github/workflows/deploy.yml` from this project, commit, and push. The action builds the site and publishes `dist/` on each push to `main`.
4. GitHub Pages will show the published URL under **Settings → Pages**.

### Vercel

1. Import the repository in Vercel using its free tier.
2. Select **Vite** (or use the detected defaults): build command `npm run build`, output directory `dist`.
3. Deploy. Vercel shows the live URL when the build finishes.

### Netlify

1. Import the repository in Netlify using its free tier.
2. Set build command to `npm run build` and publish directory to `dist`.
3. Deploy. Netlify shows the live URL when the build finishes.

The Vite base path is relative, so the same build works at a GitHub Pages project URL or at a Vercel/Netlify site root.

## Reference notes

The visual direction was informed by fifteen public developer portfolios: the ten examples discussed in [Juno's web developer portfolio roundup](https://junocollege.com/blog/10-amazing-web-developer-portfolios-to-inspire-you/) (Kay Evans-Stocks, Alex Calia, Lucas Regazzi, Sharon Yi, Andrea Lacson, Afua Deborah, Evan Wallace, Nick Reyno, Philip Turkiewicz, and Sandy Pranjic), plus [Brittany Chiang](https://brittanychiang.com/), [Lee Robinson](https://leerob.com/), [Josh W. Comeau](https://joshwcomeau.com/), [Cassidy Williams](https://cassidoo.co/), and [Kent C. Dodds](https://kentcdodds.com/). The broader [Awwwards portfolio collection](https://www.awwwards.com/websites/portfolio/) was also reviewed for art direction.

Patterns carried into this site: make the developer's role and stack immediately clear; pair projects with a useful description and demo/source links; and keep personality in the visual system without making navigation or reading harder.
