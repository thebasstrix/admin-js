const SB='https://qaacilmywkiupbcrijgi.supabase.co',KEY='sb_publishable_jqflkGEKJaGTd5phvgbwcA_Ob7npOXw';
const _sb=supabase.createClient(SB,KEY);
const $=id=>document.getElementById(id);
function st(id,msg,type){const e=$(id);e.textContent=msg;e.className='pu-status '+type;}
function stAuto(id,msg){st(id,msg,'success');setTimeout(()=>$(id).className='pu-status',4000);}
async function tok(){return(await _sb.auth.getSession()).data?.session?.access_token||KEY;}
async function hdr(){const t=await tok();return{apikey:KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json'};}
function pUrl(u){return u.split('/object/public/photos/').pop()?.split('?')[0]||u.split('/photos/').pop().split('?')[0];}

$('LB').addEventListener('click',async()=>{await _sb.auth.signOut();location.href='https://thebasstrix.co.uk/pages/admin-login';});
_sb.auth.getSession().then(({data})=>{if(!data.session)location.href='https://thebasstrix.co.uk/pages/admin-login';else load();});

async function uploadPhoto(file){
  const ext=file.name.split('.').pop().toLowerCase(),fn=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const{error}=await _sb.storage.from('photos').upload(fn,file,{upsert:false,contentType:file.type});
  if(error)throw new Error(error.message);
  return _sb.storage.from('photos').getPublicUrl(fn).data.publicUrl;
}

$('PH').addEventListener('change',function(){
  $('FP').innerHTML='';
  [...this.files].forEach(f=>{const d=document.createElement('div');d.className='pu-preview-thumb';const i=document.createElement('img');i.src=URL.createObjectURL(f);d.appendChild(i);$('FP').appendChild(d);});
});

$('CB').addEventListener('click',()=>{$('PH').value='';$('EN').value='';$('FP').innerHTML='';st('PS','','');$('PG').style.display='none';});

$('UB').addEventListener('click',async()=>{
  const files=[...$('PH').files],ev=$('EN').value.trim();
  if(!files.length){st('PS','Please select photos.','error');return;}
  if(!ev){st('PS','Please enter event name.','error');return;}
  const btn=$('UB'),fill=$('PF'),lbl=$('PL');
  btn.disabled=true;btn.textContent='Uploading...';$('PG').style.display='block';
  let done=0,failed=0,lastErr='';
  for(const file of files){
    try{
      const url=await uploadPhoto(file);
      const r=await fetch(`${SB}/rest/v1/photos`,{method:'POST',headers:{...await hdr(),'Prefer':'return=minimal'},body:JSON.stringify({photo_url:url,event_name:ev,title:null,draft:false,position:done,is_thumbnail:false})});
      if(!r.ok)throw new Error(await r.text());
    }catch(e){failed++;lastErr=e.message;}
    done++;fill.style.width=Math.round((done/files.length)*100)+'%';lbl.textContent=`${done} of ${files.length}${failed?' ('+failed+' failed)':''}`;
  }
  btn.disabled=false;btn.textContent='Upload & Publish';
  $('PH').value='';$('FP').innerHTML='';load();
  if(failed)st('PS',`${failed} of ${files.length} failed: ${lastErr}`,'error');
  else{st('PS',`✓ ${files.length} photo${files.length>1?'s':''} uploaded!`,'success');setTimeout(()=>$('PS').className='pu-status',5000);}
});

let removals=new Set(),reorderDirty=false;
function updateRemoveBar(){const b=$('SB'),c=$('PC');if(removals.size){b.style.display='flex';c.textContent=removals.size===1?'1 staged for removal':`${removals.size} staged for removal`;}else b.style.display='none';}
function setReorder(v){reorderDirty=v;$('RSB').style.display=v?'flex':'none';}
function setAlbumReorder(v){$('ARB').style.display=v?'flex':'none';}

function refreshPhotoArrows(grid){const items=[...grid.querySelectorAll('.pu-photo-row-item')];items.forEach((it,i)=>{it.querySelector('.pu-arr-up').disabled=i===0;it.querySelector('.pu-arr-dn').disabled=i===items.length-1;});}
function bindPhotoArrows(grid){grid.addEventListener('click',e=>{const up=e.target.closest('.pu-arr-up'),dn=e.target.closest('.pu-arr-dn'),it=up?.closest('.pu-photo-row-item')||dn?.closest('.pu-photo-row-item');if(!it)return;e.stopPropagation();if(up&&it.previousElementSibling)grid.insertBefore(it,it.previousElementSibling);else if(dn&&it.nextElementSibling)grid.insertBefore(it.nextElementSibling,it);else return;setReorder(true);refreshPhotoArrows(grid);});}

function refreshAlbumArrows(wrap){const ss=[...wrap.querySelectorAll('.pu-album-section')];ss.forEach((s,i)=>{s.querySelector('.pu-album-arr-up').disabled=i===0;s.querySelector('.pu-album-arr-dn').disabled=i===ss.length-1;});}
function bindAlbumArrows(wrap){wrap.addEventListener('click',e=>{const up=e.target.closest('.pu-album-arr-up'),dn=e.target.closest('.pu-album-arr-dn'),s=up?.closest('.pu-album-section')||dn?.closest('.pu-album-section');if(!s)return;e.stopPropagation();if(up&&s.previousElementSibling)wrap.insertBefore(s,s.previousElementSibling);else if(dn&&s.nextElementSibling)wrap.insertBefore(s.nextElementSibling,s);else return;setAlbumReorder(true);refreshAlbumArrows(wrap);});}

async function renameAlbum(old,nw){
  const t=await tok();
  const r=await fetch(`${SB}/rest/v1/photos?event_name=eq.${encodeURIComponent(old)}`,{method:'PATCH',headers:{apikey:KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({event_name:nw})});
  if(!r.ok)throw new Error(await r.text());
  try{await fetch(`${SB}/rest/v1/gallery_order?event_name=eq.${encodeURIComponent(old)}`,{method:'PATCH',headers:{apikey:KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({event_name:nw})});}catch(e){}
}

async function deleteAlbum(name,items){
  const t=await tok();
  const r=await fetch(`${SB}/rest/v1/photos?event_name=eq.${encodeURIComponent(name)}`,{method:'DELETE',headers:{apikey:KEY,'Authorization':'Bearer '+t}});
  if(!r.ok)throw new Error(await r.text());
  const keys=items.map(it=>pUrl(it.dataset.photoUrl||'')).filter(Boolean);
  if(keys.length)await _sb.storage.from('photos').remove(keys);
  try{await fetch(`${SB}/rest/v1/gallery_order?event_name=eq.${encodeURIComponent(name)}`,{method:'DELETE',headers:{apikey:KEY,'Authorization':'Bearer '+t}});}catch(e){}
}

let _del=null;
$('DC').addEventListener('click',()=>{$('DO').classList.remove('show');_del=null;});
$('DO').addEventListener('click',e=>{if(e.target===$('DO')){$('DO').classList.remove('show');_del=null;}});
$('DD').addEventListener('click',async()=>{
  if(!_del)return;
  const{section,name,items}=_del,btn=$('DD');btn.disabled=true;btn.textContent='Deleting...';
  try{
    await deleteAlbum(name,items);
    section.remove();$('DO').classList.remove('show');
    stAuto('RS',`✓ Album "${name}" deleted.`);
  }catch(err){st('ANS','Delete failed: '+err.message,'error');$('DO').classList.remove('show');}
  btn.disabled=false;btn.textContent='Delete Album';_del=null;
});

async function load(){
  const wrap=$('PL2'),loading=$('LL');
  removals.clear();updateRemoveBar();setReorder(false);setAlbumReorder(false);
  wrap.innerHTML='';loading.style.display='block';
  try{
    let orderMap=new Map();
    try{const t=await tok();const or=await fetch(`${SB}/rest/v1/gallery_order?select=*&order=position.asc`,{headers:{apikey:KEY,'Authorization':'Bearer '+t}});if(or.ok)(await or.json()).forEach(o=>orderMap.set(o.event_name,o.position));}catch(e){}
    const r=await fetch(`${SB}/rest/v1/photos?select=*&draft=eq.false&order=event_name.asc,position.asc`,{headers:{apikey:KEY,'Authorization':'Bearer '+KEY,'Cache-Control':'no-cache'}});
    const photos=await r.json();loading.style.display='none';
    if(!photos.length){wrap.innerHTML='<div style="font-size:12px;color:#aaa;padding:10px 0">No photos yet.</div>';return;}
    const groups=new Map();
    photos.forEach(p=>{const k=p.event_name||'Uncategorised';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p);});
    const keys=[...groups.keys()].sort((a,b)=>{const pa=orderMap.get(a)??999,pb=orderMap.get(b)??999;return pa!==pb?pa-pb:a.localeCompare(b);});
    keys.forEach(ev=>{
      const gp=groups.get(ev);
      const section=document.createElement('div');section.className='pu-album-section';section.dataset.album=ev;
      const hd=document.createElement('div');hd.className='pu-album-header';
      hd.innerHTML=`<span class="pu-album-name-display">${ev}</span><input class="pu-album-name-input" type="text" value="${ev}"><button class="pu-album-action-btn pu-album-edit-btn">&#9998; Rename</button><button class="pu-album-action-btn pu-album-save-name-btn">&#10003; Save</button><button class="pu-album-action-btn pu-album-cancel-name-btn">Cancel</button><button class="pu-album-action-btn pu-album-delete-btn" title="Delete album">&#128465; Delete</button><span class="pu-album-count">${gp.length} photo${gp.length>1?'s':''}</span><button class="pu-arr-btn pu-album-arr-up" title="Move up">&#9650;</button><button class="pu-arr-btn pu-album-arr-dn" title="Move down">&#9660;</button><span class="pu-collapse-icon">&#9654;</span>`;
      const grid=document.createElement('div');grid.className='pu-photo-grid pu-collapsed';
      const nd=hd.querySelector('.pu-album-name-display'),ni=hd.querySelector('.pu-album-name-input'),
            eb=hd.querySelector('.pu-album-edit-btn'),sv=hd.querySelector('.pu-album-save-name-btn'),
            cn=hd.querySelector('.pu-album-cancel-name-btn'),del=hd.querySelector('.pu-album-delete-btn'),
            ci=hd.querySelector('.pu-collapse-icon');
      const enterEdit=e=>{if(e)e.stopPropagation();nd.style.display=eb.style.display=del.style.display='none';ni.style.display='block';sv.style.display=cn.style.display='inline-flex';ni.focus();ni.select();};
      const exitEdit=()=>{nd.style.display=eb.style.display=del.style.display='';ni.style.display=sv.style.display=cn.style.display='none';};
      eb.addEventListener('click',enterEdit);
      cn.addEventListener('click',e=>{e.stopPropagation();ni.value=section.dataset.album;exitEdit();});
      sv.addEventListener('click',async e=>{
        e.stopPropagation();const nw=ni.value.trim();
        if(!nw){st('ANS','Album name cannot be empty.','error');return;}
        if(nw===section.dataset.album){exitEdit();return;}
        sv.disabled=true;sv.textContent='Saving...';
        try{await renameAlbum(section.dataset.album,nw);section.dataset.album=nw;nd.textContent=nw;ni.value=nw;exitEdit();stAuto('ANS','✓ Album renamed.');}
        catch(err){st('ANS','Failed to rename: '+err.message,'error');}
        sv.disabled=false;sv.textContent='✓ Save';
      });
      ni.addEventListener('keydown',e=>{if(e.key==='Enter')sv.click();if(e.key==='Escape')cn.click();});
      del.addEventListener('click',e=>{
        e.stopPropagation();const items=[...grid.querySelectorAll('.pu-photo-row-item')];
        _del={section,name:section.dataset.album,items};
        $('DM').textContent=`"${section.dataset.album}" contains ${items.length} photo${items.length!==1?'s':''}. This will permanently delete all of them and cannot be undone.`;
        $('DO').classList.add('show');
      });
      const toggle=e=>{e.stopPropagation();const c=grid.classList.toggle('pu-collapsed');ci.textContent=c?'▶':'▼';};
      ci.addEventListener('click',toggle);
      nd.addEventListener('click',e=>{if(ni.style.display==='block')return;toggle(e);});
      gp.forEach(p=>{
        const item=document.createElement('div');
        item.className='pu-photo-row-item'+(p.is_thumbnail?' pu-is-thumb':'');
        item.id=`pu-row-${p.id}`;item.dataset.photoUrl=p.photo_url||'';item.dataset.id=p.id;
        item.innerHTML=`<img class="pu-row-thumb" src="${p.photo_url}" alt="" loading="lazy"><span class="pu-row-name">${p.title||''}</span><div class="pu-row-actions"><button class="pu-arr-btn pu-arr-up" title="Move up">&#9650;</button><button class="pu-arr-btn pu-arr-dn" title="Move down">&#9660;</button><button class="pu-thumb-btn" data-id="${p.id}" title="Set as thumbnail">&#9733;</button><button class="pu-remove-row-btn" data-id="${p.id}" title="Remove">&#215;</button></div>`;
        item.querySelector('.pu-thumb-btn').addEventListener('click',async function(e){
          e.stopPropagation();const id=this.dataset.id,t=await tok();
          await fetch(`${SB}/rest/v1/photos?event_name=eq.${encodeURIComponent(section.dataset.album)}&is_thumbnail=eq.true`,{method:'PATCH',headers:{apikey:KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({is_thumbnail:false})});
          const r=await fetch(`${SB}/rest/v1/photos?id=eq.${id}`,{method:'PATCH',headers:{apikey:KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({is_thumbnail:true})});
          if(r.ok){grid.querySelectorAll('.pu-photo-row-item').forEach(i=>i.classList.remove('pu-is-thumb'));item.classList.add('pu-is-thumb');stAuto('RS','✓ Thumbnail set.');}
        });
        item.querySelector('.pu-remove-row-btn').addEventListener('click',function(e){
          e.stopPropagation();const id=this.dataset.id;
          if(removals.has(id)){removals.delete(id);item.classList.remove('pu-staged');}
          else{removals.add(id);item.classList.add('pu-staged');}
          updateRemoveBar();
        });
        grid.appendChild(item);
      });
      bindPhotoArrows(grid);refreshPhotoArrows(grid);
      section.appendChild(hd);section.appendChild(grid);wrap.appendChild(section);
    });
    bindAlbumArrows(wrap);refreshAlbumArrows(wrap);
  }catch(e){$('LL').textContent='Failed to load.';}
}

$('RB').addEventListener('click',async()=>{
  const btn=$('RB');btn.disabled=true;btn.textContent='Removing...';
  let failed=0;const t=await tok();
  for(const id of removals){
    try{
      const item=document.getElementById(`pu-row-${id}`),url=item?.dataset?.photoUrl||'';
      const r=await fetch(`${SB}/rest/v1/photos?id=eq.${id}`,{method:'DELETE',headers:{apikey:KEY,'Authorization':'Bearer '+t}});
      if(!r.ok)throw new Error();
      item?.remove();
      if(url.includes('/photos/'))await _sb.storage.from('photos').remove([pUrl(url)]);
    }catch(e){failed++;}
  }
  removals.clear();updateRemoveBar();btn.disabled=false;btn.textContent='Remove Selected';
  if(failed)st('RS',`${failed} could not be removed.`,'error');
  else stAuto('RS','✓ Photos removed.');
});

$('DB').addEventListener('click',()=>load());

$('RSS').addEventListener('click',async()=>{
  const btn=$('RSS');btn.disabled=true;btn.textContent='Saving...';
  const t=await tok();let failed=0;
  await Promise.all([...document.querySelectorAll('.pu-album-section')].flatMap(section=>
    [...section.querySelectorAll('.pu-photo-row-item')].map((item,i)=>{
      const id=item.dataset.id;if(!id)return Promise.resolve();
      return fetch(`${SB}/rest/v1/photos?id=eq.${id}`,{method:'PATCH',headers:{apikey:KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({position:i})}).then(r=>{if(!r.ok)throw 0;}).catch(()=>failed++);
    })
  ));
  btn.disabled=false;btn.textContent='Save Order';setReorder(false);
  if(failed)st('ROS',`${failed} failed.`,'error');else stAuto('ROS','✓ Order saved.');
});

$('RDB').addEventListener('click',()=>load());

$('ASS').addEventListener('click',async()=>{
  const btn=$('ASS');btn.disabled=true;btn.textContent='Saving...';
  const t=await tok();let failed=0;
  const sections=[...$('PL2').querySelectorAll('.pu-album-section')];
  for(let i=0;i<sections.length;i++){
    const name=sections[i].dataset.album;
    try{
      const r=await fetch(`${SB}/rest/v1/gallery_order?event_name=eq.`+encodeURIComponent(name),{method:'PATCH',headers:{apikey:KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify({position:i})});
      if(!(await r.json()).length)await fetch(`${SB}/rest/v1/gallery_order`,{method:'POST',headers:{apikey:KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({event_name:name,position:i})});
    }catch(e){failed++;}
  }
  btn.disabled=false;btn.textContent='Save Album Order';setAlbumReorder(false);
  if(failed)st('ROS',failed+' failed.','error');else stAuto('ROS','✓ Album order saved.');
});

$('ADB').addEventListener('click',()=>load());

$('ST').addEventListener('click',function(){
  const s=$('S'),w=document.querySelector('.pu-wrap'),ex=s.classList.toggle('expanded');
  if(w)w.style.paddingLeft=ex?'calc(200px + 20px)':'calc(48px + 20px)';
  this.innerHTML=ex?'&#10005;':'&#9776;';
});
