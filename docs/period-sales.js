/* Shared aggregation used by the chart and Excel export. */
globalThis.MarketPeriods={
 selected(el){return [...el.selectedOptions].map(o=>o.value).filter(v=>v!=='ALL')},
 sum(record,years,months,availableYears,zeroOmitted=false){
  const ys=years.length?years:availableYears.map(String),periods=months.length?ys.flatMap(y=>months.map(m=>`${y}-${m}`)):ys;
  const values=months.length?record.monthlySales:record.sales;
  let total=0,found=false;
  for(const p of new Set(periods)){const value=values?.[p];if(Number.isFinite(value)){total+=value;found=true}else if(zeroOmitted&&values){found=true}}
  return found?total:undefined;
 },
 label(years,months){return `${years.length?years.join('、'):'全部年份'} / ${months.length?months.map(m=>Number(m)+'月').join('、'):'全年'}`}
};