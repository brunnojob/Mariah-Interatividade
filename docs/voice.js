'use strict';
/* Device voices only. This module does not call a text-to-speech endpoint. */
window.MariahVoice=(()=>{
 const synth=window.speechSynthesis;
 let voices=[],generation=0,utterance=null,timer=null;
 let preference={voice:'auto',rate:.96,volume:.45};
 try{const saved=JSON.parse(localStorage.getItem('mariah-voice-v2')||'null');if(saved&&typeof saved==='object'){if(typeof saved.voice==='string')preference.voice=saved.voice;if(Number.isFinite(saved.rate)&&saved.rate>=.85&&saved.rate<=1.08)preference.rate=saved.rate;if(Number.isFinite(saved.volume)&&saved.volume>=0&&saved.volume<=.7)preference.volume=saved.volume;}}catch{}
 const female=/francisca|thalita|luana|luciana|let[ií]cia|helena|helo[ií]sa|raquel|paloma|maria|vitoria|vit[oó]ria|fernanda|catarina|joana|ines|inês/i;
 const male=/antonio|ant[oô]nio|duarte|daniel|jo[aã]o|felipe|f[aá]bio|ricardo|henrique|cristiano/i;
 const natural=/natural|neural|enhanced|premium|aprimorada|aprimorado/i;
 const language=v=>(v.lang||'').toLowerCase().replace('_','-');
 function score(v){return (language(v)==='pt-br'?300:0)+(female.test(v.name)?130:0)+(natural.test(v.name)?250:0)+(/google/i.test(v.name)?20:0)+(v.default?3:0)-(male.test(v.name)?180:0);}
 function chosen(){return voices.find(v=>v.voiceURI===preference.voice)||voices[0]||null;}
 function save(){try{localStorage.setItem('mariah-voice-v2',JSON.stringify(preference));}catch{}}
 function stop(){generation++;clearTimeout(timer);timer=null;utterance=null;if(synth)synth.cancel();}
 function info(){const node=document.querySelector('#voice-info');if(!node)return;const voice=chosen();if(!synth){node.textContent='A voz não está disponível neste navegador. Você pode ler as frases em voz alta.';return;}if(!voice){node.textContent='As vozes ainda não apareceram neste aparelho. Aguarde um instante e toque em “Ouvir amostra”.';return;}node.textContent=`Voz escolhida: ${voice.name}. ${female.test(voice.name)?'Preferência por voz feminina aplicada. ':''}${natural.test(voice.name)?'O aparelho oferece esta voz em qualidade natural.':'A qualidade depende das vozes instaladas no aparelho; você pode experimentar outra opção.'}`;}
 function refresh(){if(!synth)return;voices=synth.getVoices().filter(v=>language(v).startsWith('pt')).sort((a,b)=>score(b)-score(a)||a.name.localeCompare(b.name));const select=document.querySelector('#voice-choice');if(select){select.replaceChildren();const auto=document.createElement('option');auto.value='auto';auto.textContent='Automática · preferir feminina natural';select.append(auto);for(const v of voices){const option=document.createElement('option');option.value=v.voiceURI;option.textContent=v.name+' · '+(language(v)==='pt-br'?'Brasil':'Portugal');select.append(option);}select.value=voices.some(v=>v.voiceURI===preference.voice)?preference.voice:'auto';}info();}
 function speak(text,status){
 stop();refresh();const run=generation;
 if(!synth||!window.SpeechSynthesisUtterance){status.textContent='Este navegador não oferece voz. Você pode ler a frase com a sua própria voz.';return;}
 const voice=chosen();if(!voice){status.textContent='Ainda não há uma voz em português disponível. Aguarde um instante e tente de novo; você também pode ler a frase em voz alta.';return;}
 const u=new SpeechSynthesisUtterance(String(text).replace(/\bMariah\b/giu,'Mariá'));utterance=u;u.voice=voice;u.lang=voice.lang||'pt-BR';u.rate=preference.rate;u.pitch=1;u.volume=preference.volume;
 u.onstart=()=>{if(run!==generation)return;clearTimeout(timer);status.textContent='Ouvindo com uma voz suave. Depois, deixe um espacinho para a Mariah responder.';};
 u.onend=()=>{if(run!==generation)return;clearTimeout(timer);utterance=null;status.textContent='Agora é a sua vez: converse, imite o som e espere a resposta dela.';};
 u.onerror=()=>{if(run!==generation)return;clearTimeout(timer);utterance=null;status.textContent='Essa voz não ficou disponível. Experimente outra em “Uma voz para a Mariah” ou leia a frase em voz alta.';};
 try{synth.speak(u);timer=setTimeout(()=>{if(run===generation&&!synth.speaking){stop();status.textContent='A voz não começou. Experimente outra voz ou toque novamente em ouvir.';}},7000);}catch{stop();status.textContent='Não foi possível ouvir essa voz. Experimente outra opção de voz neste aparelho.';}
 }
 function setup(){const box=document.querySelector('#voice-controls');if(!box)return;const rate=document.querySelector('#voice-rate'),volume=document.querySelector('#voice-volume');rate.value=String(preference.rate);volume.value=String(Math.round(preference.volume*100));document.querySelector('#voice-volume-value').textContent=volume.value+'%';
 document.querySelector('#voice-choice').onchange=e=>{stop();preference.voice=e.target.value;save();info();};
 rate.onchange=()=>{stop();preference.rate=Number(rate.value);save();};
 volume.oninput=()=>{stop();preference.volume=Number(volume.value)/100;document.querySelector('#voice-volume-value').textContent=volume.value+'%';save();};
 document.querySelector('#voice-preview').onclick=()=>{if(typeof stopMusic==='function')stopMusic();if(typeof stopPlaySounds==='function')stopPlaySounds();speak('Oi, Mariah! Vamos descobrir as cores? Olha a bola azul! Agora é a sua vez.',document.querySelector('#voice-preview-status'));};
 document.querySelector('#voice-stop').onclick=()=>{stop();document.querySelector('#voice-preview-status').textContent='Amostra pausada.';};refresh();
 }
 if(synth){synth.addEventListener('voiceschanged',refresh);synth.getVoices();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
 window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 return {speak,stop,refresh};
})();
