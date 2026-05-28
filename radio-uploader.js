const _sb=supabase.createClient('https://qaacilmywkiupbcrijgi.supabase.co','sb_publishable_jqflkGEKJaGTd5phvgbwcA_Ob7npOXw');
_sb.auth.getSession().then(({data})=>{if(!data.session)window.location.href='https://thebasstrix.co.uk/pages/admin-login';});
document.getElementById('pu-logout').addEventListener('click',async()=>{await _sb.auth.signOut();window.location.href='https://thebasstrix.co.uk/pages/admin-login';});
document.getElementById('pu-toggle').addEventListener('click',function(){
  const s=document.getElementById('pu-sidebar'),w=document.getElementById('etb-wrap'),x=s.classList.toggle('expanded');
  w.style.paddingLeft=x?'calc(200px + 20px)':'calc(48px + 20px)';
  this.innerHTML=x?'&#10005;':'&#9776;';
});
(function(){
  function hC(){
    document.querySelectorAll('.wrapper').forEach(e=>{if(!e.querySelector('.pu-wrap'))e.style.setProperty('display','none','important');});
    document.querySelectorAll('footer,[class*="footer"]').forEach(e=>e.style.setProperty('display','none','important'));
  }
  document.addEventListener('DOMContentLoaded',hC);setTimeout(hC,500);
})();

const dEps=[
  {num:'001',date:'10.01.26',url:'https://thebasstrix.co.uk/pages/enter-the-basstrix-001'},
  {num:'002',date:'14.02.26',url:'https://thebasstrix.co.uk/pages/enter-the-basstrix-002'},
  {num:'003',date:'14.03.26',url:'https://thebasstrix.co.uk/pages/enter-the-basstrix-003'},
  {num:'004',date:'11.04.26',url:'https://thebasstrix.co.uk/pages/enter-the-basstrix-004'},
  {num:'005',date:'09.05.26',url:'https://thebasstrix.co.uk/pages/enter-the-basstrix-005'},
];
document.getElementById('ep-date').valueAsDate=new Date();
document.getElementById('ep-num').addEventListener('input',function(){document.getElementById('ep-num-preview').textContent='→ '+pad(parseInt(this.value)||1);});
function pad(n){return String(n).padStart(3,'0');}
function dShort(s){if(!s)return'';const[y,m,d]=s.split('-');return d+'.'+m+'.'+String(y).slice(2);}
function dLong(s){if(!s)return'';const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],[y,m,d]=s.split('-');return parseInt(d)+' '+mo[parseInt(m)-1]+' '+y;}
function embedUrl(u){return'https://w.soundcloud.com/player/?url='+encodeURIComponent(encodeURIComponent(u))+'&color=%230c260c&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true';}
let _eps=JSON.parse(JSON.stringify(dEps));
function etbRenderList(){
  document.getElementById('etb-ep-list').innerHTML=_eps.map((ep,i)=>`<div class="etb-ep-row"><input type="text" value="${ep.num}" placeholder="001" onchange="_eps[${i}].num=this.value"/><input type="text" value="${ep.date}" placeholder="10.01.26" onchange="_eps[${i}].date=this.value"/><input type="text" value="${ep.url}" placeholder="https://..." onchange="_eps[${i}].url=this.value"/><button class="etb-ep-del" onclick="_eps.splice(${i},1);etbRenderList()">×</button></div>`).join('');
}
function etbAddEp(){_eps.push({num:'',date:'',url:''});etbRenderList();const r=document.querySelectorAll('.etb-ep-row');r[r.length-1]?.querySelector('input').focus();}
etbRenderList();

