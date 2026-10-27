# Backyard Production Company (BPC)

**From the Backyard to the Universe.**

BPC is an original, local-first studio lot and evidence-first pipeline atlas linking independently maintained creative projects. It is not a monolithic replacement for the editing, audio, XR, modeling or film applications.

## v0.3 · Production Ledger

BPC now has a **Production Ledger** tab for browser-local, portable production manifests (`bpc.production.v1`). Register user-selected file SHA-256 hashes, plan source-to-destination handoffs, record clearly labeled operator-reported transfer results, and keep human review decisions without implicitly granting publishing or execution rights.

**Manual backup is essential:** the ledger is in memory only. Download `*.bpc-production.json` before refreshing/closing. Original assets aren't bundled, and files larger than 128 MiB aren't supported by this first whole-buffer hashing pass. See [Production Ledger v0.3](docs/PRODUCTION_LEDGER_V03.md).

## v0.2.1 · Studio Lot + Cross-Studio Bridge Acceptance

Framefield now exports evaluated geometry and transform animation directly to Domistika XR as a **read-only local preview** via the BPC neutral format. The Studio Lot catalog records this specific one-way route as documented, and retains the **editable reverse path as proposed**.

CI includes an isolated **real cross-repo exporter → receiver test**, with reviewed pinned source revisions; see [BPC cross-studio acceptance](docs/CROSS_STUDIO_ACCEPTANCE_V021.md). This validates the contracts and keyframe math but **does not qualify actual Quest 3 hardware, browser rendering, or native editing**.

## v0.1 · Studio Lot

- Interactive React/Vite studio directory with capability and department search
- Bridge map distinguishing **documented**, **candidate**, and **proposed** interop
- Click-through evidence paths to repo source and controlled handoff descriptions
- Browser-local JSON inventory download, roadmap, mobile-friendly layout
- PR verification and GitHub Pages deployment workflow

The snapshot is curated from repository documentation on **2026-10-26**. It is **not live status monitoring**. A documented interface is not proof of a real media render, automatically working entire chain, rights clearance or publisher authorization. Read each bridge for its actual boundary.

## Local usage

Node 22+ recommended.

~~~sh
npm install
npm test
npm run dev
npm run build
~~~

When GitHub Pages is configured to use **GitHub Actions** and the deployment after merging succeeds, open:

https://michaelwave369.github.io/BackyardProductionCompany/

## Where the truth lives

- src/catalog.js: curated studio inventory and explicit bridge claims
- src/ledger/model.js: strict default-deny portable production manifest schema, human reports and reviews
- src/ProductionLedger.jsx: browser-only production desk (no remote storage)
- tests/catalog.test.mjs: catalog integrity, traceability and status classification tests
- docs/BRIDGE_AUDIT_V01.md: handoff evidence, boundaries and future acceptance steps

All links navigate deliberately. No user accounts, GitHub token, arbitrary external scripting, hosted backend or auto-publishing are performed. The ledger *only hashes explicit user-selected files locally*; no file contents are uploaded or stored by BPC.

## Principles

Specialist apps remain independent. BPC coordinates. Provenance before promotion. Human approval before release. People Above Profit. Ledger Above Ego.

MIT licensed; see LICENSE.
