import {useMemo,useState} from 'react';
import {SNAPSHOT,studios,bridges,roadmap,lookup,repoUrl,filterStudios,filterBridges,counts,exportSnapshot} from './catalog.js';

function Link({href,children,className=''}){return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span></a>;}
const label={implemented:'Documented',candidate:'Candidate',proposed:'Proposed',working:'Working',alpha:'Alpha',experimental:'Experimental',audit:'Audit pending'};
function Badge({state}){return <span className={'badge state-'+state}>{label[state]||state}</span>;}
function Mark(){return <span className="mark" aria-hidden="true"><svg viewBox="0 0 38 38" width="30" height="30" fill="none"><path d="M4 17 19 5l15 12v16H4V17Z" stroke="currentColor" strokeWidth="2.3"/><path d="M12 33V20h14v13M4 17h30" stroke="currentColor" strokeWidth="2"/><path d="M14 3h10" stroke="#e9b485" strokeWidth="2"/></svg></span>;}
function StudioCard({s}){
 const [open,setOpen]=useState(false);
 return <article className="card">
   <div className="card-top"><div className="monogram">{s.name.split(' ').map(x=>x[0]).join('').slice(0,3).toUpperCase()}</div><Badge state={s.status}/></div>
   <p className="eyebrow muted">{s.dept}</p><h3>{s.name}</h3><p className="card-desc">{s.description}</p>
   <div className="chips">{s.capabilities.map(x=><span key={x}>{x}</span>)}</div>
   <button type="button" className="expand" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>Sources & launch <span aria-hidden="true">{open?'−':'+'}</span></button>
   {open&&<div className="card-links">
      <Link href={repoUrl(s.repo)}>Open source repository</Link>
      {s.evidence&&<Link href={repoUrl(s.repo,s.evidence)}>Inspect cited evidence</Link>}
      {s.launch&&<Link href={s.launch}>Visit studio</Link>}
      {s.status==='audit'&&<small>Repository discovered; capabilities not yet fully audited.</small>}
   </div>}
 </article>;
}
function StudioLot(){
 const [q,setQ]=useState('');const [dept,setDept]=useState('All');
 const departments=['All',...new Set(studios.map(x=>x.dept))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b));
 const found=useMemo(()=>filterStudios(q,dept),[q,dept]);
 return <section aria-labelledby="section-title"><div className="section-head"><div><p className="eyebrow">MEET THE CREW</p><h2 id="section-title">Every department. One backyard.</h2><p>Each tool keeps its own home and creative independence.</p></div><span className="count-pill">{found.length} / {studios.length} studios</span></div>
 <div className="filters"><label className="search"><span aria-hidden="true">⌕</span><span className="sr-only">Search studios</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tools, capabilities, departments..."/></label><label className="select"><span className="sr-only">Choose department</span><select value={dept} onChange={e=>setDept(e.target.value)}>{departments.map(x=><option key={x} value={x}>{x==='All'?'All departments':x}</option>)}</select></label></div>
 {found.length?<div className="cards">{found.map(s=><StudioCard key={s.id} s={s}/>)}</div>:<p className="empty">Nothing matches that search. Nobody left the backyard, try a different term.</p>}
 </section>;
}
function Pipeline(){
 const [filter,setFilter]=useState('all');const [selected,setSelected]=useState(bridges[0].id);
 const visible=filterBridges(filter);
 const active=bridges.find(x=>x.id===selected)||bridges[0];
 function chooseFilter(next){setFilter(next);setSelected(filterBridges(next)[0]?.id||bridges[0].id);}
 return <section aria-labelledby="section-title"><div className="section-head"><div><p className="eyebrow">THE PRODUCTION NETWORK</p><h2 id="section-title">Connections, not assumptions.</h2><p>Choose a handoff to see exactly what it does, and what it doesn't.</p></div></div>
 <div className="status-guide"><span><i className="dot green"/>Documented handoff</span><span><i className="dot amber"/>Candidate / bounded</span><span><i className="dot purple"/>Proposed only</span></div>
 <div className="pipeline"><div><div className="tabs small-tabs" role="group" aria-label="Filter pipeline links">{[{id:'all',title:'All links'},{id:'implemented',title:'Documented'},{id:'candidate',title:'Candidates'},{id:'proposed',title:'Proposed'}].map(x=><button key={x.id} aria-pressed={filter===x.id} className={filter===x.id?'on':''} onClick={()=>chooseFilter(x.id)}>{x.title}</button>)}</div>
 <div className="bridge-list">{visible.map(b=><button type="button" key={b.id} className={'bridge-item'+(selected===b.id?' selected':'')} onClick={()=>setSelected(b.id)} aria-pressed={selected===b.id}>
 <div className="bridge-route"><strong>{lookup(b.from).name}</strong><span aria-hidden="true">→</span><strong>{lookup(b.to).name}</strong></div><div className="bridge-sub">{b.label}</div><div className="bridge-foot"><span>{b.kind}</span><Badge state={b.status}/></div></button>)}</div></div>
 <aside className="inspector"><p className="eyebrow">BRIDGE INSPECTOR</p><Badge state={active.status}/><h3>{active.label}</h3><div className="route-visual"><div>{lookup(active.from).name}</div><span aria-hidden="true">↓</span><div>{lookup(active.to).name}</div></div><p>{active.detail}</p><div className="truth-note">{active.status==='implemented'?'Only the documented boundary is implemented. Passing data does not automatically render, publish, certify rights or grant authority.':active.status==='candidate'?'Limited contract or candidate: more producer-to-consumer acceptance is required.':'Design intent only. No implemented integration is claimed.'}</div>
 {active.repo&&active.evidence?<Link href={repoUrl(active.repo,active.evidence)}>View supporting source</Link>:<span className="no-link">Source qualification still required</span>}</aside></div>
 </section>;
}
function Roadmap(){
 return <section aria-labelledby="section-title"><div className="section-head"><div><p className="eyebrow">THE SHOOTING SCHEDULE</p><h2 id="section-title">Make every bridge count.</h2><p>Keep the studios sovereign. Validate the handoffs. Then make something together.</p></div></div>
 <div className="roadmap">{roadmap.map((m,i)=><article className="milestone" key={m.version}><span className="milestone-number">{String(i+1).padStart(2,'0')}</span><div><span className="eyebrow">{m.version.toUpperCase()} · {m.status.toUpperCase()}</span><h3>{m.name}</h3><p>{m.detail}</p></div></article>)}</div>
 <div className="principles"><strong>STUDIO RULES</strong><p>People Above Profit · Ledger Above Ego · Local-first production · Explicit authority · Portable project formats · Verifiable handoffs · Independent ownership.</p></div>
 </section>;
}
export default function App(){
 const [page,setPage]=useState('lot');const [message,setMessage]=useState('');
 const totals=counts();
 function download(){
   const url=URL.createObjectURL(new Blob([exportSnapshot()],{type:'application/json'}));
   const a=document.createElement('a');a.href=url;a.download='bpc-studio-inventory-v0.1.json';document.body.append(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1500);setMessage('Saved a local inventory snapshot, not a live API report.');
 }
 return <div className="app" id="top">
 <header className="top"><a className="identity" href="#top"><Mark/><span><strong>BACKYARD<br/><em>PRODUCTION COMPANY</em></strong><small>THE INDEPENDENT CREATIVE LOT</small></span></a>
 <nav aria-label="Studio sections" className="nav">{[{id:'lot',text:'Studio Lot'},{id:'pipeline',text:'Pipeline Map'},{id:'roadmap',text:'Roadmap'}].map(t=><button type="button" key={t.id} aria-current={page===t.id?'page':undefined} className={page===t.id?'current':''} onClick={()=>setPage(t.id)}>{t.text}</button>)}</nav>
 <Link href={repoUrl('BackyardProductionCompany')} className="repo-btn">SOURCE</Link></header>
 <main>
 <section className="hero"><div className="hero-layout"><div className="hero-copy"><p className="eyebrow"><span className="signal"/> NOW OPEN · STUDIO LOT V0.1</p><h1>From the <em>backyard</em><br/>to the universe<span className="period">.</span></h1><p>The headquarters for our independent creative studios. Art, animation, sound, film, games and XR. One shared production vision, without giving up control.</p><div className="hero-buttons"><button className="button primary" onClick={()=>setPage('pipeline')}>Explore the pipeline <span aria-hidden="true">→</span></button><button className="button secondary" onClick={download}>Export inventory <span aria-hidden="true">↓</span></button></div>{message&&<p role="status" className="success">{message}</p>}</div>
 <div className="hero-visual" aria-hidden="true"><div className="orb orb-a"/><div className="orb orb-b"/><div className="orb orb-c"/><div className="flap flap-left"/><div className="flap flap-right"/><div className="huge-logo">B<span>P</span>C</div><small>STUDIO LOT • EST. 2026</small></div></div></section>
 <div className="stats"><div><strong>{totals.studios.toString().padStart(2,'0')}</strong><span>CATALOGED STUDIOS</span></div><div><strong>{totals.implemented.toString().padStart(2,'0')}</strong><span>DOCUMENTED HANDOFFS</span></div><div><strong>{totals.candidate.toString().padStart(2,'0')}</strong><span>CANDIDATE BRIDGES</span></div><div><strong>{totals.proposed.toString().padStart(2,'0')}</strong><span>PROPOSED LINKS</span></div></div>
 <div className="main-content"><div className="subnav"><span className="eyebrow">BPC / CREATIVE SYSTEMS</span><span>Evidence snapshot: {SNAPSHOT} · Not live telemetry</span></div>{page==='lot'?<StudioLot/>:page==='pipeline'?<Pipeline/>:<Roadmap/>}</div>
 </main><footer><div className="footer-id"><Mark/><span><strong>BACKYARD PRODUCTION COMPANY</strong><small>FROM THE BACKYARD TO THE UNIVERSE</small></span></div><span>People Above Profit · Ledger Above Ego</span><span>© 2026 BPC · MIT · Independently built</span></footer></div>;
}
