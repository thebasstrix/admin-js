const _sb=supabase.createClient('https://qaacilmywkiupbcrijgi.supabase.co','sb_publishable_jqflkGEKJaGTd5phvgbwcA_Ob7npOXw');
const EU_URL='https://qaacilmywkiupbcrijgi.supabase.co',EU_KEY='sb_publishable_jqflkGEKJaGTd5phvgbwcA_Ob7npOXw';

document.getElementById('pu-logout-btn').addEventListener('click',async()=>{await _sb.auth.signOut();window.location.href='https://thebasstrix.co.uk/pages/admin-login';});

_sb.auth.getSession().then(({data})=>{
  if(!data.session){window.location.href='https://thebasstrix.co.uk/pages/admin-login';}
  else{loadEventList();loadDraftList();}
});

function euHeaders(){return{'apikey':EU_KEY,'Authorization':'Bearer '+EU_KEY,'Content-Type':'application/json'};}

function euStatus(id,msg,type){const el=document.getElementById(id);el.textContent=msg;el.className='eu-status '+type;}

function euThumb(url,title){
  if(url)return`<img class="eu-event-thumb" src="${url}" alt="${title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="eu-event-thumb-placeholder" style="display:none">No<br>Image</div>`;
  return`<div class="eu-event-thumb-placeholder">No<br>Image</div>`;
}

document.getElementById('eu-event-artwork').addEventListener('change',function(){
  const f=this.files[0],p=document.getElementById('eu-artwork-preview'),i=document.getElementById('eu-artwork-preview-img');
  if(f){i.src=URL.createObjectURL(f);p.style.display='block';}else{p.style.display='none';i.src='';}
});

async function euUploadArtwork(file){
  const ext=file.name.split('.').pop(),fn=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const{error}=await _sb.storage.from('event-artwork').upload(fn,file,{upsert:false,contentType:file.type});
  if(error)throw new Error('Storage: '+error.message);
  return _sb.storage.from('event-artwork').getPublicUrl(fn).data.publicUrl;
}

function euFormatDate(v){
  if(!v)return'';
  if(/^\d{4}-\d{2}-\d{2}$/.test(v.trim())){const[y,m,d]=v.split('-');return d+'.'+m+'.'+y.slice(2);}
  return v.trim();
}

document.getElementById('eu-date-pick-btn').addEventListener('click',()=>document.getElementById('eu-date-picker').showPicker());
document.getElementById('eu-date-picker').addEventListener('change',function(){
  if(this.value){document.getElementById('eu-event-date').value=euFormatDate(this.value);this.value='';}
});

function euSetUrlLabels(isPast){
  document.getElementById('eu-tickets-label').textContent=isPast?'Photos URL':'Tickets URL';
  document.getElementById('eu-info-label').textContent=isPast?'Videos URL':'Info URL';
  document.getElementById('eu-event-tickets').placeholder=isPast?'https://thebasstrix.co.uk/pages/photo-gallery':'https://skiddle.com/...';
  document.getElementById('eu-event-info').placeholder=isPast?'https://thebasstrix.co.uk/pages/videos':'https://skiddle.com/.../about';
}

document.getElementById('eu-event-type').addEventListener('change',function(){euSetUrlLabels(this.value==='past');});

function euFields(){
  return{
    name:document.getElementById('eu-event-name').value.trim(),
    date:euFormatDate(document.getElementById('eu-event-date').value),
    location:document.getElementById('eu-event-location').value.trim(),
    file:document.getElementById('eu-event-artwork').files[0]||null,
    tickets:document.getElementById('eu-event-tickets').value.trim(),
    info:document.getElementById('eu-event-info').value.trim(),
    type:document.getElementById('eu-event-type').value
  };
}