function etbGenerate(){
  const title=document.getElementById('ep-title').value.trim()||'Enter The Basstrix';
  const num=pad(parseInt(document.getElementById('ep-num').value)||1);
  const date=document.getElementById('ep-date').value;
  const host=document.getElementById('ep-host').value.trim()||'Twelve Step Audio';
  const scUrl=document.getElementById('ep-sc-url').value.trim();
  const pageUrl=document.getElementById('ep-page-url').value.trim();
  const desc=document.getElementById('ep-desc').value.trim();
  const ds=dShort(date),dl=dLong(date);
  const label=title+' '+num+(ds?' | '+ds:'');
  const cols=_eps.length+1;
  const prevItems=_eps.map(ep=>`\n        <a href="${ep.url}"><div class="schedule-item"><div class="schedule-time">22:00 &ndash; 00:00</div><div class="schedule-show">${title} ${ep.num}${ep.date?' | '+ep.date:''}</div><div class="schedule-presenter">Hosted by ${host}</div></div></a>`).join('');
  const newItem=`\n        <a href="${pageUrl||'#'}"><div class="schedule-item active"><div class="schedule-time">22:00 &ndash; 00:00</div><div class="schedule-show">${label}</div><div class="schedule-presenter">Hosted by ${host}</div></div></a>`;
  const embed=scUrl?`    <div class="soundcloud-embed"><iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="${embedUrl(scUrl)}"></iframe><div class="soundcloud-credit"><a href="https://soundcloud.com/venn-radio" target="_blank">Venn Radio</a> &middot; <a href="${scUrl}" target="_blank">${label}</a></div></div>`:`    <!-- Add SoundCloud embed here -->`;
  const html=`<style>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--green:#1a7a1a;--black:#000;--dark:#111;--mid:#222;--gray:#555;--light-gray:#ddd;--bg:#fff}
body{font-family:Archivo,sans-serif;background:var(--bg);color:var(--dark);min-height:100vh}
.page-header{padding:40px 20px 30px;text-align:center;border-bottom:1px solid var(--light-gray)}
.page-header .logo{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:var(--black);display:inline-block;padding-bottom:6px;border-bottom:2px solid var(--green);letter-spacing:3px;text-transform:uppercase}
@keyframes fadeIn{to{opacity:1;transform:translateY(0)}}
.container{max-width:1200px;margin:0 auto;padding:60px 20px}
.main-player{display:flex;flex-direction:column;gap:24px;margin-bottom:70px;opacity:0;transform:translateY(20px);animation:fadeIn .9s ease-out .1s forwards}
.player-info{display:flex;flex-wrap:wrap;align-items:flex-start;gap:20px 48px;padding-bottom:24px;border-bottom:1px solid var(--light-gray)}
.player-info-left{flex:1;min-width:220px}
.player-info-right{flex:2;min-width:260px}
.show-title{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:var(--black);text-transform:uppercase;letter-spacing:1px;display:inline-block;padding-bottom:6px;border-bottom:1px solid var(--green);margin-bottom:10px}
.show-host{font-size:.95rem;color:var(--gray);margin-top:8px}
.time-display{font-size:.83rem;color:var(--gray);font-weight:700;letter-spacing:1px;margin-top:12px}
.show-description{font-size:1rem;line-height:1.6;color:var(--mid)}
.soundcloud-embed{width:100%}
.soundcloud-embed iframe{display:block;width:100%}
.soundcloud-credit{font-size:10px;color:#ccc;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:Verdana,sans-serif;font-weight:100;margin-top:3px}
.soundcloud-credit a{color:#ccc;text-decoration:none}
.schedule{opacity:0;transform:translateY(20px);animation:fadeIn .9s ease-out .3s forwards}
.schedule-title{font-family:'Oswald',sans-serif;font-size:2rem;font-weight:700;margin-bottom:28px;color:var(--black);text-transform:uppercase;letter-spacing:2px;display:inline-block;padding-bottom:6px;border-bottom:1px solid var(--green)}
.schedule-grid-wrapper{border:1px solid var(--light-gray);overflow-x:auto;scrollbar-width:thin;scrollbar-color:var(--green) var(--light-gray)}
.schedule-grid-wrapper::-webkit-scrollbar{height:6px}
.schedule-grid-wrapper::-webkit-scrollbar-track{background:var(--light-gray)}
.schedule-grid-wrapper::-webkit-scrollbar-thumb{background:var(--green);border-radius:3px}
.schedule-grid{display:grid;grid-template-columns:repeat(${cols},260px);gap:1px;background:var(--light-gray)}
.schedule-grid a{text-decoration:none;color:inherit;display:flex}
.schedule-item{background:var(--bg);padding:22px 24px;transition:background .2s;border-left:3px solid transparent;width:100%}
.schedule-item:hover{background:#f7f7f7;border-left-color:var(--green)}
.schedule-item.active{border-left-color:var(--green);background:#f4faf4}
.schedule-time{font-size:.75rem;font-weight:700;color:var(--green);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px}
.schedule-show{font-family:'Oswald',sans-serif;font-size:1.15rem;font-weight:600;margin-bottom:5px;color:var(--dark);text-transform:uppercase}
.schedule-presenter{font-size:.85rem;color:var(--gray)}
@media(max-width:768px){.show-title{font-size:2rem}}
</style>
<header class="page-header"><div class="logo">LISTEN BACK</div></header>
<div class="container">
  <main class="main-player">
${embed}
    <div class="player-info">
      <div class="player-info-left"><h1 class="show-title">${title}</h1><div class="show-host">Hosted by ${host}${dl?' &middot; '+dl:''}</div><div class="time-display">More shows from <a href="https://www.vennradio.com" target="_blank">Venn Radio</a></div></div>
      <div class="player-info-right"><p class="show-description">${desc||''}</p></div>
    </div>
  </main>
  <section class="schedule"><h2 class="schedule-title">All Shows</h2><div class="schedule-grid-wrapper"><div class="schedule-grid">${prevItems}${newItem}</div></div></section>
</div>`;
  document.getElementById('etb-code').textContent=html;
  const out=document.getElementById('etb-output');
  out.style.display='block';
  out.scrollIntoView({behavior:'smooth',block:'start'});
}

function etbCopy(){
  navigator.clipboard.writeText(document.getElementById('etb-code').textContent).then(()=>{
    const b=document.getElementById('etb-copied');b.classList.add('show');setTimeout(()=>b.classList.remove('show'),2500);
  });
}

function etbReset(){
  document.getElementById('ep-title').value='Enter The Basstrix';
  document.getElementById('ep-host').value='Twelve Step Audio';
  ['ep-sc-url','ep-page-url','ep-desc'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ep-num').value=6;
  document.getElementById('ep-num-preview').textContent='→ 006';
  document.getElementById('ep-date').valueAsDate=new Date();
  _eps=JSON.parse(JSON.stringify(dEps));
  etbRenderList();
  document.getElementById('etb-output').style.display='none';
}
