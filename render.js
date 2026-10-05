/* ================= FUNCIONAMIENTO ================= */
const $ = s => document.querySelector(s);
const text = (tag, content, cls) => {const el=document.createElement(tag);el.textContent=content;if(cls)el.className=cls;return el;};
const safeUrl = value => {try {const u=new URL(String(value||'').trim(),location.href);return u.protocol==='http:'||u.protocol==='https:'?u.href:'';}catch{return '';}};
document.querySelectorAll('[data-club]').forEach(el=>el.textContent=clubData.nombre);
document.title=clubData.nombre+' | El fútbol nos juntó';
document.querySelector('meta[property="og:title"]').content=document.title;
document.querySelector('meta[name="description"]').content=clubData.nombre+': amigos dentro y fuera del campo. Conoce nuestra historia, plantilla y equipación.';
$('#team-schema').textContent=JSON.stringify({'@context':'https://schema.org','@type':'SportsTeam',name:clubData.nombre,sport:'Fútbol',description:'Equipo amateur de amigos que se conocieron jugando al fútbol.'});
$('#year').textContent=new Date().getFullYear();
document.querySelectorAll('img[data-brand-logo]').forEach(img=>img.src=LOGOS.claro);
document.querySelectorAll('img[data-brand-blanco]').forEach(img=>img.src=LOGOS.blanco);
const sections=[...document.querySelectorAll('main section[data-nav]')];
sections.forEach(section=>{const a=text('a',section.dataset.nav);a.href='#'+section.id;$('#navigation').append(a);});
const menu=$('#menu-toggle'), nav=$('#navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('header'))closeMenu();});
window.matchMedia('(min-width:769px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
let revealObserver=null;
function reveal(){
  const targets=[...document.querySelectorAll('.reveal')];
  if(!targets.length)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced||!('IntersectionObserver' in window)){targets.forEach(el=>el.classList.add('visible'));return;}
  document.documentElement.classList.add('motion');
  if(!revealObserver){
    revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -5% 0px'});
  }
  targets.forEach(el=>{if(!el.classList.contains('visible'))revealObserver.observe(el);});
}
const silhouette='<svg viewBox="0 0 160 190" aria-hidden="true" fill="currentColor"><circle cx="80" cy="49" r="27"/><path d="M52 81 20 96 5 143l27 10 12-29-3 66h78l-3-66 12 29 27-10-15-47-32-15c-14 12-42 12-56 0Z"/></svg>';
function renderPlayers(position='Todos'){
  const grid=$('#players');grid.replaceChildren();
  const players=plantilla.filter(p=>position==='Todos'||p.posicion===position);
  players.forEach(p=>{const card=document.createElement('article');card.className='player';const art=document.createElement('div');art.className='player-art';art.innerHTML=silhouette;
    const initials=text('span',p.nombre.split(' ').map(n=>n[0]).slice(0,2).join(''),'player-initials');initials.setAttribute('aria-hidden','true');art.append(initials);
    if(p.foto&&safeUrl(p.foto)){const image=new Image();image.alt='Retrato de '+p.nombre;image.loading='lazy';image.src=safeUrl(p.foto);image.addEventListener('error',()=>image.remove());art.append(image);}
    const number=text('span',String(p.dorsal).padStart(2,'0'),'player-number');number.setAttribute('aria-label','Dorsal '+p.dorsal);art.append(number);
    const info=document.createElement('div');info.className='player-info';info.append(text('h3',p.nombre),text('p',p.posicion));card.append(art,info);
    if(p.liga&&safeUrl(p.liga)){card.dataset.league=safeUrl(p.liga);card.dataset.name=p.nombre;}
    grid.append(card);
  });
  const count=$('#player-count');
  if(count)count.textContent=players.length+' '+(players.length===1?'jugador':'jugadores')+(position==='Todos'?'':' · '+position);
  linkLeagueCards();
}
function linkLeagueCards(){
  const cards=[...document.querySelectorAll('.player[data-league]')];
  cards.forEach(card=>{
    if(card.querySelector('.player-link'))return;
    const a=document.createElement('a');
    a.className='player-link';
    a.href=card.dataset.league;
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.setAttribute('aria-label','Ver estadísticas de '+card.dataset.name+' en '+ligaLabel);
    a.textContent='Sus números en la liga ↗';
    card.append(a);
    card.classList.add('has-league');
  });
  const counter=$('#liga-linked');
  if(counter)counter.textContent=String(cards.length);
  const box=$('#league-summary');
  if(box){const p=box.querySelector('[data-league-count]');if(p)p.textContent=cards.length+' de '+plantilla.length;}
}
const filtersBox=$('#filters');
if(filtersBox){
  ['Todos',...new Set(plantilla.map(p=>p.posicion))].forEach((position,index)=>{
    const button=text('button',position,'filter');button.type='button';
    button.setAttribute('aria-pressed',String(index===0));
    button.addEventListener('click',()=>{
      document.querySelectorAll('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      renderPlayers(position);
    });
    filtersBox.append(button);
  });
}
function formatDate(value){const date=new Date(value+'T12:00:00');return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(date);}
if(partidos.length||resultados.length){
  const container=$('#matches');
  if(container){
    container.replaceChildren();
    [[partidos,'Próximos partidos',false],[resultados,'Últimos resultados',true]].forEach(([items,title,isResult])=>{
      if(!items.length)return;
      container.append(text('h3',title,'match-group-title'));
      const list=document.createElement('div');list.className='match-list';
      [...items].sort((a,b)=>isResult?b.fecha.localeCompare(a.fecha):a.fecha.localeCompare(b.fecha)).forEach(m=>{
        const row=document.createElement('article');row.className='match-row';
        row.append(text('span',formatDate(m.fecha)+(m.hora?' · '+m.hora:'')),text('strong',clubData.nombre+' / '+m.rival),text('span',isResult?m.marcador:[m.competicion,m.lugar].filter(Boolean).join(' · ')));
        list.append(row);
      });
      container.append(list);
    });
  }
}
if(estadisticas.length&&$('#stats')){$('#stats').hidden=false;estadisticas.forEach(s=>{const card=document.createElement('article');card.className='stat';card.append(text('h3',String(s.valor)),text('p',s.titulo));$('#stats').append(card);});}
[['Instagram',clubData.instagram],['WhatsApp',clubData.whatsapp]].forEach(([name,url])=>{const href=safeUrl(url);if(!href)return;const a=text('a',name+' ↗');a.href=href;a.target='_blank';a.rel='noopener noreferrer';$('#socials').append(a);});
const emailReady=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clubData.email);
if(emailReady){$('#contact-submit').disabled=false;$('#contact-submit').textContent='Preparar correo ↗';$('#contact-note').textContent='Se abrirá tu aplicación de correo. Tendrás que enviarlo desde allí; esta web no guarda tus datos. También puedes escribir a '+clubData.email+'.';}
$('#contact-form').addEventListener('submit',event=>{event.preventDefault();if(!emailReady)return;const name=$('#name').value.trim();const subject=encodeURIComponent('Contacto con '+clubData.nombre+' - '+name);const body=encodeURIComponent('Nombre: '+name+'\nCorreo: '+$('#email').value.trim()+'\n\n'+$('#message').value.trim());location.href='mailto:'+clubData.email+'?subject='+subject+'&body='+body;$('#contact-note').textContent='Se ha solicitado abrir tu aplicación de correo. El mensaje no se envía automáticamente. Si no se abre, escribe a '+clubData.email+'.';});
renderPlayers();
linkLeagueCards();
const sectionObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){nav.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-15% 0px -65% 0px',threshold:0});
sections.forEach(s=>sectionObserver.observe(s));
reveal();
window.addEventListener('load',reveal);