function euClearFields(){
  ['eu-event-name','eu-event-date','eu-event-location','eu-event-tickets','eu-event-info'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('eu-event-artwork').value='';
  document.getElementById('eu-artwork-preview').style.display='none';
  document.getElementById('eu-artwork-preview-img').src='';
}

function euPayload(url,f,draft){
  return{name:f.name,event_date:f.date,location:f.location,artwork_url:url,tickets_url:f.tickets||null,info_url:f.info||null,type:f.type,draft};
}

document.getElementById('eu-clear-btn').addEventListener('click',()=>{euClearFields();euStatus('eu-status','','');});

let euPending=[];

function euRenderPending(){
  const list=document.getElementById('eu-pending-list'),bar=document.getElementById('eu-upload-save-bar'),count=document.getElementById('eu-upload-pending-count');
  list.innerHTML='';
  if(!euPending.length){bar.style.display='none';return;}
  bar.style.display='flex';
  count.textContent=euPending.length===1?'1 staged':`${euPending.length} staged`;
  euPending.forEach((ev,idx)=>{
    const row=document.createElement('div');
    row.className='eu-event-row';
    row.style.opacity='0.75';
    row.innerHTML=`${euThumb(ev._preview,ev.name)}<div class="eu-event-row-info"><div class="eu-event-row-title">${ev.name}</div><div class="eu-event-row-meta">${ev.event_date} · ${ev.location} · <em>${ev.type}</em></div></div><button class="eu-remove-btn" data-idx="${idx}">Remove</button>`;
    row.querySelector('.eu-remove-btn').addEventListener('click',()=>{euPending.splice(idx,1);euRenderPending();});
    list.appendChild(row);
  });
}

document.getElementById('eu-stage-btn').addEventListener('click',()=>{
  const f=euFields();
  if(!f.name||!f.date||!f.location||!f.file){euStatus('eu-status','Fill all fields.','error');return;}
  euPending.unshift({...f,_preview:URL.createObjectURL(f.file)});
  euRenderPending();euClearFields();euStatus('eu-status','✓','success');
});

document.getElementById('eu-upload-save-btn').addEventListener('click',async()=>{
  if(!euPending.length)return;
  const btn=document.getElementById('eu-upload-save-btn');
  btn.disabled=true;btn.textContent='Saving...';
  let failed=0,lastError='';
  for(const ev of euPending){
    try{
      await fetch(`${EU_URL}/rest/v1/rpc/eu_increment_positions`,{method:'POST',headers:euHeaders(),body:JSON.stringify({})});
      const url=await euUploadArtwork(ev.file);
      const r=await fetch(`${EU_URL}/rest/v1/events`,{method:'POST',headers:{...euHeaders(),'Prefer':'return=minimal'},body:JSON.stringify({...euPayload(url,ev,false),position:0})});
      if(!r.ok)throw new Error(await r.text());
    }catch(e){lastError=e.message;failed++;}
  }
  euPending=[];euRenderPending();loadEventList();
  btn.disabled=false;btn.textContent='Save & Publish';
  if(failed)euStatus('eu-status',`${failed} failed. ${lastError}`,'error');
  else{euStatus('eu-status','✓','success');setTimeout(()=>document.getElementById('eu-status').className='eu-status',4000);}
});

document.getElementById('eu-upload-discard-btn').addEventListener('click',()=>{euPending=[];euRenderPending();euStatus('eu-status','','');});

document.getElementById('eu-draft-btn').addEventListener('click',async()=>{
  const f=euFields();
  if(!f.name||!f.date||!f.location||!f.file){euStatus('eu-status','Fill all fields.','error');return;}
  const btn=document.getElementById('eu-draft-btn');
  btn.disabled=true;btn.textContent='Saving...';
  try{
    const url=await euUploadArtwork(f.file);
    const r=await fetch(`${EU_URL}/rest/v1/events`,{method:'POST',headers:{...euHeaders(),'Prefer':'return=minimal'},body:JSON.stringify(euPayload(url,f,true))});
    if(!r.ok)throw new Error(await r.text());
    euClearFields();euStatus('eu-status','✓ Saved.','success');loadDraftList();
  }catch(e){euStatus('eu-status','Error: '+e.message,'error');}
  finally{btn.disabled=false;btn.textContent='Draft';}
});

let euRemovals=new Map(),euReorderDirty=false;

function euUpdateRemoveBar(){
  const bar=document.getElementById('eu-save-bar'),count=document.getElementById('eu-pending-count');
  if(euRemovals.size){bar.style.display='flex';count.textContent=euRemovals.size===1?'1 removal':`${euRemovals.size} removal`;}
  else bar.style.display='none';
}

function euSetReorderDirty(val){
  euReorderDirty=val;
  document.getElementById('eu-reorder-save-bar').style.display=val?'flex':'none';
}

document.querySelectorAll('.eu-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.eu-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const w=tab.dataset.tab;
    document.getElementById('eu-reorder-upcoming').style.display=w==='upcoming'?'block':'none';
    document.getElementById('eu-reorder-past').style.display=w==='past'?'block':'none';
    document.getElementById('eu-tab-label').textContent=w==='upcoming'?'Upcoming':'Past';
  });
});

