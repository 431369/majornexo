import React, {useRef, useState, useEffect} from 'react';
import tours from './data/system-tours.json';

const agents=[
 ['Lifa','Coordenação','Entende seu objetivo, escolhe os especialistas, distribui as tarefas e reúne as entregas em um só lugar.'],
 ['Maia','Operações','Consulta pendências do CRM e propõe prioridades, retornos, prazos e responsáveis. Os planos passam por revisão e confirmação antes de alterar registros.'],
 ['Atlas','Engenharia','Estrutura páginas, interfaces, código e integrações, com requisitos e critérios de teste. Código proposto continua sujeito a validação técnica.'],
 ['Íris','Conteúdo e vídeo','Planeja textos, legendas, roteiros e campanhas com a linguagem da marca. Seu estúdio organiza cenas, materiais, montagem, versões e revisão de vídeos.'],
 ['Elo','Relacionamento','Ajuda a qualificar oportunidades, preparar respostas e propostas e definir o próximo contato. O atendimento externo depende da conexão autorizada do canal.'],
 ['Prisma','Revisão','Compara a entrega com o pedido, confere fontes e requisitos e aponta lacunas e correções. Uma revisão favorável não substitui a decisão do responsável.'],
];
const modules=[
 ['Início','Resultados do dia, clientes ativos, negociações e tarefas que precisam de atenção.'],
 ['Empresas e filiais','Cadastros, unidades e organização de cada operação, com arquivamento e restauração.'],
 ['Clientes','Contatos, origem, responsável, valores e previsões. Importação de planilhas CSV e exportação dos registros.'],
 ['Ficha e documentos','Histórico de observações, ligações, reuniões e mudanças de etapa; próximos contatos e arquivos vinculados ao cliente.'],
 ['Acompanhar vendas','Funil com as etapas Novo, Contato, Proposta, Ganho e Perdido; atualização da negociação e registro do motivo de perda.'],
 ['Tarefas','Prazos e responsáveis, vínculo com cliente e filial, conclusão, reabertura e avisos de atrasos.'],
 ['Relatórios','Filtros por período, filial, responsável e etapa; conversão, resultados e motivos de perda, com impressão e exportação.'],
 ['Equipe e acessos','Pessoas, perfis e ativação de acesso. A administração da empresa e a operação da filial têm escopos diferentes.'],
 ['Armazenamento','Consulta do espaço usado, limites e arquivos arquivados. Documentos permanecem sujeitos à autorização de acesso.'],
 ['Planos e cobranças','Planos, limites, assinaturas e registros manuais de cobrança e quitação. Não emite Pix, boleto ou cobrança automática no cartão.'],
 ['Atendimento receptivo','Diretrizes de recepção, perguntas de qualificação e encaminhamento humano. WhatsApp, Instagram, Telegram e Facebook dependem de conectores.'],
 ['Integrações','Atalhos para abrir WhatsApp e e-mail pela ficha, conforme configuração. As tarefas podem ser exportadas para um calendário .ics.'],
 ['Meu perfil','Atualização dos próprios contatos e fluxo de recuperação de acesso.'],
 ['Segurança e backups','Sessões, controle de acesso, auditoria administrativa e cópias de segurança; arquivamento preserva os registros.'],
];

