'use strict';
const animals=[['gato','Gato','Miau!'],['cachorro','Cachorro','Au, au!'],['vaca','Vaca','Muuu!'],['pato','Pato','Quá, quá!'],['ovelha','Ovelha','Bééé!'],['pintinho','Pintinho','Piu, piu!']];
const story=[{image:'barco',title:'O barquinho da Mariah',text:'Um barquinho azul passeava bem devagar. A Mariah e seu tio olhavam a água. “Olha o barco!”, disse o tio.',prompt:'Faça um balanço suave com a sua mão e espere o olhar ou um som dela.'},{image:'peixe',title:'Uma visita na água',text:'Perto do barco apareceu um peixinho. Ele passou de um lado para o outro. “Olá, peixinho!”, disseram juntos.',prompt:'Mova a mão devagar e converse sobre o peixe. Não é preciso acompanhar um caminho.'},{image:'sol',title:'Uma pausa com carinho',text:'O sol apareceu e o barquinho parou. Era hora de um abraço, de descansar e de descobrir o mundo juntinhos.',prompt:'Terminem com um abraço, se ela quiser. A história acabou; não há próxima história automática.'}];
let playMode='animals';
let storyIndex=0;
let peekOpen=false;
let paintColor='#e7b54f';
let playGeneration=0;
let audioContext;
const liveOscillators=new Set();
function stopPlaySounds(){playGeneration++;stopAudio();if(typeof speechTimer!=='undefined')clearTimeout(speechTimer);for(const osc of liveOscillators){try{osc.stop();}catch{}}liveOscillators.clear();}
function illustration(name,alt,extra=''){return `<img src="assets/illustrations/${name}.svg" alt="${alt}" width="260" height="240" ${extra}>`;}
function renderPlay(){
 stopPlaySounds();const stage=$('#play-stage');
 document.querySelectorAll('[data-play]').forEach(b=>{const on=b.dataset.play===playMode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 if(playMode==='animals')stage.innerHTML=`<div class="play-heading"><h3>Quem mora aqui?</h3><p>Escolha um bichinho. O adulto nomeia, imita o som e espera uma resposta.</p></div><div class="animal-grid">${animals.map(([id,name],i)=>`<button data-animal="${i}" aria-label="Conhecer ${name.toLowerCase()}">${illustration(id,name)}<strong>${name}</strong></button>`).join('')}</div>`;
 if(playMode==='music')stage.innerHTML=`<div class="play-heading"><h3>Uma nota, uma pausa.</h3><p>Ative os sons e escolha uma tecla. São notas suaves, sem música contínua. O adulto pode cantar junto.</p></div><div class="piano">${['Dó','Ré','Mi','Sol','Lá'].map((n,i)=>`<button data-note="${i}" style="--key-color:${['#e5a18b','#e5c76d','#a5c29a','#9bbfce','#c4acd1'][i]}" aria-label="Tocar ${n}"><span>${['☀','✿','○','△','★'][i]}</span>${n}</button>`).join('')}</div><p class="play-prompt">Tocou uma nota? Espere. Sua voz e o silêncio fazem parte da brincadeira.</p>`;
 if(playMode==='peek')stage.innerHTML=`<div class="play-heading"><h3>Cadê o ursinho?</h3><p>Uma surpresa a cada ação do adulto. Sem cronômetro e sem sustos.</p></div><div class="peek-scene" aria-live="polite">${peekOpen?illustration('urso','Ursinho apareceu!'):'<div class="peek-cover" aria-label="Ursinho escondido atrás de uma cortina ilustrada">?<span>cadê?</span></div>'}</div><button class="button" id="peek-button">${peekOpen?'Esconder o ursinho':'Revelar o ursinho'}</button><p>Faça o mesmo com o seu rosto e suas mãos, se ela gostar.</p>`;
 if(playMode==='story'){const p=story[storyIndex];stage.innerHTML=`<div class="story-page">${illustration(p.image,p.title)}<div><p class="eyebrow">PÁGINA ${storyIndex+1} DE ${story.length}</p><h3>${p.title}</h3><p>${p.text}</p><p class="play-prompt">${p.prompt}</p><div class="actions"><button id="story-back" class="outline" ${storyIndex===0?'disabled':''}>Anterior</button><button id="story-read" class="button">Ouvir esta página</button><button id="story-next" class="outline" ${storyIndex===story.length-1?'disabled':''}>Próxima</button></div><button id="story-print" class="text-button">Imprimir a história completa</button></div></div>`;}
 if(playMode==='paint'){paintColor='#e7b54f';}
 if(playMode==='paint')stage.innerHTML=`<div class="play-heading"><h3>Uma casinha cheia de cores.</h3><p>O adulto escolhe uma cor e toca numa parte do desenho. Sem linhas certas, erros ou pontuação.</p></div><div class="paint-layout"><div><div class="palette" role="group" aria-label="Cor para pintar">${[['Amarelo','#e7b54f'],['Azul','#79b3ce'],['Verde','#8db58e'],['Rosa','#dca0b2'],['Laranja','#e8a06a'],['Branco','#ffffff']].map(([name,color])=>`<button data-color="${color}" style="background:${color}" aria-label="Usar ${name.toLowerCase()}" aria-pressed="${paintColor===color}">${name}</button>`).join('')}</div><p id="paint-choice">Cor selecionada: amarelo.</p><button id="paint-reset" class="outline">Recomeçar pintura</button><button id="paint-print" class="outline">Imprimir minha pintura</button></div><svg id="paint-canvas" viewBox="0 0 400 350" role="group" aria-label="Casinha para colorir"><rect width="400" height="350" rx="20" fill="#fbf9f3"/><g stroke="#294d49" stroke-width="4" stroke-linejoin="round"><circle data-paint="Sol" aria-label="Pintar sol" role="button" tabindex="0" cx="325" cy="65" r="35" fill="white"/><path data-paint="Telhado" aria-label="Pintar telhado" role="button" tabindex="0" d="m55 170 140-105 140 105Z" fill="white"/><path data-paint="Parede" aria-label="Pintar parede" role="button" tabindex="0" d="M85 170H305V315H85Z" fill="white"/><rect data-paint="Porta" aria-label="Pintar porta" role="button" tabindex="0" x="175" y="235" width="60" height="80" fill="white"/><rect data-paint="Janela" aria-label="Pintar janela" role="button" tabindex="0" x="110" y="200" width="40" height="40" fill="white"/><path data-paint="Grama" aria-label="Pintar grama" role="button" tabindex="0" d="M30 320H370V342H30Z" fill="white"/></g></svg></div>`;
 $('#play-status').textContent='Escolha uma ação. Pare ou troque de atividade quando quiser.';
}
async function playTone(index){
 const names=['Dó','Ré','Mi','Sol','Lá'];
 $('#play-status').textContent=`${names[index]}. Agora, uma pausa para escutar e conversar.`;
 if(!$('#play-sound').checked){$('#play-status').textContent+= ' Para ouvir a nota, ative os sons desta área.';return;}
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){$('#play-status').textContent='Sons musicais indisponíveis neste navegador. Você pode cantar a nota.';return;}
 stopPlaySounds();const generation=playGeneration;
 try{audioContext??=new Audio();if(audioContext.state==='suspended')await audioContext.resume();if(generation!==playGeneration||!$('#play-sound').checked)return;
 const oscillator=audioContext.createOscillator();const gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.value=[261.63,293.66,329.63,392,440][index];gain.gain.setValueAtTime(0,audioContext.currentTime);gain.gain.linearRampToValueAtTime(.08,audioContext.currentTime+.025);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.65);oscillator.connect(gain);gain.connect(audioContext.destination);liveOscillators.add(oscillator);oscillator.onended=()=>{liveOscillators.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start();oscillator.stop(audioContext.currentTime+.7);
 }catch{$('#play-status').textContent='Não foi possível tocar a nota. Cante suavemente, se quiser.';}
}
function narratePlay(text){if($('#play-sound').checked)speak(text,'#play-status');else $('#play-status').textContent=text+' · Você pode ler ou imitar com a sua voz. Para ouvir, ative os sons desta área.';}
document.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>{playMode=b.dataset.play;renderPlay();});
$('#play-sound').onchange=()=>{stopPlaySounds();$('#play-status').textContent=$('#play-sound').checked?'Sons ativados. Escolha uma imagem ou uma tecla; nada toca automaticamente.':'Sons desligados.';};
$('#play-pause').onclick=()=>{stopPlaySounds();away();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlaySounds();});
$('#quiet').addEventListener('click',stopPlaySounds);
$('#play-stage').addEventListener('click',e=>{
 const animal=e.target.closest('[data-animal]');if(animal){const a=animals[Number(animal.dataset.animal)];narratePlay(`${a[1]}. ${a[2]} Olá, Mariah!`);return;}
 const note=e.target.closest('[data-note]');if(note){playTone(Number(note.dataset.note));return;}
 if(e.target.closest('#peek-button')){peekOpen=!peekOpen;renderPlay();narratePlay(peekOpen?'Achou! O ursinho apareceu.':'Cadê o ursinho?');return;}
 if(e.target.closest('#story-back')){storyIndex=Math.max(0,storyIndex-1);renderPlay();return;}
 if(e.target.closest('#story-next')){storyIndex=Math.min(story.length-1,storyIndex+1);renderPlay();return;}
 if(e.target.closest('#story-read')){narratePlay(story[storyIndex].text);return;}
 if(e.target.closest('#story-print')){printPages(story.map(s=>page(s.title,illustration(s.image,s.title,'class="story-print-image"')+`<p>${s.text}</p><p>${s.prompt}</p>`)).join(''));return;}
 const palette=e.target.closest('[data-color]');if(palette){paintColor=palette.dataset.color;document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b===palette)));$('#paint-choice').textContent='Cor selecionada: '+palette.textContent.toLowerCase()+'.';return;}
 const region=e.target.closest('[data-paint]');if(region){region.setAttribute('fill',paintColor);$('#play-status').textContent=region.dataset.paint+' recebeu uma nova cor.';return;}
 if(e.target.closest('#paint-reset')){document.querySelectorAll('[data-paint]').forEach(p=>p.setAttribute('fill','white'));$('#play-status').textContent='Desenho pronto para recomeçar.';return;}
 if(e.target.closest('#paint-print')){const svg=$('#paint-canvas').cloneNode(true);svg.removeAttribute('id');svg.setAttribute('style','width:100%;height:190mm');svg.querySelectorAll('[data-paint]').forEach(p=>{p.removeAttribute('tabindex');p.removeAttribute('role');});printPages(page('A casinha da Mariah',svg.outerHTML+'<p>Uma pintura compartilhada com o adulto.</p>'));}
});
$('#play-stage').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-paint]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
renderPlay();
