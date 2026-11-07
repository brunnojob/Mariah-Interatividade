'use strict';
const $ = selector => document.querySelector(selector);
let selectedActivity = null;
let currentTab = 'numbers';
let currentIndex = 0;
let currentCard;
const shapeSvg = (body,outline=false) => `<svg class="shape-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="${outline?'white':'#0e7d7a'}" stroke="${outline?'black':'#0e7d7a'}" stroke-width="3" stroke-linejoin="round">${body}</g></svg>`;
function renderActivities(filter='Todas') {
 $('#activities').innerHTML = activities.map((a,i) => ({...a,i})).filter(a=>filter==='Todas'||a.kind===filter).map(a=>`<button class="activity-card" data-activity="${a.i}"><span class="card-icon" aria-hidden="true">${a.icon}</span><span class="tag">${a.kind} · com um adulto</span><h3>${a.title}</h3><p>${a.intro}</p><span class="card-bottom">Preparar a brincadeira ↗</span></button>`).join('');
}
function detail(a) { return `<h3>O que separar</h3><p>${a.materials}</p><h3>Como brincar</h3><ol>${a.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h3>Cuidado e pausa</h3><p>${a.care}</p><p>Observe o interesse do bebê. Não há tempo mínimo, desafio ou resultado para cumprir.</p>`; }
$('#activities').addEventListener('click',e=>{const button=e.target.closest('[data-activity]');if(!button)return;selectedActivity=activities[Number(button.dataset.activity)];$('#activity-title').textContent=selectedActivity.title;$('#activity-kind').textContent=selectedActivity.kind+' · brincadeira fora da tela';$('#activity-detail').innerHTML=detail(selectedActivity);$('#activity-dialog').showModal();});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderActivities(b.dataset.filter);}));
$('#close-activity').onclick=()=>$('#activity-dialog').close();
function stopAudio(){if('speechSynthesis' in window)window.speechSynthesis.cancel();}
function away(text){stopAudio();$('#activity-dialog').close();$('#away-text').textContent=text||'Escolha um objeto seguro, sente perto e converse com a Mariah. Sua presença é a parte principal.';$('#away-dialog').showModal();}
$('#quiet').onclick=()=>away();
$('#start-activity').onclick=()=>away(selectedActivity.title+'. '+selectedActivity.steps[0]+' '+selectedActivity.care);
$('#return').onclick=()=>$('#away-dialog').close();
function cardAt(tab,i){
 if(tab==='numbers')return {symbol:String(i+1),word:numberWords[i],say:numberWords[i],prompt:i===0?'Mostre um brinquedo grande e diga: “Um brinquedo! Vamos pegar?”':`Conte ${numberWords[i].toLowerCase()} marcas num cartão enquanto conversa. Para brincar, ofereça apenas poucos objetos grandes e seguros.`,print:`<div class="big-letter">${i+1}</div><div class="dots">${'○ '.repeat(i+1)}</div>`};
 if(tab==='letters'){const l=String.fromCharCode(65+i);return {symbol:l,word:`${l} de ${letterWords[i].toLowerCase()}`,say:`${letterNames[i]}. ${letterWords[i]}.`,prompt:`Diga “${letterWords[i]}” devagar, mostre uma imagem ou objeto seguro e espere a resposta da Mariah. Não é preciso reconhecer a letra.`,print:`<div class="big-letter">${l}</div>`};}
 if(tab==='shapes'){const s=shapeItems[i];return {symbol:shapeSvg(s[1]),word:s[0],say:s[0],prompt:s[2],print:shapeSvg(s[1],true),html:true};}
 const c=colorItems[i];return {symbol:`<span class="swatch" style="background:${c[1]}"></span>`,word:c[0],say:c[0],prompt:`Escolha um brinquedo grande na cor ${c[0].toLowerCase()}, nomeie a cor e deixe explorar a textura. Não precisa acertar nem repetir.`,print:`<div class="big-letter" style="font-size:60px">${c[0]}</div><p>O adulto pode colorir este círculo e apresentar um objeto da mesma cor.</p>${shapeSvg('<circle cx="50" cy="50" r="40"/>',true)}`,html:true};
}
function selectCard(i,read=false){currentIndex=i;currentCard=cardAt(currentTab,i);if(currentCard.html)$('#symbol').innerHTML=currentCard.symbol;else $('#symbol').textContent=currentCard.symbol;$('#word').textContent=currentCard.word;$('#prompt').textContent=currentCard.prompt;document.querySelectorAll('[data-key]').forEach(b=>{const selected=Number(b.dataset.key)===i;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});if(read&&$('#sound').checked)speak();}
function renderKeys(){const count={numbers:10,letters:26,shapes:4,colors:6}[currentTab];$('#keys').innerHTML=Array.from({length:count},(_,i)=>{const c=cardAt(currentTab,i);return `<button class="key" data-key="${i}" aria-label="${c.word}" aria-pressed="false">${c.symbol}${c.html?`<small>${c.word}</small>`:''}</button>`;}).join('');selectCard(0);}
$('#keys').onclick=e=>{const b=e.target.closest('[data-key]');if(b)selectCard(Number(b.dataset.key),true);};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{stopAudio();currentTab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderKeys();});
let speechTimer;
function speak(){
 const status=$('#speech-status');
 if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){status.textContent='Este navegador não oferece voz. Leia o exemplo em voz alta para a Mariah.';return;}
 stopAudio();clearTimeout(speechTimer);
 try{const u=new SpeechSynthesisUtterance(currentCard.say);u.lang='pt-BR';u.rate=.8;u.volume=.35;const v=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()==='pt-br');if(v)u.voice=v;
 u.onstart=()=>{clearTimeout(speechTimer);status.textContent='Ouvindo um exemplo curto. Use volume baixo e mantenha o aparelho longe do bebê.';};u.onend=()=>{status.textContent='Agora é a sua vez: repita com a sua voz e guarde o aparelho.';};u.onerror=()=>{clearTimeout(speechTimer);status.textContent='A voz não ficou disponível. Você pode ler o cartão em voz alta.';};window.speechSynthesis.speak(u);speechTimer=setTimeout(()=>{status.textContent='Se não ouviu nada, leia o cartão em voz alta. A disponibilidade da voz depende do navegador.';},5000);
 }catch{status.textContent='Áudio indisponível neste navegador. A sua voz é suficiente.';}
}
$('#speak').onclick=speak;
$('#sound').onchange=()=>{if(!$('#sound').checked)stopAudio();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
function page(title,body,guide=false){return `<section class="print-page${guide?' guide':''}"><p>MARIAH · PEQUENAS DESCOBERTAS</p><h1>${title}</h1>${body}<p>Preparado pelo adulto · brincar juntos, fora da tela.</p></section>`;}
let printing=false;
async function printPages(html){
 if(printing)return;printing=true;stopAudio();
 const area=$('#print-area');area.innerHTML=html;area.removeAttribute('aria-hidden');
 try{await Promise.all(Array.from(area.querySelectorAll('img')).map(img=>img.decode()));window.print();}
 catch{$('#speech-status').textContent='Não foi possível carregar uma imagem para imprimir. Tente novamente ou baixe o SVG.';}
 finally{printing=false;}
}
window.addEventListener('afterprint',()=>{$('#print-area').setAttribute('aria-hidden','true');});
$('#print-card').onclick=()=>printPages(page(currentCard.word,currentCard.print+`<p>${currentCard.prompt}</p>`));
$('#print-activity').onclick=()=>printPages(page(selectedActivity.title,detail(selectedActivity),true));
$('#print-guide').onclick=()=>printPages(page('Guia do cuidador','<p>Prepare uma ideia, guarde o aparelho e brinque com presença. Sem tempo mínimo: pause com cansaço, choro ou desinteresse. Menores de 1 ano: a OMS recomenda evitar telas. De bruços apenas acordado e supervisionado; sono de barriga para cima. Objetos grandes, íntegros, adequados à idade. Alimentação conforme orientação profissional.</p>',true)+activities.map(a=>page(a.title,detail(a),true)).join(''));
function drawingPath(i){return `desenhos/${String(i+1).padStart(2,'0')}.svg`;}
$('#drawings').innerHTML=drawingNames.map((name,i)=>`<article class="drawing-card"><img src="${drawingPath(i)}" alt="${name}, desenho de contorno para imprimir" loading="lazy" width="180" height="150"><h3>${name}</h3><button data-print-drawing="${i}" aria-label="Imprimir ${name.toLowerCase()}">Imprimir ↗</button><a href="${drawingPath(i)}" download="mariah-${i+1}.svg" aria-label="Baixar desenho: ${name}">Baixar SVG</a></article>`).join('');
function drawingPage(i){return page(drawingNames[i],`<img src="${drawingPath(i)}" alt="${drawingNames[i]}"><p>O adulto pode colorir e contar uma história. Mantenha papel e materiais fora da boca.</p>`);}
$('#drawings').onclick=e=>{const b=e.target.closest('[data-print-drawing]');if(b)printPages(drawingPage(Number(b.dataset.printDrawing)));};
$('#print-all').onclick=()=>printPages(drawingNames.map((_,i)=>drawingPage(i)).join(''));
$('#print-alphabet').onclick=()=>printPages(page('Alfabeto para colorir',`<div class="all-letters">${letterWords.map((_,i)=>`<span>${String.fromCharCode(65+i)}</span>`).join('')}</div><p>O adulto nomeia e colore. Reconhecer letras não é uma meta para o bebê.</p>`));
$('#print-numbers').onclick=()=>printPages(page('Números de 1 a 10',`<div class="all-letters all-numbers">${numberWords.map((n,i)=>`<span>${i+1}<small>${n}</small></span>`).join('')}</div><p>O adulto colore e conversa. Contar não é uma meta para o bebê.</p>`));
renderActivities();renderKeys();