function Preview({system,label}){
 const ref=useRef(null); const [paused,setPaused]=useState(false);
 useEffect(()=>{const video=ref.current;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced){setPaused(true);return;}const observer=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!video.dataset.userPaused)video.play().catch(()=>{});else video.pause();},{threshold:.15});observer.observe(video);return()=>observer.disconnect();},[]);
 return <div className="tour-preview"><video ref={ref} className="system-tour-video" src={`/projects/${system}/preview.mp4`} poster={`/projects/${system}/poster.jpg`} muted loop playsInline preload="metadata" aria-label={`Prévia das telas reais de ${label}`}/><button className="tour-toggle" aria-label={`${paused?'Reproduzir':'Pausar'} prévia de ${label}`} onClick={()=>{let v=ref.current;if(v.paused){delete v.dataset.userPaused;v.play().catch(()=>{});setPaused(false);}else{v.dataset.userPaused='1';v.pause();setPaused(true);}}}>{paused?'Reproduzir prévia':'Pausar prévia'}</button></div>;
}
function FullTour({system,label}){
 const ref=useRef(null);const data=tours[system];const [active,setActive]=useState(0);
 return <details className="full-tour" onToggle={e=>{if(!e.currentTarget.open)ref.current?.pause();}}><summary>Ver tour completo · {data.screenCount} telas <span aria-hidden="true">＋</span></summary><div className="full-tour-body"><p>Escolha um capítulo ou assista à sequência. Capturas reais com dados de demonstração e contatos ocultos, organizadas para apresentação. Sem áudio.</p><video ref={ref} controls playsInline preload="none" poster={`/projects/${system}/poster.jpg`} src={`/projects/${system}/tour.mp4`} aria-label={`Tour completo de ${label}`} onTimeUpdate={()=>{let time=ref.current.currentTime;setActive(Math.max(0,data.chapters.findLastIndex(c=>c.start<=time)));}}/><nav className="tour-chapters" aria-label={`Capítulos do tour de ${label}`}>{data.chapters.map((c,i)=><button key={c.title} aria-current={active===i?'true':undefined} onClick={()=>{ref.current.currentTime=c.start;ref.current.play().catch(()=>{});setActive(i);}}><span>{String(i+1).padStart(2,'0')}</span>{c.title}</button>)}</nav></div></details>;
}
function Product({system,label,number,category,children}){
 return <article className="project system-project" aria-labelledby={`${system}-title`}><div className="project-stage"><div className="browser-mockup"><div className="browser-bar"><span className="browser-dots" aria-hidden="true"><i/><i/><i/></span><span className="browser-address">{system}.nexos.log.br</span><span className="browser-arrow" aria-hidden="true">↗</span></div><Preview system={system} label={label}/></div><div className="stage-caption"><span>{label.toUpperCase()}</span><span>TELAS REAIS · PRÉVIA EM MOVIMENTO</span></div></div><div className="project-summary"><div className="project-title"><span className="number">{number} / {category}</span><h3 id={`${system}-title`}>{label}<span>.</span></h3><a className="project-link" href={`https://${system}.nexos.log.br/`} target="_blank" rel="noopener noreferrer">Acessar {system==='crm'?'o CRM':'a LIFA'} <span aria-hidden="true">↗</span></a></div><div className="project-description">{children}</div></div><FullTour system={system} label={label}/></article>;
}
export default function SystemsShowcase(){
 return <section className="systems-section" id="sistemas" aria-labelledby="systems-title"><div className="portfolio-heading"><div><div className="eyebrow"><span/>CRM + INTELIGÊNCIA ARTIFICIAL</div><h2 id="systems-title">Sua operação. Mais conectada.</h2></div><span className="project-count">02 / SISTEMAS</span></div><p className="systems-intro">O CRM organiza a relação com cada cliente. A LIFA usa o contexto autorizado da empresa para transformar pedidos em planos, conteúdos e entregas revisáveis. Você acompanha o trabalho e decide o próximo passo.</p>
 <Product system="crm" label="LIFA CRM" number="01" category="GESTÃO COMERCIAL"><p>Da primeira conversa ao acompanhamento da venda: contatos, histórico, documentos, tarefas e relatórios ficam conectados. Cada empresa organiza suas filiais, sua equipe e seus acessos.</p><p>O painel mostra o que precisa de atenção; a ficha mantém a memória do relacionamento; o funil acompanha a negociação. Os relatórios ajudam a comparar períodos, unidades e responsáveis.</p></Product>
 <details className="feature-details"><summary>Explore todos os módulos do CRM <span aria-hidden="true">＋</span></summary><div className="feature-grid">{modules.map(([name,text])=><article key={name}><h4>{name}</h4><p>{text}</p></article>)}</div></details>
 <Product system="lifa" label="LIFA" number="02" category="CENTRO DE COMANDO"><p>Você descreve um objetivo por texto ou usa a interface de voz. A Lifa coordena os especialistas, combina métodos e memória da empresa e mantém as entregas, versões e eventos no mesmo ambiente.</p><p>Na prática, um pedido pode virar um plano de acompanhamento com Maia, uma proposta com Elo, conteúdo com Íris ou uma solução técnica com Atlas. Prisma revisa os critérios antes de você decidir como seguir.</p><p>A conexão de IA, as cotas e os recursos de voz e mídia dependem da configuração do provedor e do ambiente. Ter uma tela disponível não significa que todos os serviços externos estejam conectados.</p></Product>
 <div className="agents-heading"><div className="eyebrow"><span/>CONHEÇA A EQUIPE</div><h3>Seis papéis. Um objetivo em comum.</h3></div><div className="agent-feature-grid">{agents.map(([name,role,text],i)=><article key={name}><span className="number">0{i+1} / {role.toUpperCase()}</span><h4>{name}</h4><p>{text}</p></article>)}</div>
 <details className="feature-details"><summary>O que mais existe dentro da LIFA <span aria-hidden="true">＋</span></summary><div className="feature-grid">
 <article><h4>Memória e métodos</h4><p>Perfil da empresa, público, ofertas, linguagem, metas e decisões. A biblioteca reúne 31 métodos, e a equipe aceita especialistas personalizados com missão e limites definidos.</p></article>
 <article><h4>Planos e ciclo comercial</h4><p>Maia prepara ações para revisão e confirmação. Propostas comerciais e páginas de captura organizam o caminho até o acompanhamento do lead no CRM.</p></article>
 <article><h4>Estúdio Íris</h4><p>Ideia, roteiro, materiais e voz, montagem e revisão. Canais e marcas guardam a direção editorial; cenas, biblioteca, formatos e versões organizam a produção. Geração de imagem, voz e publicação exigem os respectivos recursos configurados.</p></article>
 <article><h4>Edição pré-programada</h4><p>Cortes por intervalo, Shorts verticais, vídeos longos e padrões editáveis. Comandos por texto ou fala preparam propostas; a galeria permite revisar, aprovar ou pedir ajustes na versão escolhida. A análise automática completa de gameplay ainda não está habilitada nesse módulo.</p></article>
 <article><h4>Histórico e revisão</h4><p>Eventos, fontes e versões dão contexto à entrega. Prisma organiza requisitos e rodadas de correção; aprovar um conteúdo não equivale a publicá-lo nem comprova testes técnicos.</p></article>
 <article><h4>Controles e conexões</h4><p>Limites, pausas, permissões e diagnóstico do ambiente. Atendimento Elo tem configuração do canal, qualificação e encaminhamento humano. Cada canal precisa de conexão autorizada antes de operar.</p></article>
 </div></details>
 <div className="ecosystem-flow" aria-label="Fluxo de trabalho integrado"><span>Seu objetivo</span><b aria-hidden="true">→</b><span>Lifa e especialistas</span><b aria-hidden="true">→</b><span>Revisão e decisão</span><b aria-hidden="true">→</b><span>Registro autorizado no CRM</span></div><p className="systems-footnote">As prévias mostram as interfaces disponíveis em outubro de 2026. Valores do CRM são de demonstração. Pagamentos, mensagens e publicações só acontecem pelos fluxos e integrações correspondentes; a aprovação de uma entrega, sozinha, não executa essas ações.</p>
 </section>;
}
