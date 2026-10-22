const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(require.resolve('../assets/ui.js'),'utf8');
test('shared outline SVGs cover prohibited-sign tips, park icons and unknown decorative symbols',()=>{
 const window={},c=vm.createContext({window});
 vm.runInContext(src.slice(src.indexOf('  const ICONS ='),src.indexOf('  const BY_HREF ='))+'\n'+src.slice(src.indexOf('  const norm ='),src.indexOf('  function pick(')),c);
 for(const symbol of ['🚫','🎢','🚌','🧿','ferris']){
  const result=window.uiTipIcon(symbol,20);assert.match(result,/<svg/);assert.match(result,/<path|<circle|<rect/);assert.doesNotMatch(result,/\p{Extended_Pictographic}/u);
 }
});
test('dynamic editorial city tips escape text and replace emoji prefixes with SVGs',()=>{
 const source=fs.readFileSync(require.resolve('../assets/lugares-ciudades.js'),'utf8');
 const window={uiTipIcon:name=>`<svg data-icon="${name==='🎢'?'ferris':name}"></svg>`},c=vm.createContext({window});
 vm.runInContext(source.slice(source.indexOf('window.renderCityTip ='),source.indexOf('window.renderCityGrid =')),c);
 assert.match(window.renderCityTip('🎢 Universal <entrada>'),/<svg/);assert.match(window.renderCityTip('🎢 Universal <entrada>'),/&lt;entrada&gt;/);
 assert.doesNotMatch(window.renderCityTip('🎢 Universal'),/🎢/);assert.match(window.renderCityTip('Disney World'),/ferris/);
});
