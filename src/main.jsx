import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { StructureFlowCollection } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import './style.css';
import AssistanceGallery from './AssistanceGallery';
import MajorEmblem from './MajorEmblem';
import githubProjects from './data/github-projects.json';
import SystemsShowcase from './SystemsShowcase';

export function Scene() {
  return <div className="shader-frame"><StructureFlowCollection variant="ember-storm" hue={0} saturation={1.00} brightness={1.00}/></div>;
}

function NexoScroll() {
  const frame = useRef(null);
  useEffect(() => {
    const host = frame.current;
    const observer = new ResizeObserver(([entry]) => host.style.setProperty('--nexo-scale', entry.contentRect.width / 1264));
    observer.observe(host);
    return () => observer.disconnect();
  }, []);
  return <div ref={frame} className="nexo-live-window"><iframe src="/projects/nexo/live/index.html" title="NEXO — demonstração da rolagem e animações originais" tabIndex={-1} sandbox="allow-scripts allow-same-origin"/></div>;
}

function App() {
  return <div className="site">
    <div className="background" aria-hidden="true"><Scene/></div>
    <div className="content">
      <header><a className="brand" href="#inicio" aria-label="MAJORNEXO — início"><span className="brand-mark">M<span>↗</span></span>MAJORNEXO<span className="brand-dot">.</span></a><a className="header-note" href="#sistemas">EXPLORE OS PROJETOS ↗</a></header>
      <main id="inicio">
        <div className="hero-copy">
        <div className="eyebrow"><span/>DESENVOLVIMENTO WEB · PORTFÓLIO</div>
        <h1>Seu próximo<br/>passo começa<br/><em>com tecnologia.</em></h1>
        <p>Sites que dão vida à sua marca.<br className="desktop-break"/> Design, navegação e experiências feitas para conectar.</p>
        <a className="explore" href="#sistemas">Conheça meu trabalho <span>↗</span></a>
        </div>
        <MajorEmblem/>
      </main>
      <SystemsShowcase/>
      <section className="portfolio" id="projetos" aria-labelledby="portfolio-title">
        <div className="portfolio-heading"><div><div className="eyebrow"><span/>PROJETOS SELECIONADOS</div><h2 id="portfolio-title">Ideias que ganharam vida.</h2></div><span className="project-count">02 / WEB</span></div>
        <article className="project" aria-labelledby="dacruz-title">
          <div className="project-stage">
            <div className="browser-mockup">
              <div className="browser-bar"><span className="browser-dots" aria-hidden="true"><i/><i/><i/></span><span className="browser-address">dacruzdoces.com.br/site</span><span className="browser-arrow" aria-hidden="true">↗</span></div>
              <video className="project-video" src="/projects/dacruz/tour.mp4" poster="/projects/dacruz/poster.jpg" autoPlay={!window.matchMedia('(prefers-reduced-motion: reduce)').matches} muted loop playsInline disablePictureInPicture disableRemotePlayback preload="metadata" aria-label="Demonstração visual do site DaCruz Doces: apresentação, história, clube, cardápio e encomendas"/>
            </div>
            <div className="stage-caption"><span>DACRUZ DOCES</span><span>UM DOCE JEITO DE CELEBRAR.</span></div>
          </div>
          <div className="project-summary"><div className="project-title"><span className="number">03 / CONFEITARIA</span><h3 id="dacruz-title">DaCruz Doces<span>.</span></h3><div className="project-tags"><span>Site comercial</span><span>Cardápio digital</span></div></div><div className="project-description"><p>Uma presença digital para uma confeitaria artesanal, com a delicadeza e o afeto da marca em cada seção. O site apresenta a história da DaCruz, os doces e sobremesas e os planos do Clube Da Cruz.</p><p>O cardápio organiza os produtos e suas opções, enquanto a área de pedidos aproxima o visitante da próxima encomenda.</p><a className="project-link" href="https://www.dacruzdoces.com.br/site" target="_blank" rel="noopener noreferrer">Visitar o site <span>↗</span></a></div></div>
        </article>
        <article className="project project-nexo" id="projeto-nexo" aria-labelledby="nexo-title">
          <div className="project-stage">
            <div className="browser-mockup">
              <div className="browser-bar"><span className="browser-dots" aria-hidden="true"><i/><i/><i/></span><span className="browser-address">apresentacao.nexos.log.br</span><span className="browser-arrow" aria-hidden="true">↗</span></div>
              <NexoScroll/>
            </div>
            <div className="stage-caption"><span>ECOSSISTEMA NEXO</span><span>CONEXÕES EM MOVIMENTO.</span></div>
          </div>
          <div className="project-summary"><div className="project-title"><span className="number">04 / TECNOLOGIA</span><h3 id="nexo-title">Ecossistema NEXO<span>.</span></h3><div className="project-tags"><span>Site de apresentação</span><span>Experiência interativa</span></div></div><div className="project-description"><p>Uma apresentação digital que conecta pessoas, oportunidades e inteligência. A jornada percorre os produtos NEXO CRM, NEXO Leads e NEXO HUMAN, mostrando como cada um participa do mesmo ecossistema.</p><p>A identidade em verde, as composições de partículas e a navegação por etapas traduzem a ideia de conexões em movimento. Ao final, o visitante encontra os acessos aos três produtos.</p><a className="project-link" href="https://apresentacao.nexos.log.br/" target="_blank" rel="noopener noreferrer">Visitar o site <span>↗</span></a></div></div>
        </article>
      </section>
      <section className="github-section" aria-labelledby="github-title"><div><div className="eyebrow"><span/>POR TRÁS DOS PROJETOS</div><h2 id="github-title">Ideias em código.</h2><p>Explore meus repositórios públicos e acompanhe meu trabalho no GitHub.</p></div><a className="explore" href="https://github.com/431369" target="_blank" rel="noopener noreferrer">Conheça meu GitHub <span>↗</span></a></section>
      <div className="github-grid" aria-label="Projetos no GitHub">{githubProjects.map((project,index)=><a className="github-project" key={project.slug} href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} — abrir no GitHub`}><div className="github-project-top"><span>{String(index+1).padStart(2,'0')} / PROJETO</span><span aria-hidden="true">↗</span></div><h3>{project.name}</h3><p>{project.description}</p><span className="github-stack">{project.stack}</span><span className="github-project-cta">{project.publicSource?'Explorar código no GitHub':'Conhecer projeto no GitHub'} <span aria-hidden="true">↗</span></span></a>)}</div>
      <section className="assistance" id="manutencao" aria-labelledby="assistance-title">
        <div className="assistance-copy"><div className="eyebrow"><span/>MANUTENÇÃO TÉCNICA & VENDAS</div><h2 id="assistance-title">Tecnologia que funciona.<br/><em>Cuidado que faz a diferença.</em></h2><p>Meu trabalho também vai além dos sites. Acompanhe a manutenção técnica de computadores e as novidades de vendas no Instagram da MAJORNEXO.</p><div className="project-tags"><span>Manutenção de computadores</span><span>Vendas</span></div></div>
        <a className="instagram-card" href="https://www.instagram.com/majornexo/" target="_blank" rel="noopener noreferrer" aria-label="Ver manutenção técnica e vendas no Instagram @majornexo (abre em nova aba)"><div className="instagram-card-top"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg><span>↗</span></div><span className="instagram-label">MAJORNEXO</span><strong>@majornexo</strong><p>Manutenção técnica e vendas.<br/>Conheça meu trabalho no Instagram.</p><span className="instagram-cta">Visitar Instagram <span>↗</span></span></a>
      </section>
      <AssistanceGallery/>
      <footer><span>MAJORNEXO © {new Date().getFullYear()}</span><span>WEB + ASSISTÊNCIA TÉCNICA</span></footer>
    </div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);