function euMakeSortable(listId){
  const list=document.getElementById(listId);let dragSrc=null;
  list.querySelectorAll('.eu-sort-row').forEach(row=>{
    row.addEventListener('dragstart',e=>{dragSrc=row;row.style.opacity='0.4';e.dataTransfer.effectAllowed='move';});
    row.addEventListener('dragend',()=>{row.style.opacity='1';list.querySelectorAll('.eu-sort-row').forEach(r=>r.classList.remove('eu-drag-over'));});
    row.addEventListener('dragover',e=>{e.preventDefault();list.querySelectorAll('.eu-sort-row').forEach(r=>r.classList.remove('eu-drag-over'));if(row!==dragSrc)row.classList.add('eu-drag-over');});
    row.addEventListener('drop',e=>{
      e.preventDefault();
      if(dragSrc&&dragSrc!==row){
        const rows=[...list.querySelectorAll('.eu-sort-row')],si=rows.indexOf(dragSrc),ti=rows.indexOf(row);
        if(si<ti)list.insertBefore(dragSrc,row.nextSibling);else list.insertBefore(dragSrc,row);
        euSetReorderDirty(true);
      }
      row.classList.remove('eu-drag-over');
    });
  });
}

function euOpenEdit(v,row,editBtn){
  document.querySelectorAll('.eu-inline-edit').forEach(f=>{
    const eb=document.querySelector(`.eu-edit-btn[data-id="${f.dataset.editId}"]`);
    f.remove();if(eb)eb.textContent='Edit';
  });
  editBtn.textContent='Close';
  const isPast=v.type==='past';
  const form=document.createElement('div');
  form.className='eu-inline-edit';form.dataset.editId=v.id;
  form.innerHTML=`<div class="eu-field-row"><div class="eu-field"><label class="eu-label">Name</label><input class="eu-input ee-name" value="${v.name||''}"></div><div class="eu-field"><label class="eu-label">Type</label><select class="eu-input ee-type"><option value="upcoming"${v.type==='upcoming'?' selected':''}>Upcoming</option><option value="past"${v.type==='past'?' selected':''}>Past</option></select></div></div><div class="eu-field-row"><div class="eu-field"><label class="eu-label">Date</label><input class="eu-input ee-date" value="${v.event_date||''}"></div><div class="eu-field"><label class="eu-label">Location</label><input class="eu-input ee-location" value="${v.location||''}"></div></div><div class="eu-field-row"><div class="eu-field"><label class="eu-label ee-tl">${isPast?'Photos URL':'Tickets URL'}</label><input class="eu-input ee-tickets" value="${v.tickets_url||''}"></div><div class="eu-field"><label class="eu-label ee-il">${isPast?'Videos URL':'Info URL'}</label><input class="eu-input ee-info" value="${v.info_url||''}"></div></div><div class="eu-field"><label class="eu-label">Artwork <span class="eu-optional">(opt)</span></label><input class="eu-input eu-file-input ee-art" type="file" accept="image/*"></div><div class="eu-btn-row"><button class="eu-btn eu-btn-primary eu-btn-sm ee-save">Save</button><button class="eu-btn eu-btn-ghost eu-btn-sm ee-cancel">Cancel</button></div><div class="ee-status eu-status"></div>`;
  form.querySelector('.ee-type').addEventListener('change',function(){
    const p=this.value==='past';
    form.querySelector('.ee-tl').textContent=p?'Photos URL':'Tickets URL';
    form.querySelector('.ee-il').textContent=p?'Videos URL':'Info URL';
  });
  form.querySelector('.ee-cancel').addEventListener('click',()=>{form.remove();editBtn.textContent='Edit';});
  form.querySelector('.ee-save').addEventListener('click',async()=>{
    const sb=form.querySelector('.ee-save'),st=form.querySelector('.ee-status');
    sb.disabled=true;sb.textContent='Saving...';
    try{
      let artUrl=v.artwork_url;
      const artFile=form.querySelector('.ee-art').files[0];
      if(artFile){
        artUrl=await euUploadArtwork(artFile);
        if(v.artwork_url&&v.artwork_url.includes('/event-artwork/')){
          const old=v.artwork_url.split('/event-artwork/').pop().split('?')[0];
          await _sb.storage.from('event-artwork').remove([old]);
        }
      }
      const patch={
        name:form.querySelector('.ee-name').value.trim(),
        event_date:form.querySelector('.ee-date').value.trim(),
        location:form.querySelector('.ee-location').value.trim(),
        tickets_url:form.querySelector('.ee-tickets').value.trim()||null,
        info_url:form.querySelector('.ee-info').value.trim()||null,
        type:form.querySelector('.ee-type').value,
        artwork_url:artUrl
      };
      const r=await fetch(`${EU_URL}/rest/v1/events?id=eq.${v.id}`,{method:'PATCH',headers:{...euHeaders(),'Prefer':'return=minimal'},body:JSON.stringify(patch)});
      if(!r.ok)throw new Error(await r.text());
      form.remove();editBtn.textContent='Edit';loadEventList();
    }catch(e){st.textContent='Error: '+e.message;st.className='ee-status eu-status error';sb.disabled=false;sb.textContent='Save';}
  });
  row.insertAdjacentElement('afterend',form);
}

