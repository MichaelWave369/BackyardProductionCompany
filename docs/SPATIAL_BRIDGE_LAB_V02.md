# BPC v0.2 Spatial Bridge Lab

## Scope

Preview-only browser-local source inspector for candidate Domistika XR and FramefieldStudio interchange. Real source shapes verified from their main-branch JavaScript models on 2026-10-26. BPC does not install anything into the original tools, create actual 3D assets, send data across origins, execute models, render video, or publish media.

- Domistika XR source schema: domistika.xr.scene.v1. It uses floating boards and 2D UV stroke coordinates (not spatial 3D ink). Native board poses use radians. 1–12 boards, 600 strokes each, max 2500 UV points/stroke.
- FramefieldStudio source version: 1. Polygons and primitive reference shapes, keyframes with rotations in degrees, and optional modifier intents. Source editable mesh cages are bounded by 800 vertices/1200 faces, 100 objects and 600 keyframes/object.

## Preview schema

BPC uses bpc.spatial-preview.v1. It preserves board strokes with explicit pointsUV, mesh cages or primitive references, and normalized radian transform tracks. Modifier operations are retained as intent but NOT evaluated. This packet is not accepted by either editor yet and is not GLB, STL, 3MF, physical print geometry, an animation interchange standard, or full project backups.

The browser accepts explicit local JSON selections up to 5 MiB and two built-in test fixtures. On demand it exports the normalized preview. Uploaded project bytes are not sent to the server and are not persisted by BPC. A SHA-256 of the chosen source is computed locally for byte comparison only, not a provenance or rights certificate.

Packet authority fields execute/importIntoEditor/render/publish are all false. Other formats, non-finite geometry, unsupported shape types and out-of-range data fail closed. Source projects remain unchanged.

## Known fidelity limits

- Domistika: floating-board strokes stay in 2D UV; pixel textures, UI selection and undo history omitted.
- Framefield: rotations converted degrees to radians, editable source polygon faces retained but modifier outputs not baked; primitives remain type references; lighting, camera, material and rendering details omitted.

## Real-bridge next gate

Implement a versioned opt-in importer in an actual consuming editor, with preservation/loss receipts, coordinate basis and units, texture/winding standards and bidirectional fixture acceptance. Evaluate source primitives and modifiers when converting to GPU mesh; print export must additionally validate manifoldness and physical units. A passing BPC test is not a claim of working VR/headset or other downstream acceptance.
