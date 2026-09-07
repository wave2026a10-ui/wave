'use strict';
function feeCalculator(container) {
  const section=document.createElement('section');section.className='panel fee-calculator';
  section.innerHTML='<span class="eyebrow">'+t('FEE EXPLORER','费用计算器')+'</span><h2>'+t('Where does each fee go?','每笔费用流向哪里？')+'</h2><p class="muted">'+t('Illustration of the proposed policy, not a live trade quote. Enter an amount in any single quote currency.','拟议费用规则演示，并非实时交易报价。金额以同一种计价币计算。')+'</p><div class="form-grid">'+field('calc-amount',t('Trade amount','交易金额'),'number','1000','min="0" max="1000000000000" step="any"')+field('calc-tax',t('Creator Tax (%)','创建者税费（%）'),'number','0','min="0" max="2" step="0.1"')+'</div><div id="calc-result" aria-live="polite"></div>';
  container.append(section);
  const calc=()=>{const a=$('calc-amount'),b=$('calc-tax');const result=waveFees(Number(a.value),Number(b.value));if(!a.value||!b.value||!a.validity.valid||!b.validity.valid||!result){$('calc-result').textContent=t('Enter a valid amount and a tax between 0% and 2%.','请输入有效金额和 0%–2% 的税率。');return}const fmt=x=>x.toLocaleString(zh?'zh-CN':'en-US',{maximumFractionDigits:8});$('calc-result').innerHTML=row(t('Total trading fee','总交易费'),fmt(result.total))+row(t('Creator (including Creator Tax)','创建者（含创建者税费）'),fmt(result.creator))+row(t('Liquidity / risk reserve','流动性 / 风险储备'),fmt(result.reserve))+row(t('Future WAVE buyback budget','未来 WAVE 回购预算'),fmt(result.buyback))+row(t('Security & infrastructure','安全与基础设施'),fmt(result.infrastructure))+row(t('Operations','运营'),fmt(result.operations))+'<small>'+t('Network gas, launch fees and price impact are excluded.','不包含网络 Gas、发行费与价格影响。')+'</small>'};
  $('calc-amount').oninput=calc;$('calc-tax').oninput=calc;calc();
}
if(page==='docs.html'||page==='analytics.html')feeCalculator($('content'));
if(page==='create-token-complete.html'){
  const form=$('launch-form');
  const recipient=document.createElement('div');
  recipient.innerHTML=field('recipient',t('Creator fee recipient (optional draft setting)','创建者收款地址（草稿选填）'),'text','','autocomplete="off" spellcheck="false"')+'<small>'+t('Leave blank to decide later. This is an address format check only, not proof of ownership or contract compatibility.','可暂时留空。仅检查地址格式，不代表已验证所有权或合约兼容性。')+'</small>';
  $('ack').closest('label').before(recipient);
  try{$('recipient').value=JSON.parse(localStorage.getItem('wave-draft')||'{}').recipient||''}catch{}
  function validateRecipient(){const address=$('recipient').value.trim();const valid=!address||(chain==='SOL'?/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address):/^0x[0-9a-fA-F]{40}$/.test(address)&&!/^0x0{40}$/.test(address));$('recipient').setCustomValidity(valid?'':t('Enter a non-zero address matching the selected network.','请输入与所选网络匹配的非零地址。'));}
  $('recipient').oninput=validateRecipient;$('chain').addEventListener('change',validateRecipient);validateRecipient();
  const originalSave=saveDraft;
  saveDraft=function(show){originalSave(show);try{const draft=JSON.parse(localStorage.getItem('wave-draft')||'{}');draft.recipient=$('recipient').value.trim();localStorage.setItem('wave-draft',JSON.stringify(draft))}catch{}};
  const originalSubmit=form.onsubmit;
  form.onsubmit=e=>{originalSubmit(e);const details=[
    [t('Network','网络'),$('chain').selectedOptions[0].text],
    [t('Liquidity budget','流动性预算'),$('liquidity').value+' '+native[chain]],
    [t('Creator fee recipient','创建者收款地址'),$('recipient').value.trim()||t('Not specified','未指定')],
    [t('Project website','项目网站'),$('website').value||'—'],
    [t('X profile','X 主页'),$('social').value||'—']];
    for(const [key,value] of details){const r=document.createElement('div');r.className='row';const k=document.createElement('span'),v=document.createElement('b');k.textContent=key;v.textContent=value;r.append(k,v);$('review-content').append(r)}
    document.querySelectorAll('.steps li').forEach((n,i)=>n.classList.toggle('active',i===1));
  };
  $('review').addEventListener('close',()=>document.querySelectorAll('.steps li').forEach((n,i)=>n.classList.toggle('active',i===0)));
  const exportButton=document.createElement('button');exportButton.type='button';exportButton.textContent=t('Export draft','导出草稿');$('save').after(exportButton);
  exportButton.onclick=()=>{const draft={version:1,kind:'wave-launch-draft',createdAt:new Date().toISOString()};for(const id of ['name','ticker','description','website','social','supply','tax','liquidity','chain','recipient'])draft[id]=$(id).value;draft.logoIncluded=false;const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='wave-launch-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('form-status').textContent=t('Draft exported. Logo is not included; no transaction was sent.','草稿已导出。文件不含 Logo，未发送交易。')};
  const counter=document.createElement('small');counter.id='description-count';$('description').after(counter);const count=()=>counter.textContent=$('description').value.length+' / 1000';$('description').addEventListener('input',count);count();
  for(const id of ['website','social'])$(id).addEventListener('input',()=>{const value=$(id).value;let valid=!value;try{const url=new URL(value);valid=url.protocol==='https:'&&(id!=='social'||['x.com','www.x.com','twitter.com','www.twitter.com'].includes(url.hostname))}catch{}$(id).setCustomValidity(valid?'':t('Use an HTTPS URL; X profile must be on x.com or twitter.com.','请输入 HTTPS 地址；X 主页必须位于 x.com 或 twitter.com。'))});
}
if(page==='docs.html'){
  const search=document.createElement('label');search.className='field';search.innerHTML='<span>'+t('Search documentation','搜索文档')+'</span><input type="search" id="doc-search" placeholder="'+t('Fees, buyback, launch…','费用、回购、发行…')+'">';document.querySelector('.doc-links').before(search);
  const status=document.createElement('p');status.setAttribute('role','status');status.className='muted';search.after(status);
  $('doc-search').oninput=()=>{const query=$('doc-search').value.trim().toLowerCase();let count=0;document.querySelectorAll('#content>section').forEach(s=>{s.hidden=!!query&&!s.textContent.toLowerCase().includes(query);if(!s.hidden)count++});status.textContent=count?t('Sections found: ','找到章节：')+count:t('No matching sections. Try another term.','未找到相关章节，请尝试其他关键词。')};
  document.querySelectorAll('.doc-links a').forEach(a=>a.addEventListener('click',()=>{$('doc-search').value='';$('doc-search').oninput()}));
}
if(page==='portfolio.html'){
  try{const draft=JSON.parse(localStorage.getItem('wave-draft')||'null');if(draft){const summary=document.createElement('p');summary.className='draft-summary';summary.textContent=(draft.name||t('Untitled draft','未命名草稿'))+' · '+(draft.chain||'BSC')+' · $'+(draft.ticker||'—');document.querySelector('#content .panel h2').after(summary)}}catch{}
}
// Dynamic document sections are now available: honor direct section links.
if(location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView();
