const test=require('node:test'),assert=require('node:assert/strict');
const T=require('../assets/travel-tip-core.js');
test('rotation alternates topics without starving contiguous tips of one topic',()=>{
 const list=['OMNY cap','OMNY device','OMNY group','Getty museum','Hotel incidentals'];
 const r=T.createRotation(),shown=new Set([0]);let index=0;
 for(let i=0;i<100;i++){
  const next=r.nextIndex(list,index);assert.notEqual(next,index);assert.notEqual(T.topic(list[index]),T.topic(list[next]));shown.add(next);index=next;
 }
 assert.equal(shown.size,list.length);
});
test('single-topic lists rotate all items and empty/single-item lists are safe',()=>{
 const r=T.createRotation(),list=['OMNY A','OMNY B','OMNY C'];let index=0;const seen=new Set([index]);
 for(let i=0;i<30;i++){index=r.nextIndex(list,index);seen.add(index);}
 assert.equal(seen.size,3);assert.equal(r.nextIndex([]),0);assert.equal(r.nextIndex(['one']),0);
});
test('new audience cannot retain old indices or an invalid item',()=>{
 const r=T.createRotation();let n=r.nextIndex(['one','two','three'],20);assert.ok(n>=0&&n<3);
 n=r.nextIndex([{text:'novo A'},{text:'novo B'}],20);assert.ok(n>=0&&n<2);
 r.reset();assert.equal(r.nextIndex(['one','two'],0),1);
});
test('lower-priority units remain reachable but appear less frequently',()=>{
 const list=['1 yarda (yd) = 0,9144 m.','1 milla = 1,609 km.','32 °F = 0 °C.','1 libra = 454 g.'];
 const r=T.createRotation(),counts=[0,0,0,0];let index=0;
 for(let i=0;i<400;i++){index=r.nextIndex(list,index);counts[index]++;}
 assert.ok(counts.every(n=>n>0));assert.ok(counts[0]<counts[1]);assert.ok(counts[0]<counts[2]);
});
test('theme detection works across the three languages',()=>{
 for(const s of ['OMNY: tarjeta','Metrorail: bank card','Metrobus: cartão'])assert.equal(T.topic(s),'transit');
 for(const s of ['Propina','Tipping at table service','Gorjeta'])assert.equal(T.topic(s),'tipping');
});