function euRenderManageRow(v,listId){
  const el=document.getElementById(listId),row=document.createElement('div');
  row.className='eu-sort-row eu-event-row';row.draggable=true;row.dataset.id=v.id;row.dataset.artworkUrl=v.artwork_url||'';row.id=`eu-row-${v.id}`;
  row.innerHTML=`<div class="eu-drag-handle" title="Drag">&#9776;</div>${euThumb(v.artwork_url,v.name)}<div class="eu-event-row-info"><div class="eu-event-row-title">${v.name}</div><div class="eu-event-row-meta">${v.event_date} · ${v.location}</div></div><div style="display:flex;gap:6px;flex-shrink:0;"><button class="eu-edit-btn" data-id="${v.id}">Edit</button><button class="eu-remove-btn" data-id="${v.id}">Remove</button></div>`;
  row.querySelector('.eu-edit-btn').addEventListener('click',function(){
    const existing=document.getElementById(`eu-edit-form-${v.id}`);
    if(existing){existing.remove();this.textContent='Edit';return;}
    euOpenEdit(v,row,this);
  });
  row.querySelector('.eu-remove-btn').addEventListener('click',function(){
    if(!confirm('Remove "'+v.name+'"?'))return;
    euRemovals.set(v.id,row.dataset.artworkUrl||'');
    row.style.opacity='0.35';row.style.textDecoration='line-through';row.draggable=false;
    this.textContent='Undo';this.style.borderColor='#aaa';this.style.color='#aaa';
    this.onclick=()=>{
      euRemovals.delete(v.id);row.style.opacity='1';row.style.textDecoration='none';row.draggable=true;
      this.textContent='Remove';this.style.borderColor='';this.style.color='';this.onclick=null;
      euUpdateRemoveBar();
    };
    euUpdateRemoveBar();
  });
  el.appendChild(row);
}

