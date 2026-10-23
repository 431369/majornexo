import { useState, useRef, useEffect } from 'react';
import publications from './data/assistance.json';
const names = {vendas:'Vendas',manutencao:'Manutenção'};
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

export default function AssistanceGallery() {
  const [filter,setFilter] = useState('todos');
  const [search,setSearch] = useState('');
  const [limit,setLimit] = useState(12);
  const [selected,setSelected] = useState(null);
  const dialog = useRef(null);
  const visible = publications.filter(p=>(filter==='todos'||p.categories.includes(filter))&&normalize(p.caption).includes(normalize(search)));
  useEffect(()=>{ if(selected) dialog.current.showModal(); },[selected]);
  const changeFilter = value => {setFilter(value);setLimit(12);};
  return <section className="work-gallery" id="trabalhos" aria-labelledby="work-title">
    <div className="work-heading"><div><div className="eyebrow"><span/>NA PRÁTICA</div><h2 id="work-title">Trabalhos que contam a história.</h2><p>Equipamentos entregues e serviços realizados pela MAJORNEXO.</p></div><span className="work-total">{publications.length}<small>PUBLICAÇÕES</small></span></div>
    <div className="gallery-tools"><div className="gallery-filters" role="group" aria-label="Filtrar trabalhos">{['todos','manutencao','vendas'].map(key=><button key={key} type="button" aria-pressed={filter===key} onClick={()=>changeFilter(key)}>{key==='todos'?'Todos':names[key]}<span>{key==='todos'?publications.length:publications.filter(p=>p.categories.includes(key)).length}</span></button>)}</div><label className="gallery-search"><span className="sr-only">Buscar trabalhos</span><input type="search" placeholder="Buscar: PC, limpeza, notebook…" value={search} onChange={e=>{setSearch(e.target.value);setLimit(12);}}/></label></div>
    <p className="gallery-note">Vendas registradas no portfólio. Consulte a disponibilidade atual pelo Instagram.</p>
    <div className="work-grid">{visible.slice(0,limit).map(post=><button key={post.id} className="work-card" type="button" onClick={()=>setSelected(post)} aria-label={`Ver detalhes: ${post.title}`}><div className="work-image"><img src={post.image} alt={post.title} loading="lazy" width="600" height="600"/><span className="work-open" aria-hidden="true">↗</span></div><div className="work-card-copy"><div className="work-categories">{post.categories.map(c=><span key={c}>{names[c]}</span>)}</div><h3>{post.title}</h3><span className="work-detail">Ver trabalho <span>↗</span></span></div></button>)}</div>
    {!visible.length&&<p className="gallery-empty">Nenhum trabalho encontrado. Tente outro termo.</p>}
    <div className="gallery-bottom"><span aria-live="polite">{Math.min(limit,visible.length)} de {visible.length} publicações</span>{limit<visible.length&&<button type="button" className="explore" onClick={()=>setLimit(visible.length)}>Mostrar todas as publicações <span>↓</span></button>}</div>
    <dialog ref={dialog} className="work-dialog" onClose={()=>setSelected(null)} onClick={e=>{if(e.target===dialog.current)dialog.current.close();}} aria-labelledby="work-dialog-title">{selected&&<><button type="button" className="dialog-close" onClick={()=>dialog.current.close()} aria-label="Fechar detalhes">×</button><img src={selected.image} alt={selected.title}/><div className="dialog-copy"><div className="work-categories">{selected.categories.map(c=><span key={c}>{names[c]}</span>)}</div><h3 id="work-dialog-title">{selected.title}</h3><p>{selected.caption}</p><a className="project-link" href={selected.url} target="_blank" rel="noopener noreferrer">Ver publicação completa no Instagram <span>↗</span></a></div></>}</dialog>
  </section>;
}
