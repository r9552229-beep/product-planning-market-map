/* All source files stay on-device. Conversion runs off the UI thread. */
document.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id);
 $('importData').onclick=async()=>{const button=$('importData');button.disabled=true;let worker;try{
  const j=$('jatoFile').files[0],i=$('ihsFile').files[0];if(!j||!i)throw Error('请选择两份Excel底表');
  $('importResult').textContent='正在浏览器中处理底表，请保持此页面打开…';
  worker=new Worker('./source-worker.js');const result=new Promise((resolve,reject)=>{worker.onmessage=e=>e.data.error?reject(Error(e.data.error)):resolve(e.data);worker.onerror=e=>reject(Error(e.message))});
  worker.postMessage({jato:await j.arrayBuffer(),ihs:await i.arrayBuffer(),jatoName:j.name,ihsName:i.name,mapping:JSON.parse($('mapping').value||'{}')});
  const p=await result;window.marketImportedPayload=p;window.dispatchEvent(new CustomEvent('market-import-ready',{detail:p}));$('importResult').textContent=JSON.stringify(p.audit,null,2);$('publishData').disabled=false;
 }catch(e){$('importResult').textContent=e.message}finally{button.disabled=false;worker?.terminate()}};
 // Feed the existing page's publish handler through an entirely in-memory response.
 const original=window.fetch;window.fetch=async(input,options={})=>{
  if(String(input)==='/api/data'&&options.method==='PUT'&&window.marketImportedPayload)window.marketImportedPayload=null;
  return original(input,options);
 };
 // Import conversion above is reused by v2's import action through this hook.
 window.marketSourceReady=()=>window.marketImportedPayload;
});