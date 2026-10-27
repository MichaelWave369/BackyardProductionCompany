// BPC evidence snapshot, not live telemetry. Reviewed 2026-10-27.
// 'implemented' means the specified bounded handoff, never publishing/render authority.
export const SNAPSHOT='2026-10-27';
const owner='MichaelWave369';
export const repoUrl=(name,path='')=>'https://github.com/'+owner+'/'+name+(path?'/blob/main/'+path:'');
const studio=(id,name,dept,repo,status,description,capabilities=[],evidence='',launch='')=>({id,name,dept,repo,status,description,capabilities,evidence,launch});
export const studios=[
 studio('dom','Domistika','Art','Domistika','working','Drawing, advanced symmetry, layers and verified art handoffs.',['Symmetry','Painting','PSD'],'docs/FIELD_QUALIFICATION_V0942.md','https://michaelwave369.github.io/Domistika/'),
 studio('xr','Domistika XR','XR','Domistika','experimental','Spatial canvas painting and read-only Framefield mesh/animation preview in desktop or WebXR. True free-air strokes are not implemented yet.',['Spatial sketch','WebXR','3D preview'],'docs/XR_BPC_FRAMEFIELD_ANIMATION.md','https://michaelwave369.github.io/Domistika/xr.html'),
 studio('aur','Auralith369','Art','Auralith369','alpha','Photoshop-inspired image finishing, composite layers, LUTs and style cards.',['Image editing','Compositing'],'docs/CREATIVE_BRIDGE_V2_V073.md','https://michaelwave369.github.io/Auralith369/'),
 studio('frame','FramefieldStudio','3D & Animation','FramefieldStudio','candidate','Editable 3D meshes, non-destructive modifiers, animation keyframes and one-click BPC XR preview export.',['3D mesh','Animation','Export BPC XR'],'docs/BPC_XR_NATIVE_EXPORT_V01.md','https://michaelwave369.github.io/FramefieldStudio/'),
 studio('pixel','PixelForge','3D & Animation','parallax-pixelforge','audit','Related asset workshop; exact present-day capabilities require source-level audit.',['Game assets']),
 studio('box','PhiBox','Audio','PhiBox','working','Live Web Audio groovebox: sampler, drum machine, MIDI and sequencer.',['Sampler','MIDI'],'docs/PERFORMANCE.md','https://michaelwave369.github.io/PhiBox/'),
 studio('audio','PHIAudio','Audio','PHIAudio','candidate','Deterministic audio-engine interfaces and receipts. Full audio runtime remains a roadmap item.',['Audio contracts','DSP roadmap'],'docs/ARCHITECTURE.md'),
 studio('wave','WaveForgeStudio','Audio','WaveForgeStudio','alpha','Audio/AV production and media assembly, validated release-plan intake.',['AV assembly','Audio'],'docs/INTEROP_ROOM_V01.md'),
 studio('cut','ParaCut','Film','paracut','working','Video timeline, titles and controlled exact-media editorial intake.',['Video editing','Titles'],'docs/STUDIO_R89.md'),
 studio('cine','CineSwarm','Film','CineSwarm','candidate','Local media orchestration, model scheduling, QC and hashed evidence; not a published movie.',['Orchestration','QC'],'README.md'),
 studio('reel','REEL Commons','Distribution','ReelCommons','working','Official stream discovery, original-program pitches and explicit evidence inspection. No automatic broadcast.',['REEL Originals','Discovery'],'docs/REEL_REAL_MEDIA_EDITORIAL_INTAKE.md'),
 studio('phios','PhiOS-XR','XR','PhiOS-XR','alpha','Browser VR/MR shell, portals and Quest input diagnostics; not a Quest OS replacement.',['WebXR','Spatial shell'],'docs/EDITION_07.md','https://michaelwave369.github.io/PhiOS-XR/'),
 studio('math','PhiMathAtelier','Art','PhiMathAtelier','audit','Original mathematical art workshop; bridges require further source inspection.',['Geometry']),
 studio('louvre','Silicon Louvre','Distribution','SiliconLouvre','working','Creative gallery with documented bounded SVG transfer to Domistika.',['Gallery','SVG'],'','https://michaelwave369.github.io/SiliconLouvre/')
];
const bridge=(id,from,to,status,kind,label,detail,repo='',evidence='')=>({id,from,to,status,kind,label,detail,repo,evidence});
export const bridges=[
 bridge('dom-aur','dom','aur','implemented','Artwork','Verified artwork transfer','Auralith Creative Bridge v2 imports verified Domistika raster with protected semantic overlays, not complete editable project equivalence.','Auralith369','docs/CREATIVE_BRIDGE_V2_V073.md'),
 bridge('aur-cut','aur','cut','candidate','Artwork','Creative lineage v2 candidate','Interop intent and lineage exist; full native cross-editor asset editability is not certified.','Auralith369','docs/PARALLAX_CREATIVE_INTEROP_V2.md'),
 bridge('cut-wave','cut','wave','implemented','Production plan','RenderPlan intake','WaveForge verifies a ParaCut RenderPlan and issues a non-rendered reference/receipt, not a film.','WaveForgeStudio','docs/INTEROP_ROOM_V01.md'),
 bridge('wave-cine','wave','cine','candidate','Release reference','Reference-only receiver','WaveForge/CineSwarm describe restricted release-reference processing; no render or publication authority.','WaveForgeStudio','docs/CINESWARM_RELEASE_REFERENCE_V2.md'),
 bridge('reel-cine','reel','cine','implemented','Preproduction','Pilot preflight packet','REEL exports a native preproduction plan that a separate CineSwarm receiver inspects. It does not generate video.','ReelCommons','docs/REEL_FIRST_SHOT_WAN21.md'),
 bridge('cine-reel','cine','reel','implemented','Media evidence','Conditional MP4 hash verification','REEL can inspect manually selected actual MP4 bytes and unsigned CineSwarm evidence JSON. No completed film or publisher approval is claimed.','ReelCommons','docs/REEL_REAL_MEDIA_EDITORIAL_INTAKE.md'),
 bridge('cine-cut','cine','cut','implemented','Editorial','Verified-byte media intake','ParaCut can inspect manually selected real MP4 + evidence and add a clip. No automatic uploads or releases.','paracut','docs/STUDIO_R89.md'),
 bridge('louvre-dom','louvre','dom','implemented','SVG','Bounded SVG handoff','Domistika can explicitly receive and rasterize a filtered short-lived SVG from Silicon Louvre.','Domistika','docs/SILICON_LOUVRE_HANDOFF_V1.md'),
 bridge('frame-xr-preview','frame','xr','implemented','3D + Animation','Read-only animated mesh preview','Framefield exports evaluated visible meshes and transform keyframes into a local BPC JSON; Domistika XR parses the bounded file, displays geometry and plays animation. No native editing, scene persistence or confirmed headset acceptance.','Domistika','docs/XR_BPC_FRAMEFIELD_ANIMATION.md'),
 bridge('xr-frame','xr','frame','proposed','3D','Editable mesh handoff','3D stroke, mesh and transform schema mapping requires design, testing and permission boundaries.'),
 bridge('frame-pixel','frame','pixel','proposed','Game assets','Mesh and animation transfer','Research PixelForge source importer before implementing GLB or native mesh interchange.'),
 bridge('box-audio','box','audio','proposed','Audio','Stems and MIDI handoff','PHIAudio core DSP integration is not yet a qualified audio-runtime implementation.'),
 bridge('audio-wave','audio','wave','proposed','Audio','Audio renderer adapter','Define an approved interface, file semantics and tests before using PHIAudio output in WaveForge.'),
 bridge('xr-phios','xr','phios','proposed','XR','Shared spatial workspace','Both are WebXR apps but direct shared scene interaction is not currently qualified.')
];
export const statuses={implemented:'Documented handoff',candidate:'Candidate / bounded',proposed:'Proposed'};
export const roadmap=[
 {version:'v0.1',name:'Studio Lot',status:'Done',detail:'Catalog, working dashboard, evidence-first bridge inspector and portable inventory.'},
 {version:'v0.2',name:'Bridge Audit',status:'Done',detail:'Read-only Framefield → Domistika XR bridge shipped with pinned producer/receiver acceptance. Quest device test and reverse-editable path still pending.'},
 {version:'v0.3',name:'Production Ledger',status:'Current',detail:'Browser-local portable production manifests, file fingerprints, planned transfers, operator-reported results and non-publishing review receipts.'},
 {version:'v0.4',name:'Production 001',status:'Next',detail:'An original asset moving through real qualified studios into a reviewed deliverable.'}
];
export const lookup=id=>studios.find(s=>s.id===id)||null;
export const filterStudios=(query='',department='All')=>studios.filter(s=>(department==='All'||s.dept===department)&&[s.name,s.dept,s.description,...s.capabilities].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
export const filterBridges=status=>status==='all'?bridges:bridges.filter(b=>b.status===status);
export const counts=()=>({studios:studios.length,implemented:filterBridges('implemented').length,candidate:filterBridges('candidate').length,proposed:filterBridges('proposed').length});
export const exportSnapshot=()=>JSON.stringify({schema:'bpc.inventory.v1',asOf:SNAPSHOT,note:'Curated snapshot, not live telemetry. No broadcast, execution or authorization is implied.',studios,bridges},null,2);
