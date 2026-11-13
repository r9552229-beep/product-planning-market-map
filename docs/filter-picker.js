/* Checkbox pickers keep native select state for filters, schemes and exports. */
(()=>{
const pickers=[];
function mount(select){
 const old=select.parentElement,title=old.firstChild?.textContent.trim()||select.id;
 const host=document.createElement('div');host.className='filter-picker';if(old.id)host.id=old.id;
 const heading=document.createElement('span');heading.className='picker-title';heading.textContent=title;
 old.replaceWith(host);host.append(heading,select);select.hidden=true;
 select.multiple=true;
 if(select.id==='month')select.querySelector('option[value="ALL"]')?.remove();
 const trigger=document.createElement('button');trigger.type='button';trigger.className='picker-trigger';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label',title+'，展开多选');
 const summary=document.createElement('span'),chevron=document.createElement('span');chevron.textContent='⌄';trigger.append(summary,chevron);
 const chips=document.createElement('div');chips.className='picker-chips';
 const panel=document.createElement('div');panel.className='picker-panel';panel.id='picker-'+select.id;panel.hidden=true;panel.setAttribute('role','group');panel.setAttribute('aria-label',title+'选项');trigger.setAttribute('aria-controls',panel.id);
 const search=document.createElement('input');search.type='search';search.placeholder='搜索'+title;search.setAttribute('aria-label','搜索'+title);search.className='picker-search';
 const tools=document.createElement('div');tools.className='picker-actions';
 const all=document.createElement('button'),clear=document.createElement('button'),done=document.createElement('button');
 all.type=clear.type=done.type='button';all.textContent='全选';clear.textContent=select.id==='month'?'恢复全年':'清空选择';done.textContent='完成';tools.append(all,clear,done);
 const help=document.createElement('small');help.textContent=select.id==='month'?'不选月份时使用年度销量；勾选后汇总所选月。':select.id==='year'?'可选多个年份，销量按所选年份相加。':'不勾选时不限制此字段。';
 const list=document.createElement('div');list.className='picker-list';panel.append(search,tools,help,list);host.append(trigger,chips,panel);
 function close(){panel.hidden=true;trigger.setAttribute('aria-expanded','false')}
 function refresh(){
  const focusedValue=list.contains(document.activeElement)?document.activeElement.value:null;
  const opts=[...select.options],chosen=opts.filter(o=>o.selected),query=search.value.trim().toLocaleLowerCase();
  summary.textContent=chosen.length===0?(select.id==='month'?'全年':select.id==='year'?'全部年份':'不限'):chosen.length===1?chosen[0].textContent:`已选 ${chosen.length} 项`;
  trigger.title=chosen.map(o=>o.textContent).join('、')||summary.textContent;
  chips.replaceChildren();chosen.slice(0,3).forEach(o=>{const chip=document.createElement('button');chip.type='button';chip.className='picker-chip';chip.textContent=o.textContent+' ×';chip.title='取消选择 '+o.textContent;chip.onclick=()=>{o.selected=false;changed()};chips.append(chip)});
  if(chosen.length>3){const more=document.createElement('span');more.textContent='另 '+(chosen.length-3)+' 项';chips.append(more)}
  list.replaceChildren();const visible=opts.filter(o=>o.textContent.toLocaleLowerCase().includes(query));
  visible.forEach(o=>{const label=document.createElement('label');label.className='picker-option';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.value=o.value;checkbox.checked=o.selected;const name=document.createElement('span');name.textContent=o.textContent;checkbox.onchange=()=>{o.selected=checkbox.checked;select.dispatchEvent(new Event('change',{bubbles:true}));refreshSummary()};label.append(checkbox,name);list.append(label)});
  if(!visible.length){const empty=document.createElement('p');empty.textContent='没有符合的选项';list.append(empty)}
  all.textContent=query?'全选搜索结果':'全选';
  if(focusedValue!==null)[...list.querySelectorAll('input')].find(el=>el.value===focusedValue)?.focus();
 }
 // Refresh chips and trigger without replacing a checkbox that currently has focus.
 function refreshSummary(){const active=document.activeElement,position=[...list.querySelectorAll('input')].indexOf(active);refresh();if(position>=0)list.querySelectorAll('input')[position]?.focus()}
 function changed(){select.dispatchEvent(new Event('change',{bubbles:true}));refresh()}
 trigger.onclick=()=>{const opening=panel.hidden;pickers.forEach(p=>p.close());if(opening){panel.hidden=false;trigger.setAttribute('aria-expanded','true');refresh();search.focus()}};
 search.oninput=refresh;
 all.onclick=()=>{const q=search.value.toLocaleLowerCase().trim();[...select.options].filter(o=>!q||o.textContent.toLocaleLowerCase().includes(q)).forEach(o=>o.selected=true);changed()};
 clear.onclick=()=>{[...select.options].forEach(o=>o.selected=false);changed()};
 done.onclick=()=>{close();trigger.focus()};
 panel.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();close();trigger.focus()}};
 document.addEventListener('pointerdown',e=>{if(!host.contains(e.target))close()});
 new MutationObserver(refresh).observe(select,{childList:true,subtree:true});
 select.addEventListener('change',refresh);
 pickers.push({refresh,close});refresh();
}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('#filters select,#salesSelectors select').forEach(mount);
 const method=document.getElementById('method');new MutationObserver(()=>{if(method.textContent.includes('Ctrl/Command'))method.textContent=method.textContent.replace('Ctrl/Command 可多选分类；不选择表示全部。','点击字段后勾选，可搜索、多选或清空。价格固定使用底表注明年份的销量权重，切换销量年份不会变成历史价格。IHS 底表含历史及预测数据，2026年全年值不等于年内已实现销量。')}).observe(method,{childList:true});
});
document.addEventListener('market-filters-rendered',()=>pickers.forEach(p=>p.refresh()));
})();
