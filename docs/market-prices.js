/* Price provenance and conservative public-price fallback; no cross-market matching. */
globalThis.MarketPrices={
 years(selection){return [...new Set((selection.mode==='range'?this.rangeYears(selection.start,selection.end):selection.years).map(Number))]},
 rangeYears(start,end){const a=Number(start?.slice(0,4)),b=Number(end?.slice(0,4));return a&&b&&a<=b?Array.from({length:b-a+1},(_,i)=>a+i):[]},
 resolve(r,{includeReference=true,publicPolicy='matched',allowUnclearTax=false,years=[]}={}){
  if(Number.isFinite(r.price)&&r.price>0)return {amount:r.price,currency:r.currency,kind:'weighted',method:r.priceMethod,year:r.priceYear,source:r.priceSourceUrl||'',variant:r.priceMatchedModel||r.model,tax:'JATO原表价格口径'};
  if(includeReference&&Number.isFinite(r.referencePrice)&&r.referencePrice>0)return {amount:r.referencePrice,currency:r.currency,kind:r.priceStatus||'reference',method:r.priceMethod,year:r.priceYear,source:r.priceSourceUrl||'',variant:r.priceMatchedModel||r.model,tax:'JATO原表参考价口径'};
  const p=r.publicPrice;if(p?.allowedBodies){const bodies=r.classificationDetails?.filter(x=>x.sales>0).map(x=>x.body)||[r.body];if(bodies.some(body=>!p.allowedBodies.includes(body)))return null}if(!includeReference||!p||publicPolicy==='none')return null;
  if(!allowUnclearTax&&p.taxBasis!=='inclusive')return null;
  if(publicPolicy!=='cross'&&!p.applicableYears.some(y=>years.includes(y)))return null;
  return {amount:p.amount,currency:p.currency,kind:'public-reference',method:`公开参考价：${p.type}；${p.period}；${p.tax}`,year:p.applicableYears.join('、'),source:p.source,variant:p.variant,tax:p.tax,checked:p.checked,scope:p.scope,period:p.period,crossPeriod:!p.applicableYears.some(y=>years.includes(y)),review:p.review,previousQuote:p.previousQuote,timeBasis:p.timeBasis,note:p.note};
 },
 aggregate(records,volume){
  const groups=new Map();for(const r of records){const key=JSON.stringify([r.country,globalThis.MarketSalesScope?MarketSalesScope.key(r):[r.brand,r.model]]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)}
  return [...groups.values()].map(parts=>{if(parts.length===1)return {...parts[0],sourceRowCount:1};const sorted=[...parts].sort((a,b)=>(volume(b)||0)-(volume(a)||0)),r={...sorted[0],sales:{},monthlySales:{},sourceRowCount:parts.length,classificationDetails:[]};
   for(const p of parts){for(const field of ['sales','monthlySales'])for(const [period,v]of Object.entries(p[field]||{}))if(Number.isFinite(v))r[field][period]=(r[field][period]||0)+v;r.classificationDetails.push({region:p.region,segment:p.segment,body:p.body,architecture:p.architecture,tier:p.tier,sales:volume(p)??null})}
   const active=parts.filter(p=>(volume(p)||0)>0),priceParts=active.length?active:parts;for(const field of ['price','referencePrice','currency','length']){const values=new Set(priceParts.map(p=>p[field]??null));if(values.size>1){r[field]=null;r.coverageReason='同一国家车型的'+field+'存在冲突，待核验'}else r[field]=priceParts[0][field]}
   r.classificationNote='分类标签按所选期间销量最大的分类展示；销量为筛选后分类记录之和。';return r;
  });
 }
};
