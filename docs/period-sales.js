/* Shared aggregation used by the chart and Excel export. */
globalThis.MarketPeriods={
 range(start,end){if(!/^\d{4}-\d{2}$/.test(start||'')||!/^\d{4}-\d{2}$/.test(end||'')||start>end)return [];const result=[];let [y,m]=start.split('-').map(Number),[ey,em]=end.split('-').map(Number);if(m<1||m>12||em<1||em>12)return [];while(y<ey||y===ey&&m<=em){result.push(`${y}-${String(m).padStart(2,'0')}`);if(++m>12){m=1;y++}if(result.length>1200)return []}return result},
 selection({mode='annual',years=[],months=[],start='',end=''},meta){const ys=years.length?years:(meta.years||[]).map(String),periods=mode==='range'?this.range(start,end):mode==='months'?ys.flatMap(y=>months.map(m=>`${y}-${m}`)):ys;const monthly=mode!=='annual',available=monthly?meta.monthlyPeriods:meta.years?.map(String),missing=available?periods.filter(p=>!available.includes(p)):[];const error=mode==='range'&&!periods.length?'请选择有效的起止月份，结束月份不能早于开始月份。':mode==='months'&&!months.length?'请勾选至少一个月份，或切换“年度销量”。':missing.length?`底表未提供 ${missing.slice(0,3).join('、')}${missing.length>3?' 等'+missing.length+'个期间':''}，未将缺失期间当作0。`:'';return {mode,years:ys,months,start,end,periods,monthly,missing,error,label:mode==='range'?`${start} 至 ${end}（累计）`:mode==='months'?this.label(ys,months):`${ys.join('、')} 年（全年合计）`}},
 value(record,selection,meta){if(selection.error)return undefined;let total=0,found=false;const values=record[selection.monthly?'monthlySales':'sales'];for(const period of selection.periods){const v=values?.[period];if(Number.isFinite(v)){total+=v;found=true}else if(meta.zeroSalesOmitted&&values)found=true}return found?total:undefined},
 selected(el){return [...el.selectedOptions].map(o=>o.value).filter(v=>v!=='ALL')},
 sum(record,years,months,availableYears,zeroOmitted=false,availableMonths=null){
  const ys=years.length?years:availableYears.map(String),periods=months.length?ys.flatMap(y=>months.map(m=>`${y}-${m}`)):ys;
  const values=months.length?record.monthlySales:record.sales;
  if(months.length&&availableMonths&&periods.some(p=>!availableMonths.includes(p)))return undefined;
  let total=0,found=false;
  for(const p of new Set(periods)){if(months.length&&availableMonths&&!availableMonths.includes(p))continue;const value=values?.[p];if(Number.isFinite(value)){total+=value;found=true}else if(zeroOmitted&&values){found=true}}
  return found?total:undefined;
 },
 label(years,months){return `${years.length?years.join('、'):'全部年份'} / ${months.length?months.map(m=>Number(m)+'月').join('、'):'全年'}`}
};
