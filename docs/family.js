'use strict';
let songIndex=0,verseIndex=0,musicRun=0,musicContext;
const songNodes=new Set(),songTimers=new Set();
function stopMusic(message='Música pausada. Continue quando quiser.'){
 musicRun++;for(const timer of songTimers)clearTimeout(timer);songTimers.clear();
 for(const oscillator of songNodes){try{oscillator.stop();}catch{}}songNodes.clear();
 document.querySelectorAll('.lyric.active').forEach(l=>l.classList.remove('active'));
 $('#music-play').disabled=false;$('#music-status').textContent=message;
}
function renderSong(){stopMusic('Escolha a melodia ou um verso. Você canta; a Mariah participa no ritmo dela.');verseIndex=0;const song=familySongs[songIndex];$('#song-title').textContent=song.title;$('#song-about').textContent=song.about;$('#song-action').textContent=song.action;$('#song-picture').innerHTML=illustration(song.image,'Ilustração da cantiga '+song.title);$('#song-lyrics').innerHTML=song.lyrics.map((line,i)=>`<p class="lyric" data-verse="${i}">${line}</p>`).join('');document.querySelectorAll('[data-song]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.song)===songIndex)));}
$('#song-list').innerHTML=familySongs.map((song,i)=>`<button data-song="${i}" aria-pressed="false">${illustration(song.image,'')}<span>${song.title}</span></button>`).join('');
$('#song-list').onclick=e=>{const b=e.target.closest('[data-song]');if(b){songIndex=Number(b.dataset.song);renderSong();}};
async function playSong(single=false){
 stopMusic();stopPlaySounds();const run=musicRun;const song=familySongs[songIndex];
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){$('#music-status').textContent='A melodia não está disponível neste navegador. A letra está aqui para você cantar.';return;}
 try{
 musicContext??=new Audio();if(musicContext.state==='suspended')await musicContext.resume();if(run!==musicRun)return;
 const phrases=single?[verseIndex]:[0,1,2,3];const beat=.38,start=musicContext.currentTime+.05;let offset=0;
 const setVerse=i=>{document.querySelectorAll('[data-verse]').forEach(el=>el.classList.toggle('active',Number(el.dataset.verse)===i));$('#music-status').textContent=`Verso ${i+1}: ${song.lyrics[i]}`;};
 for(const phrase of phrases){
  const timer=setTimeout(()=>{songTimers.delete(timer);if(run===musicRun)setVerse(phrase);},offset*1000);songTimers.add(timer);
  for(const semitone of song.notes[phrase]){const osc=musicContext.createOscillator(),gain=musicContext.createGain();const at=start+offset;const volume=Number($('#music-volume').value)/100*.45;osc.type='sine';osc.frequency.value=261.63*Math.pow(2,semitone/12);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.025);gain.gain.linearRampToValueAtTime(0,at+beat*.85);osc.connect(gain);gain.connect(musicContext.destination);songNodes.add(osc);osc.onended=()=>{songNodes.delete(osc);osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+beat);offset+=beat;}
  offset+=.55;
 }
 verseIndex=single?(verseIndex+1)%4:0;$('#music-play').disabled=true;
 const timer=setTimeout(()=>{songTimers.delete(timer);if(run===musicRun)stopMusic('A melodia terminou. Uma pausa para conversar, imitar um som ou descansar.');},(offset+.1)*1000);songTimers.add(timer);
 }catch{stopMusic('Não foi possível tocar a melodia. Você pode cantar usando a letra.');}
}
$('#music-play').onclick=()=>playSong();$('#music-phrase').onclick=()=>playSong(true);$('#music-stop').onclick=()=>stopMusic();
$('#music-volume').oninput=()=>{$('#music-volume-value').textContent=$('#music-volume').value+'%';stopMusic('Volume ajustado. Toque novamente para ouvir.');};
$('#music-print').onclick=()=>{const s=familySongs[songIndex];stopMusic();printPages(page(s.title,`<div class="song-print">${illustration(s.image,s.title)}${s.lyrics.map(l=>`<p>${l}</p>`).join('')}<p>${s.action}</p><p>Cantiga original · para cantar em família.</p></div>`));};
document.addEventListener('click',e=>{if(!e.target.closest('#musicas'))stopMusic('Música pausada. Continue quando quiser.');},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();});
renderSong();

