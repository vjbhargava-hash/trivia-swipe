const CATS={"All":["🎲","linear-gradient(160deg,#0f0c29,#302b63,#6d28d9)"],
"Math":["➗","linear-gradient(160deg,#1e3a8a,#3b82f6,#06b6d4)"],
"History":["🏛️","linear-gradient(160deg,#78350f,#b45309,#f59e0b)"],
"Geography":["🌍","linear-gradient(160deg,#064e3b,#059669,#34d399)"],
"Science":["🔬","linear-gradient(160deg,#581c87,#9333ea,#ec4899)"],
"Nature & Animals":["🦁","linear-gradient(160deg,#14532d,#65a30d,#facc15)"],
"Space":["🚀","linear-gradient(160deg,#020617,#1e1b4b,#4338ca)"]};
const $=id=>document.getElementById(id);
let data=[],deck=[],i=0,flipped=false,cur="All";
const shuffle=a=>{for(let k=a.length-1;k>0;k--){const j=Math.random()*(k+1)|0;[a[k],a[j]]=[a[j],a[k]]}return a};
fetch("library.json").then(r=>r.json()).then(d=>{data=d;renderCats()});
function renderCats(){
  $("cats").innerHTML="";document.body.style.setProperty("--g",CATS.All[1]);
  const order=["Math","History","Geography","Science","Nature & Animals","Space","All"];
  for(const c of order){const n=c==="All"?data.length:data.filter(x=>x.category===c).length;
    const b=document.createElement("button");b.className="cat"+(c==="All"?" all":"");b.style.background=CATS[c][1];
    b.innerHTML=`<span class="e">${CATS[c][0]}</span><span>${c==="All"?"All Categories":c}<br><small>${n} questions</small></span>`;
    b.onclick=()=>start(c);$("cats").appendChild(b);}
}
function show(s){document.querySelectorAll(".screen").forEach(e=>e.classList.toggle("active",e.id===s))}
function start(c){cur=c;deck=shuffle(data.filter(x=>c==="All"||x.category===c));i=0;
  document.body.style.setProperty("--g",CATS[c][1]);show("play");render()}
function esc(s){return String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}
function render(){
  const card=$("card");card.classList.remove("flipped");flipped=false;$("doneBox").style.display="none";card.style.display="";
  if(i>=deck.length){$("card").style.display="none";$("doneBox").style.display="flex";$("doneBox").innerHTML=`<div class="done"><div style="font-size:3rem">🎉</div><h2>All done!</h2><p>You went through all ${deck.length} questions.</p><button class="btn primary" onclick="start(cur)">Play again</button></div>`;
    $("progress").textContent=`${deck.length} / ${deck.length}`;return}
  const it=deck[i];$("cat").textContent=it.category;
  for(const id of["diff","diff2"]){$(id).textContent=it.difficulty;$(id).className="badge "+it.difficulty}
  $("q").textContent=it.question;$("a").textContent=it.answer;$("ex").textContent=it.explanation;
  $("progress").textContent=`${i+1} / ${deck.length}`;
}
// i indexes the fixed shuffled deck, so it doubles as the history: prev returns the exact earlier question
function setFlip(v){if(i>=deck.length||flipped===v)return;flipped=v;$("card").classList.toggle("flipped",v)}
const reveal=()=>setFlip(true), unreveal=()=>setFlip(false);
let busy=false;
function go(d){const c=$("card");
  if(busy||(d>0&&i>=deck.length))return;
  if(d<0&&i<=0){c.animate([{transform:"translateY(0)"},{transform:"translateY(24px)"},{transform:"translateY(0)"}],{duration:300,easing:"ease-out"});return}
  busy=true;c.style.transform=`translateY(${d>0?-120:120}%) rotate(${d>0?-4:4}deg)`;c.style.opacity=0;
  setTimeout(()=>{i+=d;c.classList.add("drag");c.style.transform=`translateY(${d>0?30:-30}%)`;render();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{c.classList.remove("drag");c.style.transform="";c.style.opacity=1;busy=false}))},250)}
const next=()=>go(1), prev=()=>go(-1);
$("reveal").onclick=reveal;$("unreveal").onclick=unreveal;$("next").onclick=next;$("prev").onclick=prev;
$("back").onclick=()=>{show("home");renderCats()};
document.addEventListener("keydown",e=>{if(!$("play").classList.contains("active"))return;
  const m={ArrowLeft:reveal,ArrowRight:unreveal,ArrowUp:next," ":next,ArrowDown:prev,Escape:()=>$("back").click()}[e.key];
  if(m){e.preventDefault();m()}});
// swipe: left=answer, right=question, up=next, down=prev
let sx=0,sy=0,dx=0,dy=0,down=false;const card=$("card");
card.addEventListener("pointerdown",e=>{if(busy)return;down=true;sx=e.clientX;sy=e.clientY;dx=dy=0;card.classList.add("drag");try{card.setPointerCapture(e.pointerId)}catch(_){}});
card.addEventListener("pointermove",e=>{if(!down)return;dx=e.clientX-sx;dy=e.clientY-sy;
  card.style.transform=Math.abs(dx)>Math.abs(dy)?`translateX(${dx*.4}px) rotate(${dx*.03}deg)`:`translateY(${dy*.5}px)`});
const end=()=>{if(!down)return;down=false;card.classList.remove("drag");card.style.transform="";
  const h=Math.abs(dx)>Math.abs(dy);
  if(h&&dx<-60)reveal();else if(h&&dx>60)unreveal();else if(!h&&dy<-60)next();else if(!h&&dy>60)prev();dx=dy=0};
card.addEventListener("pointerup",end);card.addEventListener("pointercancel",end);
