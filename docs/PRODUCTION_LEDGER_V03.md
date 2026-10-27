# BPC v0.3 · Production Ledger

**From the Backyard to the Universe.** This is a real, browser-only metadata desk for tracking original works across independent studios. It deliberately does not become a required account, cloud storage provider, production engine or publisher.

## First-run workflow

1. Open the BPC Studio Lot and choose **Production Ledger**. Create a named production, e.g. "Production 001: First Motion."
2. Under **Register local file**, select a native Framefield scene file; classify as studio **FramefieldStudio** / kind **scene**. The browser reads the selected file into memory, computes **SHA-256**, and adds only filename, byte length, hash, studio and type to a manifest.
3. If you use **Export BPC XR** in Framefield, retain its packet as a separate file. Then load it manually in Domistika XR and test playback. If you'd like to track output as a destination artifact, register the actual receiving/output file explicitly under the receiving studio, not a made-up receiver result.
4. Under **Plan a studio handoff**, choose a source asset and an existing catalog bridge. BPC records intent but **does not** execute a transfer.
5. A planned handoff through a **documented bridge** can be marked **operator-reported** only after registering a destination-studio artifact. The record is your observation, not cross-repo CI, signed provenance, or publication permission. Proposed bridges stay planning-only.
6. Record a review as *reviewed*, *needs work*, or *approved for planning*. Review records can never authorize execution, publishing, external storage or direct editor import.
7. Click **Download backup** to save the \`*.bpc-production.json\` manifest. Later, import that manifest explicitly to resume, alongside your original media files.

## Manifest contract

\`schema: bpc.production.v1\`; strict fields and explicit default-deny \`permissions\`.

- Production: ID, name, UTC timestamps, asset array, handoff array, review array, four denied authority flags
- Asset: unique ID, basename, type, source/receiving studio, byte length, lowercase SHA-256 digest, time recorded
- Handoff: bridge ID, source asset ID, target asset ID (if user-reported), state, operator note, timestamps
- Review: asset ID, one of three non-publishing outcomes, local operator assertion and timestamp

The manifest does **not** embed original audio, video, meshes or images and cannot recreate them. An SHA-256 match confirms byte equality only. Neither source identity, rights clearance, real XR display, nor authenticity is inferred. Do not remove original native project backups.

## Resource and privacy limits

- Entire manifest: **1 MiB** maximum (JSON UTF-8)
- Each list: **100 records** maximum
- WebCrypto browser hashing: **128 MiB per chosen file**, requires HTTPS; larger video assets need a future reviewed incremental hashing implementation
- **No localStorage or cloud database**, by design. Leaving/reloading the tab before downloading a manifest loses unexported changes. BPC stores the working manifest in React component state while navigating its sections.
- User-selected file bytes are **never uploaded** or appended to the downloaded manifest. All import/export controls require a real user action.
- Manifest import is strict and fails closed on wrong schema, extra or missing fields, invalid hashes, forged authority booleans, broken asset references, mismatched source/target studios, non-ISO timestamps and unsupported review decisions.
- Importing another manifest requires confirmation if a production is already in memory. Save a backup before replacing it.

## Roadmap

BPC v0.3 is a **portable single-operator ledger**, not a cryptographically signed multi-party workflow or automatic pipeline executor. Next steps can add robust streamed hashing of larger assets, optionally store snapshots to a user-selected local folder using user-approved browser APIs, and create explicit offline release packages with source file collection and validation. None of these are claimed shipped in this rung.

CI executes model, workflow and tamper tests, and a Vite production build. Browser and Quest device acceptance remain separate.

People Above Profit · Ledger Above Ego.