const localToday=new Date();
const pad=n=>String(n).padStart(2,'0');
const todayKey=`${localToday.getFullYear()}-${pad(localToday.getMonth()+1)}-${pad(localToday.getDate())}`;
$('#calendar-month').value=todayKey.slice(0,7);$('#calendar-birth').max=todayKey;
let selectedDay=localToday.getDate();let completion={};let canSave=true;
try{completion=JSON.parse(localStorage.getItem('mariah-family-days-v1')||'{}');if(!completion||Array.isArray(completion)||typeof completion!=='object')completion={};}catch{canSave=false;completion={};}
function parseCalendarMonth(){const v=$('#calendar-month').value;if(!/^\d{4}-\d{2}$/.test(v))return null;const [year,month]=v.split('-').map(Number);if(year<1900||year>2100||month<1||month>12)return null;return {year,month};}
function ageForDate(year,month,day){
 const birth=$('#calendar-birth').value;if(!birth)return Number($('#calendar-age').value);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(birth))return null;
 const [by,bm,bd]=birth.split('-').map(Number);let age=(year-by)*12+month-bm;
 const anniversary=Math.min(bd,new Date(year,month,0).getDate());if(day<anniversary)age--;return age;
}
function dayPlan(year,month,day){const age=ageForDate(year,month,day);const index=((year*12+month+day-1)%dailyIdeas.length+dailyIdeas.length)%dailyIdeas.length;return {idea:dailyIdeas[index],age,key:`${year}-${pad(month)}-${pad(day)}`,eligible:age!==null&&age>=6&&age<=12};}
function dateLabel(year,month,day){return new Date(year,month-1,day,12).toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'});}
function renderCalendar(){
 const value=parseCalendarMonth();if(!value){$('#calendar-status').textContent='Escolha um mês e ano entre 1900 e 2100.';return;}
 const {year,month}=value,days=new Date(year,month,0).getDate(),offset=new Date(year,month-1,1).getDay();selectedDay=Math.min(Math.max(1,selectedDay),days);
 $('#calendar-age').disabled=!!$('#calendar-birth').value;
 $('#calendar-title').textContent=new Date(year,month-1,1,12).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 $('#calendar-status').textContent=($('#calendar-birth').value?'Fase calculada para cada dia. ':'Fase escolhida manualmente. ')+(canSave?'Se marcar uma brincadeira, a marcação fica apenas neste navegador.':'As marcações valem só enquanto a página estiver aberta.');
 $('#calendar-grid').innerHTML='<span class="calendar-empty" aria-hidden="true"></span>'.repeat(offset)+Array.from({length:days},(_,i)=>{const day=i+1,p=dayPlan(year,month,day);return `<button class="calendar-day${day===selectedDay?' selected':''}${completion[p.key]?' enjoyed':''}" data-day="${day}" aria-pressed="${day===selectedDay}" ${p.key===todayKey?'aria-current="date"':''} aria-label="${dateLabel(year,month,day)}: ${p.eligible?p.idea.title:'fora da trilha de 6 a 12 meses'}${completion[p.key]?', brincamos':''}"><span class="day-number">${day}${completion[p.key]?' · ✓':''}</span><span class="day-title">${p.eligible?p.idea.title:'Consultar fase'}</span><span class="day-dot" aria-hidden="true">${p.eligible?'○':'—'}</span></button>`;}).join('');
 renderCalendarDetail();
}
function calendarBody(p){const a=p.idea;return `<p class="tag">${a.kind} · ${p.age} meses · com um adulto</p><h3>${a.title}</h3><h4>O que separar</h4><p>${a.materials}</p><h4>Como brincar</h4><ol>${a.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h4>No ritmo desta fase</h4><p>${dailyAdaptations[p.age]}</p><p class="play-prompt">${a.care} Pause com cansaço ou desinteresse.</p>`;}
function renderCalendarDetail(){const v=parseCalendarMonth();if(!v)return;const p=dayPlan(v.year,v.month,selectedDay);const box=$('#calendar-detail');
 if(!p.eligible){box.innerHTML=`<h3>${dateLabel(v.year,v.month,selectedDay)}</h3><p>Esta data fica fora da trilha de 6 a 12 meses. Para consultar as ideias, apague o aniversário opcional e escolha uma fase manualmente. As atividades não precisam ser seguidas como metas.</p>`;return;}
 box.innerHTML=`<div class="daily-art">${illustration(p.idea.image,p.idea.title)}</div><div><p class="eyebrow">${dateLabel(v.year,v.month,selectedDay)}</p>${calendarBody(p)}<div class="actions"><button id="day-done" class="button" aria-pressed="${!!completion[p.key]}">${completion[p.key]?'Brincamos · desmarcar':'Brincamos juntos hoje'}</button><button id="day-print" class="outline">Imprimir esta brincadeira</button></div><p class="small">Pular, adaptar ou repetir um dia é normal. As marcações não medem desenvolvimento.</p></div>`;
}
$('#calendar-grid').onclick=e=>{const b=e.target.closest('[data-day]');if(b){selectedDay=Number(b.dataset.day);renderCalendar();}};
$('#calendar-detail').onclick=e=>{const v=parseCalendarMonth();if(!v)return;const p=dayPlan(v.year,v.month,selectedDay);if(e.target.closest('#day-done')){if(completion[p.key])delete completion[p.key];else completion[p.key]=true;try{localStorage.setItem('mariah-family-days-v1',JSON.stringify(completion));}catch{canSave=false;}renderCalendar();}if(e.target.closest('#day-print'))printPages(page(dateLabel(v.year,v.month,selectedDay),calendarBody(p),true));};
for(const id of ['calendar-month','calendar-age','calendar-birth'])$('#'+id).onchange=()=>renderCalendar();
function moveCalendar(delta){const v=parseCalendarMonth();if(!v)return;const date=new Date(v.year,v.month-1+delta,1,12);if(date.getFullYear()<1900||date.getFullYear()>2100)return;$('#calendar-month').value=`${date.getFullYear()}-${pad(date.getMonth()+1)}`;renderCalendar();}
$('#calendar-prev').onclick=()=>moveCalendar(-1);$('#calendar-next').onclick=()=>moveCalendar(1);
$('#calendar-print').onclick=()=>{const v=parseCalendarMonth();if(!v)return;const plans=[];const total=new Date(v.year,v.month,0).getDate();for(let day=1;day<=total;day++){const p=dayPlan(v.year,v.month,day);plans.push(`<li><strong>${day}. ${p.eligible?p.idea.title:'Fora da trilha de 6–12 meses'}</strong>${p.eligible?` · ${p.age} meses<br>${p.idea.steps[0]}`:''}</li>`);}const sheets=[];for(let i=0;i<plans.length;i+=10)sheets.push(page('Nosso mês · '+$('#calendar-title').textContent,`<p>Um convite por dia. Adaptar, repetir ou descansar também faz parte. Sempre com um adulto.</p><ul class="month-print-list">${plans.slice(i,i+10).join('')}</ul>`,true));printPages(sheets.join(''));};
renderCalendar();
window.addEventListener('beforeprint',()=>{stopMusic();stopPlaySounds();});
