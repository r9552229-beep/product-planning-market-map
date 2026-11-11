/* Static-site adapter. API-like calls below stay entirely inside this browser. */
(()=>{
const originalFetch=window.fetch.bind(window),memory={workspace:{version:0,envelope:null},data:null};
function download(value,name,type='application/json'){const url=URL.createObjectURL(new Blob([value],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
window.fetch=async(input,options={})=>{
 const path=String(input);if(!path.startsWith('/api/'))return originalFetch(input,options);
 const endpoint=path.slice(5),body=options.body?JSON.parse(options.body):undefined;
 const response=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'Content-Type':'application/json'}});
 if(endpoint==='login')return response({role:'editor'});
 if(endpoint==='data'&&!body){if(!memory.data){const r=await originalFetch('./market-data.enc.json',{cache:'no-store'});if(!r.ok)return response({error:'无法读取已发布的加密数据'},r.status);memory.data={version:1,envelope:await r.json()}}return response(memory.data)}
 if(endpoint==='workspace'||endpoint==='data'){
  if(!body)return response(memory[endpoint]);
  const item=memory[endpoint]||{version:0};if(body.version!==item.version)return response({error:'页面版本已变化，请重新加载'},409);
  memory[endpoint]={version:item.version+1,envelope:body.envelope};
  download(JSON.stringify(body.envelope),endpoint==='data'?'market-data.enc.json':'商品企划作图方案.enc.json');
  return response({version:item.version+1});
 }
 if(endpoint==='history')return response({versions:[]});
 if(endpoint==='export'){
  const years=MarketPeriods.selected(document.getElementById('year')),months=MarketPeriods.selected(document.getElementById('month'));
  body.rows.forEach(r=>{r[r.length-2]=years.join('、')||'全部年份';r[r.length-1]=months.join('、')||'全年'});
  body.notes['销量汇总期间']=MarketPeriods.label(years,months);
  body.notes['参考价']='虚线参考点可能来自缺销量权重的配置等权均价，或原底表同国附表的价格（期间未注明）；各车型单列计算口径，未混称为重新计算的销量加权价。';
  const headerNames={country:'国家',region:'区域',brand:'品牌',model:'车型',energy:'车型能源标签',segment:'区隔',body:'Bodytype',architecture:'承载结构',tier:'主高豪',length:'作图车长mm',price:'销量加权价格',referencePrice:'配置等权参考价',priceStatus:'价格状态',priceMethod:'价格计算口径',priceYear:'价格权重年份',priceMonths:'权重月份数',priceWeight:'价格权重样本销量',priceMatch:'匹配方式',priceMatchedModel:'JATO对应车型',coverageReason:'数据覆盖说明',currency:'币种'};
  body.headers=body.headers.map(h=>headerNames[h]||h);
  return new Response(await window.makeMarketWorkbook(body),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}});
 }
 if(endpoint==='import')return response({error:'请在数据更新窗口选择两份底表，浏览器将直接处理'},400);
 return response({error:'当前使用无后台版本，此操作不可用'},400);
};
document.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id);
 $('f-segment').parentElement.firstChild.textContent='区隔（A/B/C/D 等大小级别）';
 $('f-body').parentElement.firstChild.textContent='Bodytype（SUV/ORV/Car 等）';
 $('servicePassword').required=false;$('servicePassword').parentElement.hidden=true;
 document.title='商品企划市场图谱';document.querySelector('.eyebrow').textContent='PRODUCT PLANNING · MARKET ATLAS';$('loginPanel').querySelector('h2').textContent='解锁部门市场图谱';$('loginPanel').querySelector('p').textContent='密钥只在浏览器内存中使用。当前版本不设共享后台；关闭页面后清除作图设置。';
 $('status').textContent='输入部门数据密钥，直接选择和作图';$('sync').textContent='重载数据';$('save').textContent='导出加密作图方案';$('sharedVersion').parentElement.querySelector('span').textContent='保存方式';$('sharedVersion').textContent='当前页面内存';$('scheme').parentElement.firstChild.textContent='当前页面方案';$('newScheme').textContent='新建页面方案';$('deleteScheme').textContent='删除页面方案';
 document.querySelector('.subtitle').textContent='统一底表，自由筛选、作图与导出';document.querySelector('.star-card small').textContent='参考点保留在当前页面。导出加密方案可留存或发给同事。';
 $('loadHistory').hidden=true;$('publishData').textContent='应用数据并下载加密发布文件';$('dataManager').querySelector('p').textContent='导入与转换均在浏览器完成。应用只影响当前页面；下载的加密文件更新至网站后，同事才能读取新底表。';
 const label=document.createElement('label');label.textContent='导入已保存的加密方案';const file=document.createElement('input');file.type='file';file.accept='.json';label.append(file);document.querySelector('.scheme-bar').append(label);
 file.onchange=async()=>{try{const e=JSON.parse(await file.files[0].text());if(e.cipher!=='AES-256-GCM')throw Error('请选择加密方案文件');memory.workspace={version:memory.workspace.version+1,envelope:e};$('sync').click()}catch(e){$('status').textContent=e.message}};
});
})();