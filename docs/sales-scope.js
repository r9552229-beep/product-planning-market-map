/* Geographic sales scope is independent of the country supplying chart prices. */
globalThis.MarketSalesScope={
 key(r){return JSON.stringify([r.brand,r.model].map(v=>String(v||'').normalize('NFKC').trim().toUpperCase().replace(/[^A-Z0-9\u4e00-\u9fff]/g,'')))},
 index(records,{mode='display',regions=[],countries=[]},volume){const index=new Map();for(const r of records){if(mode==='region'&&regions.length&&!regions.includes(r.region)||mode==='country'&&(countries.length?!countries.includes(r.country):regions.length&&!regions.includes(r.region)))continue;const key=this.key(r),entry=index.get(key)||{sales:0,found:false,countries:new Set()};const v=volume(r);if(Number.isFinite(v)){entry.sales+=v;entry.found=true;if(v>0)entry.countries.add(r.country)}index.set(key,entry)}return index},
 total(records,index){let sum=0;const seen=new Set();for(const r of records){const k=this.key(r);if(seen.has(k))continue;seen.add(k);const entry=index.get(k);if(entry?.found)sum+=entry.sales}return sum}
};
