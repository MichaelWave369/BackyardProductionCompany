# BPC v0.2.1 · Cross-Studio Acceptance Gate

**Purpose:** verify a real, bounded FramefieldStudio → BPC spatial contract → Domistika XR **read-only mesh and transform animation** handoff across repositories.

This gate belongs to **BackyardProductionCompany**, the neutral production coordinator. It checks the *real upstream source code*, not copies of its parser rules: \`FramefieldStudio/src/bpcExport.js\` for producer, \`Domistika/src/xr/framefieldPreview.js\` for receiver, and \`FramefieldStudio/src/scene.js\` for source keyframe evaluation.

## What CI verifies

1. A real default Framefield animated box and sphere export into the neutral \`bpc.spatial-preview.v1\` packet and are parsed by the actual Domistika XR receiver.
2. Triangular geometry, object IDs, shapes, FPS, duration, and all keyframe counts survive.
3. A multi-axis motion fixture with linear, hold and cubic Bezier easing compares actual Framefield \`atFrame\` against the Domistika receiver's \`sampleFramefieldPose\` at ten separate frames.
4. Enabled Framefield subdivision evaluates to actual output polygons on export without mutating its original scene.
5. A legacy BPC Bridge Lab preview is still accepted.
6. Tampering with the packet's execution authority, mesh face indices or object count fails closed.

## Pinned source revisions

- FramefieldStudio **PR #17 merge**: \`fb8b04be811f215f5c5219ccb0ab0ad8e636aeed\`
- Domistika **PR #55 merge**: \`e85ec716395a85c4951dcf7e7699fb35f89400bf\`

The workflow uses separate read-only GitHub checkouts in \`.interop/\`, ignored from BPC's Git tree. There are no stored access tokens, uploads, model execution, or edits to the two source repositories. When either producer or receiver changes, explicitly update these pinned SHAs in a reviewed PR and rerun this gate. A passing pinned check is **not automatic proof that the latest heads remain mutually compatible**.

## Limits of acceptance

The checked contract is **read-only export and preview parsing of evaluated polygon meshes plus object transform motion**. It is not a real Quest device test, browser UI automation, proof of mesh rendering parity, editable back-and-forth project exchange, audio synchronization, rights verification or publishing.

Human workflow: [Framefield Studio](https://michaelwave369.github.io/FramefieldStudio/) → **Export BPC XR** → [Domistika XR](https://michaelwave369.github.io/Domistika/xr.html) → **Load BPC mesh** → **Play preview / Enter VR**.

The existing Domistika XR → Framefield *editable return path* remains **proposed**; this new documented one-way route should not be mistaken for that entire two-way feature.

People Above Profit · Ledger Above Ego.