async function loadEventList(){
  euRemovals.clear();euUpdateRemoveBar();euSetReorderDirty(false);
  ['eu-reorder-upcoming-list','eu-reorder-past-list'].forEach(id=>document.getElementById(id).innerHTML='');
  document.getElementById('eu-reorder-upcoming-loading').style.display='block';
  document.getElementById('eu-reorder-past-loading').style.display='block';
  try{
    const r=await fetch(`${EU_URL}/rest/v1/events?select=*&draft=eq.false&order=position.asc`,{headers:{apikey:EU_KEY,Authorization:'Bearer '+EU_KEY}});
    const events=await r.json();
    document.getElementById('eu-reorder-upcoming-loading').style.display='none';
    document.getElementById('eu-reorder-past-loading').style.display='none';
    const up=events.filter(e=>e.type==='upcoming'),past=events.filter(e=>e.type==='past');
    if(!up.length)document.getElementById('eu-reorder-upcoming-list').innerHTML='<div style="font-size:12px;color:#aaa">None.</div>';
    else{up.forEach(v=>euRenderManageRow(v,'eu-reorder-upcoming-list'));euMakeSortable('eu-reorder-upcoming-list');}
    if(!past.length)document.getElementById('eu-reorder-past-list').innerHTML='<div style="font-size:12px;color:#aaa">None.</div>';
    else{past.forEach(v=>euRenderManageRow(v,'eu-reorder-past-list'));euMakeSortable('eu-reorder-past-list');}
  }catch(e){document.getElementById('eu-reorder-upcoming-loading').textContent='Failed.';}
}

document.getElementById('eu-save-removals-btn').addEventListener('click',async()=>{
  const btn=document.getElementById('eu-save-removals-btn');btn.disabled=true;btn.textContent='Saving...';
  let failed=0;
  for(const[id,artworkUrl]of euRemovals){
    try{
      const r=await fetch(`${EU_URL}/rest/v1/events?id=eq.${id}`,{method:'DELETE',headers:{apikey:EU_KEY,Authorization:'Bearer '+EU_KEY}});
      if(!r.ok)throw new Error();
      document.getElementById(`eu-row-${id}`)?.remove();
      if(artworkUrl&&artworkUrl.includes('/event-artwork/')){
        await _sb.storage.from('event-artwork').remove([artworkUrl.split('/event-artwork/').pop().split('?')[0]]);
      }
    }catch(e){failed++;}
  }
  euRemovals.clear();euUpdateRemoveBar();btn.disabled=false;btn.textContent='Remove';
  if(failed)euStatus('eu-remove-status',`${failed} failed.`,'error');
  else{euStatus('eu-remove-status','✓','success');setTimeout(()=>document.getElementById('eu-remove-status').className='eu-status',4000);}
});

document.getElementById('eu-discard-btn').addEventListener('click',()=>loadEventList());

document.getElementById('eu-reorder-save-btn').addEventListener('click',async()=>{
  const btn=document.getElementById('eu-reorder-save-btn');btn.disabled=true;btn.textContent='Saving...';
  let failed=0,lastErr='',pos=0;
  for(const listId of['eu-reorder-upcoming-list','eu-reorder-past-list']){
    document.getElementById(listId).querySelectorAll('.eu-sort-row').forEach(async row=>{
      const id=row.dataset.id;if(!id)return;
      try{
        const r=await fetch(`${EU_URL}/rest/v1/events?id=eq.${id}`,{method:'PATCH',headers:{...euHeaders(),'Prefer':'return=minimal'},body:JSON.stringify({position:pos++})});
        if(!r.ok)throw new Error(await r.text());
      }catch(e){lastErr=e.message;failed++;}
    });
  }
  await new Promise(r=>setTimeout(r,500));
  btn.disabled=false;btn.textContent='Save';euSetReorderDirty(false);
  if(failed)euStatus('eu-reorder-status',failed+' failed. '+lastErr,'error');
  else{euStatus('eu-reorder-status','✓','success');setTimeout(()=>document.getElementById('eu-reorder-status').className='eu-status',4000);}
});

