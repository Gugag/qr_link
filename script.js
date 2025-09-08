(function(){
  const $ = (s)=>document.querySelector(s);
  const els = {
    type: $('#type'),
    size: $('#size'),
    sizeOut: $('#sizeOut'),
    groups: { link: $('#link-group'), pdf: $('#pdf-group'), vcard: $('#vcard-group'), text: $('#text-group'), wifi: $('#wifi-group') },
    inputs: {
      link: $('#link'), pdf: $('#pdf'), vcardName: $('#vcard-name'),
      vcardPhone: $('#vcard-phone'), vcardEmail: $('#vcard-email'),
      text: $('#text'), wifiSsid: $('#wifi-ssid'), wifiPass: $('#wifi-password'), wifiEnc: $('#wifi-encryption')
    },
    canvas: $('#qrCanvas'),
    downloadRow: $('#downloadRow'),
    pngBtn: $('#pngBtn'), jpegBtn: $('#jpegBtn'), pdfBtn: $('#pdfBtn'),
    copyBtn: $('#copyBtn'), shareBtn: $('#shareBtn'),
    generateBtn: $('#generateBtn'), resetBtn: $('#resetBtn'), saveBtn: $('#saveBtn'),
    themeToggle: $('#themeToggle')
  };

  (function initTheme(){
    const saved = localStorage.getItem('qr-theme');
    if(saved === 'light') document.documentElement.classList.add('light');
    els.themeToggle.textContent = document.documentElement.classList.contains('light') ? '🌙' : '☀️';
  })();
  els.themeToggle.addEventListener('click', ()=>{
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('qr-theme', isLight ? 'light' : 'dark');
    els.themeToggle.textContent = isLight ? '🌙' : '☀️';
  });

  const updateSizeOut = ()=>{ els.sizeOut.textContent = `${els.size.value} px`; };
  els.size.addEventListener('input', updateSizeOut); updateSizeOut();

  function showFields(){
    Object.values(els.groups).forEach(g=>g.classList.add('hidden'));
    els.groups[els.type.value].classList.remove('hidden');
  }
  els.type.addEventListener('change', showFields); showFields();

  function ensureURL(s){
    if(!s) return '';
    try{ return new URL(s.includes('://') ? s : `https://${s}`).href; }catch{ return ''; }
  }

  function buildPayload(){
    const t = els.type.value;
    if(t==='link'){
      const url = ensureURL(els.inputs.link.value.trim());
      if(!url) throw new Error('Please enter a valid URL.');
      return url;
    }
    if(t==='pdf'){
      const url = ensureURL(els.inputs.pdf.value.trim());
      if(!url || !/\.pdf(\?|$)/i.test(url)) throw new Error('Enter a valid PDF link ending in .pdf');
      return url;
    }
    if(t==='text'){
      const txt = els.inputs.text.value.trim();
      if(!txt) throw new Error('Please enter some text.');
      return txt;
    }
    if(t==='vcard'){
      const name = els.inputs.vcardName.value.trim();
      const phone = els.inputs.vcardPhone.value.trim();
      const email = els.inputs.vcardEmail.value.trim();
      if(!name) throw new Error('Please enter a name.');
      return ['BEGIN:VCARD','VERSION:3.0',`N:${name};;;;`,`FN:${name}`, phone?`TEL;TYPE=CELL:${phone}`:'', email?`EMAIL:${email}`:'','END:VCARD'].filter(Boolean).join('\n');
    }
    if(t==='wifi'){
      const ssid = els.inputs.wifiSsid.value.trim();
      const pass = els.inputs.wifiPass.value.trim();
      const enc = els.inputs.wifiEnc.value;
      if(!ssid) throw new Error('Enter Wi‑Fi SSID.');
      const T = enc || 'nopass'; const P = enc ? `;P:${pass}` : '';
      return `WIFI:T:${T};S:${ssid}${P};;`;
    }
    throw new Error('Unknown type');
  }

  async function renderQR(){
    const size = parseInt(els.size.value,10) || 320;
    const text = buildPayload();
    await QRCode.toCanvas(els.canvas, text, { errorCorrectionLevel:'M', margin:2, width:size });
    els.downloadRow.classList.remove('hidden');
  }

  function downloadDataURL(dataUrl, filename){
    const a=document.createElement('a');a.href=dataUrl;a.download=filename;document.body.appendChild(a);a.click();a.remove();
  }

  els.pngBtn.addEventListener('click', ()=> downloadDataURL(els.canvas.toDataURL('image/png'),'qr.png'));
  els.jpegBtn.addEventListener('click', ()=> downloadDataURL(els.canvas.toDataURL('image/jpeg',0.95),'qr.jpg'));
  els.pdfBtn.addEventListener('click', ()=>{
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit:'pt', format:'a4' });
    const w = pdf.internal.pageSize.getWidth(); const m=36; const size = Math.min(w-m*2, 512);
    const x = (w - size)/2; const y=120;
    pdf.setFontSize(18); pdf.text('QR Code', m, 72);
    pdf.addImage(els.canvas.toDataURL('image/png'),'PNG',x,y,size,size);
    pdf.save('qr.pdf');
  });

  els.copyBtn.addEventListener('click', async ()=>{
    try{
      const blob = await (await fetch(els.canvas.toDataURL('image/png'))).blob();
      await navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})]);
      els.copyBtn.textContent='Copied!'; setTimeout(()=>els.copyBtn.textContent='Copy Image',1200);
    }catch{ alert('Copy failed. Use Download instead.'); }
  });

  els.shareBtn.addEventListener('click', async ()=>{
    try{
      const blob = await (await fetch(els.canvas.toDataURL('image/png'))).blob();
      const file = new File([blob],'qr.png',{type:blob.type});
      if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
        await navigator.share({files:[file], title:'QR Code'});
      }else{ alert('Sharing not supported on this device.'); }
    }catch{}
  });

  els.generateBtn.addEventListener('click', async ()=>{ try{ await renderQR(); autosave(); }catch(e){ alert(e.message); } });
  els.resetBtn.addEventListener('click', ()=>{
    Object.values(els.inputs).forEach(i=>i && (i.value=''));
    els.canvas.getContext('2d').clearRect(0,0,els.canvas.width,els.canvas.height);
    els.downloadRow.classList.add('hidden'); localStorage.removeItem('qr-state');
  });

  function autosave(){
    const s = {t:els.type.value,s:els.size.value,link:els.inputs.link.value,pdf:els.inputs.pdf.value,
      vn:els.inputs.vcardName.value,vp:els.inputs.vcardPhone.value,ve:els.inputs.vcardEmail.value,
      txt:els.inputs.text.value,ws:els.inputs.wifiSsid.value,wp:els.inputs.wifiPass.value,we:els.inputs.wifiEnc.value};
    localStorage.setItem('qr-state', JSON.stringify(s));
  }
  function restore(){
    try{
      const s=JSON.parse(localStorage.getItem('qr-state')||'{}'); if(!s) return;
      if(s.t) els.type.value=s.t; if(s.s) els.size.value=s.s; els.inputs.link.value=s.link||''; els.inputs.pdf.value=s.pdf||'';
      els.inputs.vcardName.value=s.vn||''; els.inputs.vcardPhone.value=s.vp||''; els.inputs.vcardEmail.value=s.ve||'';
      els.inputs.text.value=s.txt||''; els.inputs.wifiSsid.value=s.ws||''; els.inputs.wifiPass.value=s.wp||''; els.inputs.wifiEnc.value=s.we||'WPA';
      showFields(); const ev=new Event('input'); els.size.dispatchEvent(ev);
    }catch{}
  }
  els.saveBtn.addEventListener('click', autosave);
  restore();

  window.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && (e.ctrlKey||e.metaKey)) els.generateBtn.click(); });
})();
