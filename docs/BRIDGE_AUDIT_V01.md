# Studio Lot bridge audit · originally 2026-10-26, updated 2026-10-27

This is an evidence-based catalog, not a successful end-to-end production acceptance report. 'Implemented' refers to the **precise described boundary**, not complete project interchange or authority to publish.

## Documented bounded integrations

- [Domistika → Auralith](https://github.com/MichaelWave369/Auralith369/blob/main/docs/CREATIVE_BRIDGE_V2_V073.md): verified image with protected overlays.
- [ParaCut → WaveForgeStudio](https://github.com/MichaelWave369/WaveForgeStudio/blob/main/docs/INTEROP_ROOM_V01.md): bounded RenderPlan intake and non-rendered release reference.
- [REEL → CineSwarm](https://github.com/MichaelWave369/ReelCommons/blob/main/docs/REEL_FIRST_SHOT_WAN21.md): preproduction packet and native preflight, not a finished video.
- [CineSwarm → REEL](https://github.com/MichaelWave369/ReelCommons/blob/main/docs/REEL_REAL_MEDIA_EDITORIAL_INTAKE.md): manual actual-file MP4/evidence verification. Hash agreement with an unsigned sidecar does not establish identity, editorial clearance or broadcasting rights.
- [CineSwarm → ParaCut](https://github.com/MichaelWave369/paracut/blob/main/docs/STUDIO_R89.md): manual exact-media hash inspection followed by explicitly staged timeline clip.
- [Silicon Louvre → Domistika](https://github.com/MichaelWave369/Domistika/blob/main/docs/SILICON_LOUVRE_HANDOFF_V1.md): bounded user-approved SVG import.

- [FramefieldStudio → BPC → Domistika XR](https://github.com/MichaelWave369/Domistika/blob/main/docs/XR_BPC_FRAMEFIELD_ANIMATION.md): operator exports evaluated mesh/animation BPC JSON from Framefield, imports it into Domistika XR as a read-only, ephemeral preview; requires Quest device acceptance. [Framefield export specification](https://github.com/MichaelWave369/FramefieldStudio/blob/main/docs/BPC_XR_NATIVE_EXPORT_V01.md). A dedicated [cross-repo acceptance gate](CROSS_STUDIO_ACCEPTANCE_V021.md) tests the producer/receiver contracts at reviewed pinned SHAs.

## Candidates

- Auralith → ParaCut: shared creative interop v2 metadata needs end-to-end asset fidelity acceptance.
- WaveForge → CineSwarm: restricted reference-only transport must not claim execution or release authority.

## Proposed work order

1. Domistika XR → FramefieldStudio: **reverse editable** geometry and brush stroke handling, units, transforms, texture preservation and lossless round-trip tests. The opposite read-only preview direction is now documented.
2. FramefieldStudio → PixelForge: first audit the actual importer and mesh asset contract. Repo is `parallax-pixelforge`.
3. PhiBox → PHIAudio → WaveForgeStudio: source/stem identity, MIDI timing, verified audio output and engine maturity gates.
4. Domistika XR → PhiOS-XR: a user-driven spatial-scene bridge, without unauthorized runtime access.
5. Geometry export: explicit units, manifold validation and printable solid checks for fabrication; GLB scene/collision/spawn metadata for walkable XR worlds.

The BPC v0.2.1 gate checks one **specific** real source exporter → receiver pair at pinned revisions, not every studio or the entire live deployment. Physical Quest acceptance and editable round-trip remain unverified.