document.getElementById('eu-reorder-discard-btn').addEventListener('click',()=>loadEventList());

async function loadDraftList(){
  const wrap=document.getElementById('eu-drafts-list'),loading=document.getElementById('eu-drafts-loading');
  wrap.innerHTML='';loading.style.display='block';loading.textContent='Loading';
  try{
    const r=await fetch(`${EU_URL}/rest/v1/events?select=*&draft=eq.true&order=created_at.desc`,{headers:{apikey:EU_KEY,Authorization:'Bearer '+EU_KEY}});
    const events=await r.json();loading.style.display='none';
    if(!events.length){wrap.innerHTML='<div style="font-size:12px;color:#aaa;padding:10px 0;">No drafts.</div>';return;}
    events.forEach(v=>{
      const row=document.createElement('div');row.className='eu-event-row';row.id=`eu-draft-row-${v.id}`;row.dataset.artworkUrl=v.artwork_url||'';
      row.innerHTML=`${euThumb(v.artwork_url,v.name)}<div class="eu-event-row-info"><div class="eu-event-row-title">${v.name}</div><div class="eu-event-row-meta">${v.event_date} · ${v.location} · <em>${v.type}</em></div></div><div style="display:flex;gap:6px;flex-shrink:0;"><button class="eu-btn eu-btn-primary eu-btn-sm eu-publish-draft-btn" data-id="${v.id}">Publish</button><button class="eu-remove-btn eu-delete-draft-btn" data-id="${v.id}">Delete</button></div>`;
      wrap.appendChild(row);
    });
    wrap.querySelectorAll('.eu-publish-draft-btn').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        if(!confirm('Publish draft?'))return;btn.disabled=true;btn.textContent='...';
        const id=btn.dataset.id;
        try{
          await fetch(`${EU_URL}/rest/v1/rpc/eu_increment_positions`,{method:'POST',headers:euHeaders(),body:JSON.stringify({})});
          const r=await fetch(`${EU_URL}/rest/v1/events?id=eq.${id}`,{method:'PATCH',headers:{...euHeaders(),'Prefer':'return=minimal'},body:JSON.stringify({draft:false,position:0})});
          if(!r.ok)throw new Error(await r.text());
          document.getElementById(`eu-draft-row-${id}`)?.remove();loadEventList();loadDraftList();
          euStatus('eu-drafts-status','✓','success');
          setTimeout(()=>document.getElementById('eu-drafts-status').className='eu-status',4000);
        }catch(e){btn.disabled=false;btn.textContent='Publish';euStatus('eu-drafts-status','Error: '+e.message,'error');}
      });
    });
    wrap.querySelectorAll('.eu-delete-draft-btn').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        if(!confirm('Delete?'))return;btn.disabled=true;btn.textContent='...';
        const id=btn.dataset.id,draftRow=document.getElementById(`eu-draft-row-${id}`),art=draftRow?.dataset?.artworkUrl||'';
        try{
          const r=await fetch(`${EU_URL}/rest/v1/events?id=eq.${id}`,{method:'DELETE',headers:{apikey:EU_KEY,Authorization:'Bearer '+EU_KEY}});
          if(!r.ok)throw new Error();
          draftRow?.remove();
          if(art&&art.includes('/event-artwork/')){
            await _sb.storage.from('event-artwork').remove([art.split('/event-artwork/').pop().split('?')[0]]);
          }
          euStatus('eu-drafts-status','✓','success');
          setTimeout(()=>document.getElementById('eu-drafts-status').className='eu-status',3000);
        }catch(e){btn.disabled=false;btn.textContent='Delete';}
      });
    });
  }catch(e){loading.textContent='Failed.';}
}

document.getElementById('pu-sidebar-toggle').addEventListener('click',function(){
  const s=document.getElementById('pu-sidebar'),w=document.querySelector('.pu-wrap'),ex=s.classList.toggle('expanded');
  if(w)w.style.paddingLeft=ex?'calc(200px + 20px)':'calc(48px + 20px)';
  this.innerHTML=ex?'&#10005;':'&#9776;';
});
