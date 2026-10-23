/* TaxFly · mascota animada (rig SVG + motor de animación sin dependencias).
   Dibujo original: pin azul "Taxie-pin". Estados: idle, wave, point, cheer, think (+ talk, hop).
   Uso: const m = TaxflyMascot.create(hostEl, {state:'idle'}); m.set('wave'); m.pointAt(x,y); m.talk(1500); m.hop(); */
(function(root){
  'use strict';
  if(root.TaxflyMascot)return;
  const NS='http://www.w3.org/2000/svg';
  const COL={dark:'#10090D',navy:'#14213D',gold:'#FFC857',blue:'#2F6BFF',shadow:'#10090D'};
  const D={"body":"M1784.26 407.582C1801.64 405.612 1825.45 407.125 1842.73 409.55C1916.72 419.922 1983.61 459.119 2028.84 518.599C2075.42 580.718 2092.04 655.535 2081.33 732.008C2058.45 895.304 1881.49 1092.57 1753.14 1187.94C1739.77 1173.91 1711.05 1134.45 1699.78 1118.26C1631.05 1019.47 1578.32 922.886 1543.52 807.564C1549.88 799.63 1558.36 791.334 1565.76 784.312C1578.09 772.598 1594.82 763.134 1599.42 745.717C1602.2 735.021 1600.54 723.656 1594.82 714.198C1588.71 704.415 1578.96 697.46 1567.71 694.86C1550.04 690.678 1536.55 698.095 1522.27 707.01C1519.76 630.116 1538.1 562.217 1589.55 503.231C1639.16 446.737 1709.22 412.32 1784.26 407.582Z","ring":"M1812.75 520.443C1880.88 512.931 1942.23 561.975 1949.91 630.084C1957.59 698.193 1908.7 759.668 1840.61 767.514C1772.28 775.387 1710.55 726.286 1702.84 657.941C1695.13 589.596 1744.39 527.982 1812.75 520.443Z","ringIn":"M1823.5 524.12C1889.31 522.503 1944.13 574.226 1946.33 640.019C1948.54 705.813 1897.31 761.09 1831.54 763.884C1764.93 766.713 1708.79 714.687 1706.56 648.056C1704.33 581.426 1756.85 525.758 1823.5 524.12Z","eyeL":"M1797.31 804.001C1829.47 803.673 1828.63 859.669 1807.64 870.409L1804.46 872.029C1779.89 873.05 1777.05 839.207 1782.2 821.509C1784.76 812.725 1789.31 807.981 1797.31 804.001Z","eyeLIn":"M1799.4 808.003C1819.27 809.953 1820.14 838.107 1816.04 852.495C1813.37 861.862 1810.68 863.267 1803.27 868.361C1780.16 866.244 1776.58 821.256 1799.4 808.003Z","eyeR":"M1898.18 803.994C1927.34 804.562 1931.33 859.479 1904.34 872.686C1879.76 872.578 1877.26 839.373 1882.65 821.393C1885.26 812.669 1890.16 807.845 1898.18 803.994Z","eyeRIn":"M1900.29 808.257C1901.7 808.546 1903.09 808.89 1904.46 809.289C1922.05 814.496 1924.81 857.943 1902.45 868.907C1885.84 864.71 1882.8 845.571 1885.26 831.012C1887.1 820.11 1889.85 812.381 1900.29 808.257Z","smile":"M1750.57 874.742C1752.43 874.572 1752.06 874.739 1754.01 875.359L1753.89 876.91C1751.18 879.67 1748.01 881 1744.56 882.822C1770.83 942.83 1825.59 925.809 1832.34 932.944L1831.25 934.301C1826.22 935.782 1820.68 935.112 1815.38 934.866C1779.05 932.432 1756.09 918.199 1740.76 884.844C1737.67 886.344 1732.86 889.026 1729.41 888.342L1729.72 887.028C1736.29 881.574 1742.99 878.572 1750.57 874.742Z","armL":"M1550.29 698.252C1588.56 692.465 1613.09 739.202 1585 761.583C1527.4 807.481 1493.17 864.178 1475.16 935.084C1472.86 944.167 1471.43 954.306 1469.37 963.915C1455.37 954.174 1450.13 952.913 1433.74 950.212C1422.03 949.724 1409.33 948.848 1397.9 951.839C1393.47 952.998 1385.43 958.94 1381.44 957.021C1381.61 949.99 1383.92 938.454 1385.25 931.31C1392.81 889.143 1407.94 848.69 1429.88 811.899C1443.56 788.626 1469.94 757.045 1490.04 738.44C1493.64 735.111 1496.44 733.954 1499.88 731.246C1502.03 729.556 1504.88 725.186 1507.52 723.032C1519.53 713.263 1535.26 702.133 1550.29 698.252Z","footL":"M1554.85 1357.78C1538.27 1340.23 1521.8 1322.56 1505.45 1304.79C1488.4 1286.36 1460.48 1263.7 1467.84 1235.98C1469.36 1230.4 1472.16 1225.25 1476.02 1220.94C1481.74 1214.44 1522.27 1184.76 1529.93 1180.24C1545.57 1198.13 1580.49 1231.04 1598.53 1248.51C1592.81 1250.19 1578.44 1255.24 1575.02 1259.8L1576.16 1260.91C1580 1261.37 1596.87 1250.65 1613.5 1250.09C1629.87 1249.52 1645.78 1255.59 1657.6 1266.93C1678.83 1287.19 1684.18 1321.98 1662.2 1343.63C1655.79 1349.87 1647.79 1354.24 1639.08 1356.29C1627.06 1359.18 1570.55 1357.86 1554.85 1357.78Z","footR":"M1836.61 1255.16L1853.29 1255.32C1866.08 1256.21 1905.3 1256.57 1918.65 1255.75L1935.15 1255.9C1932.71 1260.14 1921.95 1275.25 1923.34 1279.02C1923.96 1279 1924.58 1278.98 1925.2 1278.96C1930.9 1272.84 1936.59 1267.71 1943.8 1263.71C1958.54 1255.56 1975.91 1253.57 1992.11 1258.19C2007.44 1262.69 2020.34 1273.13 2027.93 1287.18C2034.51 1299.17 2035.97 1313.29 2032 1326.37C2026.84 1343.14 2013.75 1357.24 1995.2 1357.81C1972.8 1358.5 1950.21 1357.67 1927.77 1357.7C1904.89 1357.72 1882 1358.02 1859.12 1357.92C1843.58 1357.68 1829.99 1351.11 1822.77 1336.96C1814.01 1319.76 1821.22 1303.69 1826.52 1286.77C1829.8 1276.2 1833.16 1265.67 1836.61 1255.16Z","armR":"M2097.76 699.336C2118.07 699.031 2147.42 699.558 2167.43 699.77C2182.89 699.933 2293.48 698.727 2295.55 700.825C2294.41 704.97 2288.67 709.074 2287.29 712.314C2278.3 733.433 2277.03 755.202 2284.38 777.059C2286.24 782.599 2285.88 784.247 2289.58 789.052L2288.65 790.522L2284.25 791.087C2253.46 789.449 2219.2 790.38 2188.25 790.17C2149.15 789.904 2109.83 789.887 2070.77 791.661C2080.69 770.867 2087.03 724.307 2088.83 701.247C2091.19 699.236 2094.52 699.531 2097.76 699.336Z","legR":"M1836.29 1122.71C1844.38 1115.85 1900.56 1058.49 1901.61 1058.18C1910.35 1061.31 1927.89 1081.63 1934.71 1089.37C1977.73 1138.11 1965.03 1202.61 1936.65 1254.99C1931.02 1254.75 1924 1254.06 1918.65 1255.75C1905.3 1256.57 1866.08 1256.21 1853.29 1255.32L1854.09 1254.6C1847.94 1254.06 1842.57 1253.87 1836.39 1253.72C1842.55 1240.07 1845.73 1223.76 1849.43 1209.25C1859.18 1171.04 1865.74 1151.86 1836.29 1122.71Z","legL":"M1529.93 1180.24C1544.85 1167.41 1562.64 1154.65 1576.5 1140.88C1591.27 1126.2 1605.53 1109.28 1618.87 1093.25C1629.96 1079.94 1637.91 1062.77 1648.52 1049.6C1651.44 1051.08 1660.38 1067.49 1663.29 1071.82C1678.9 1095.02 1694.81 1120.12 1711.99 1142.11C1690.81 1177.62 1652.96 1208.9 1620.72 1233.89C1616.5 1237.17 1603.04 1247.42 1598.53 1248.51C1580.49 1231.04 1545.57 1198.13 1529.93 1180.24Z","handL":"M1417.76 953.465C1463.31 953.378 1472.37 969.86 1499.06 1002.07C1504.56 1008.72 1511.11 1019.22 1508.06 1028.11C1505.13 1036.67 1491.5 1047.28 1482.1 1043.86C1473.52 1040.58 1480.6 1026.69 1477.85 1019.82L1476.28 1019.82C1475.2 1022.36 1475.2 1026.3 1474.86 1029.16C1472.93 1045.44 1473.88 1053.04 1463.87 1066.47C1442.91 1090.45 1402.48 1090.65 1379.66 1069.48C1359.34 1050.82 1364.51 1034.6 1366.82 1011.49C1370.86 970.988 1371.21 955.741 1417.76 953.465Z","handP":"M2302.66 698.866C2352.23 697.381 2406.04 699.291 2455.91 699.37C2477.88 699.405 2481.47 736.794 2454.48 738.681C2430.68 740.345 2406.04 739.393 2382.02 739.415C2385.44 747.243 2386.16 750.84 2391.45 757.541L2392.15 757.085L2391.37 757.149L2392.07 755.956L2390.98 756.567L2390.76 756.195L2391.87 754.716C2391.43 751.661 2388.99 745.997 2387.78 742.893L2419.67 743.069C2420.02 749.964 2420.01 753.96 2419.59 760.848C2404.22 804.173 2342.3 796.965 2334.56 753.168C2333.83 749.077 2334.91 740.369 2332.81 737.395L2331.25 738.06C2329.09 743.21 2330.61 752.179 2331.41 757.659C2313.3 771.55 2323.36 768.237 2316.7 785.539C2314.11 792.272 2310.2 787.605 2306.51 802.561C2305.08 801.344 2303.67 800.098 2302.29 798.822C2275.64 774.071 2278.44 724.902 2302.66 698.866Z","f1":"M2331.94 761.726C2333.3 762.724 2333.46 762.809 2334.11 764.443C2340.03 779.415 2352.6 789.232 2368.27 792.487C2379.01 794.72 2385.2 793.224 2395.81 791.178C2391.51 799.714 2390.17 802.388 2382.63 808.812L2381.91 809.23C2350.24 828.099 2301.41 789.365 2331.94 761.726Z","f2":"M2356.1 821.748C2341.39 827.106 2320.71 820.398 2312.47 806.57C2309.03 800.797 2311.91 793.466 2317.69 790.481C2321.04 788.749 2324.21 800.34 2327.12 801.682C2333.95 810.008 2340.22 811.163 2348.7 815.764C2352.69 816.827 2367.73 818.494 2356.1 821.748Z","mitt":"M983.842 227.401C1015.66 226.718 1042 251.846 1045.2 283.06C1047.41 309.739 1041.33 345.644 1024.47 367.078C999.256 399.136 950.29 397.417 920.584 373.53C912.511 365.851 909.904 360.281 906.584 349.929C897.293 342.001 864.804 317.621 866.218 308.51C873.88 259.154 920.55 306.657 929.608 314.434C931.963 291.675 926.587 266.707 942.152 248.036C953.451 234.482 966.82 229.309 983.842 227.401Z"};
  // Articulaciones (coordenadas del dibujo original)
  const SH_R={x:2030,y:740}, SH_L={x:1565,y:722}, HIP_R={x:1905,y:1075}, HIP_L={x:1650,y:1070}, TIP={x:1748,y:1180}, CENTER={x:1910,y:860};
  const ARM_LEN=245;
  const VB={x:1290,y:250,w:1250,h:1170};
  const reduce=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){return false;}};

  function el(name,attrs,kids){
    const n=document.createElementNS(NS,name);
    if(attrs)for(const k in attrs)n.setAttribute(k,attrs[k]);
    if(kids)for(const c of kids)n.appendChild(c);
    return n;
  }
  // Pieza con contorno: copia oscura engrosada debajo + relleno encima (se ve igual en cualquier renderer)
  function part(d,fill,ow){
    ow=ow||9;
    return el('g',null,[
      el('path',{d:d,fill:COL.dark,stroke:COL.dark,'stroke-width':ow,'stroke-linejoin':'round','stroke-linecap':'round'}),
      el('path',{d:d,fill:fill})
    ]);
  }
  const rot=(a,p)=>'rotate('+a.toFixed(2)+' '+p.x+' '+p.y+')';
  const scl=(sx,sy,p)=>'translate('+p.x+' '+p.y+') scale('+sx.toFixed(4)+' '+sy.toFixed(4)+') translate('+(-p.x)+' '+(-p.y)+')';

  let UID=0;
  function build(){
    const cid='tfm-clip-'+(++UID);
    const svg=el('svg',{viewBox:VB.x+' '+VB.y+' '+VB.w+' '+VB.h,class:'tfm','aria-hidden':'true',focusable:'false'});
    svg.style.overflow='visible';
    const defs=el('defs',null,[el('clipPath',{id:cid},[el('path',{d:D.body})])]);
    const shadow=el('ellipse',{cx:1750,cy:1392,rx:330,ry:26,fill:COL.shadow,opacity:'.16'});
    const flip=el('g'), hop=el('g'), body=el('g');
    // Piernas (detrás del cuerpo) con un tramo extra oculto bajo el cuerpo para que no se abra hueco al moverlas
    const legR=el('g',null,[
      el('g',{'clip-path':'url(#'+cid+')'},[el('line',{x1:1895,y1:1090,x2:1890,y2:990,stroke:COL.navy,'stroke-width':140,'stroke-linecap':'round'})]),
      part(D.legR,COL.navy), part(D.footR,COL.gold)]);
    const legL=el('g',null,[
      el('g',{'clip-path':'url(#'+cid+')'},[el('line',{x1:1675,y1:1085,x2:1712,y2:1000,stroke:COL.navy,'stroke-width':140,'stroke-linecap':'round'})]),
      part(D.legL,COL.navy), part(D.footL,COL.gold)]);
    // Brazo derecho (detrás del cuerpo). Sistema local: hombro en (0,0), brazo hacia +x
    const T0='translate('+(-SH_R.x)+' '+(-SH_R.y)+')';
    const armR=el('g'), armRin=el('g');
    const ln=(x1,x2,w,c)=>el('line',{x1:x1,y1:0,x2:x2,y2:0,stroke:c,'stroke-width':w,'stroke-linecap':'round'});
    armRin.appendChild(ln(-70,60,100,COL.dark));armRin.appendChild(ln(-70,60,90,COL.navy));
    const fore=el('g',null,[ln(30,ARM_LEN-8,100,COL.dark),ln(30,ARM_LEN-8,90,COL.navy)]);
    armRin.appendChild(fore);
    const handPoint=el('g',{transform:T0},[part(D.armR,COL.navy,0),part(D.handP,COL.gold,8),part(D.f1,COL.gold,8),part(D.f2,COL.gold,8)]);
    handPoint.firstChild.firstChild.setAttribute('opacity','0');
    const handMitt=el('g',{transform:'translate('+(ARM_LEN-12)+' 0) rotate(90) translate(-970 -378)'},[part(D.mitt,COL.gold,8)]);
    const handRelax=el('g',{transform:'translate('+(ARM_LEN-8)+' 0) rotate(-90) translate(-1435 -958)'},[part(D.handL,COL.gold,8)]);
    armRin.appendChild(handPoint);armRin.appendChild(handMitt);armRin.appendChild(handRelax);
    armR.appendChild(armRin);
    // Cuerpo + cara
    const torso=part(D.body,COL.blue,10);
    const ring=el('g',null,[el('path',{d:D.ring,fill:COL.dark}),el('path',{d:D.ringIn,fill:COL.navy})]);
    const eyeL=el('g',null,[el('path',{d:D.eyeL,fill:COL.dark}),el('path',{d:D.eyeLIn,fill:COL.navy})]);
    const eyeR=el('g',null,[el('path',{d:D.eyeR,fill:COL.dark}),el('path',{d:D.eyeRIn,fill:COL.navy})]);
    const smile=el('path',{d:D.smile,fill:COL.dark});
    const mouth=el('ellipse',{cx:1818,cy:905,rx:30,ry:2,fill:COL.dark});
    const tongue=el('ellipse',{cx:1818,cy:918,rx:17,ry:1,fill:'#FF7A8A'});
    const mouthG=el('g',{opacity:'0'},[mouth,tongue]);
    const face=el('g',null,[ring,eyeL,eyeR,smile,mouthG]);
    // Brazo izquierdo (delante del cuerpo). Sistema local: hombro en el origen del dibujo trasladado
    const armL=el('g'), armLin=el('g',{transform:'translate('+(-SH_L.x)+' '+(-SH_L.y)+')'},[part(D.armL,COL.navy,9),part(D.handL,COL.gold,8)]);
    armL.appendChild(armLin);
    // Parche del hombro izquierdo: en el dibujo original el brazo tapaba ese pedazo del cuerpo
    const patch=el('g',null,[
      el('path',{d:'M1519 704 Q1523 768 1546 810',fill:'none',stroke:COL.dark,'stroke-width':8,'stroke-linecap':'butt'}),
      el('path',{d:'M1519 688 L1640 688 L1640 840 L1552 822 Q1524 770 1519 688Z',fill:COL.blue})]);
    body.appendChild(legR);body.appendChild(legL);body.appendChild(armR);body.appendChild(torso);body.appendChild(patch);body.appendChild(face);body.appendChild(armL);
    hop.appendChild(body);flip.appendChild(hop);
    svg.appendChild(defs);svg.appendChild(shadow);svg.appendChild(flip);
    return {svg,shadow,flip,hop,body,legR,legL,armR,armRin,fore,handPoint,handMitt,handRelax,ring,eyeL,eyeR,smile,mouthG,mouth,tongue,armL,face};
  }

  const POSES={
    idle :{ar:82, hand:'relax',al:2,  tilt:0, ly:0,   lx:0,  legs:1},
    wave :{ar:-62,hand:'mitt', al:2,  tilt:-2,ly:-.1, lx:0,  legs:1},
    point:{ar:-8, hand:'point',al:3,  tilt:-3,ly:0,   lx:.4, legs:1},
    cheer:{ar:-66,hand:'mitt',al:148,tilt:0, ly:-.2, lx:0,  legs:1.4},
    think:{ar:82, hand:'relax',al:2,  tilt:7, ly:-.8, lx:-.6,legs:.6}
  };
  const lerp=(a,b,k)=>a+(b-a)*k;
  const damp=(cur,tgt,rate,dt)=>cur+(tgt-cur)*(1-Math.exp(-rate*dt));
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  const live=new Set();let raf=0,last=0,acc=0;
  function tick(now){
    raf=0;
    if(!live.size)return;
    const dt=Math.min(.05,(now-last)/1000||.016);last=now;acc+=dt;
    if(document.hidden){raf=requestAnimationFrame(tick);return;}
    let seen=0;
    for(const m of live){if(!m.el.isConnected){live.delete(m);continue;}if(!m.el.getClientRects().length)continue;seen++;m.step(dt);}
    if(seen)raf=requestAnimationFrame(tick);
  }
  function wake(){if(!raf&&live.size){last=performance.now();raf=requestAnimationFrame(tick);}}

  function create(host,opts){
    opts=opts||{};
    const R=build(),svg=R.svg;
    const S={
      t:0,state:'idle',base:'idle',cur:Object.assign({},POSES.idle),hand:'relax',handPop:0,
      ar:82,al:2,tilt:0,lx:0,ly:0,flip:1,flipT:1,
      blinkAt:1.2+Math.random()*2,blink:-1,talkUntil:-1,talkOn:0,mouth:0,
      hopT:-1,hopH:0,timer:null,aim:null,lookTarget:null,still:!!opts.still||reduce()
    };
    const api={el:svg,rig:R};
    function applyHand(h){
      R.handPoint.setAttribute('visibility',h==='point'?'visible':'hidden');
      R.handMitt.setAttribute('visibility',h==='mitt'?'visible':'hidden');
      R.handRelax.setAttribute('visibility',h==='relax'?'visible':'hidden');
      // la pieza del brazo recto ya viene dentro de handPoint; para las otras manos usamos el rectángulo base
      R.fore.setAttribute('visibility',h==='point'?'hidden':'visible');
    }
    api.set=function(name,opts2){
      if(!POSES[name])name='idle';
      S.state=name;if(!opts2||opts2.base!==false)S.base=name;
      if(S.hand!==POSES[name].hand){S.hand=POSES[name].hand;S.handPop=1;applyHand(S.hand);}
      if(name!=='point'){S.aim=null;S.lookTarget=null;S.flipT=1;}
      if(S.still){settle();}
      wake();return api;
    };
    // Estado temporal que vuelve al de base (ej. saludar al pasar el mouse)
    api.play=function(name,ms){
      clearTimeout(S.timer);api.set(name,{base:false});
      S.timer=setTimeout(()=>api.set(S.base),ms||1600);return api;
    };
    api.talk=function(ms){S.talkUntil=S.t+(ms||1400)/1000;wake();return api;};
    api.hop=function(h){if(S.still)return api;S.hopT=0;S.hopH=h||70;wake();return api;};
    api.look=function(nx,ny){S.lookTarget=nx==null?null:{x:clamp(nx,-1,1),y:clamp(ny,-1,1)};wake();return api;};
    // Apunta el brazo hacia un punto de la pantalla (coordenadas de cliente)
    api.pointAt=function(cx,cy){
      const r=svg.getBoundingClientRect();if(!r.width)return api;
      const k=r.width/VB.w,px=r.left+(SH_R.x-VB.x)*k,py=r.top+(SH_R.y-VB.y)*k;
      const ccx=r.left+(CENTER.x-VB.x)*k;
      const dx=cx-ccx;
      S.flipT=dx<0?-1:1;
      const fx=(cx-(S.flipT<0?r.left+(2*CENTER.x-SH_R.x-VB.x)*k:px))*S.flipT, fy=cy-py;
      S.aim=clamp(Math.atan2(fy,Math.max(10,Math.abs(fx)))*180/Math.PI,-78,72);
      S.lookTarget={x:clamp(dx/260,-1,1),y:clamp((cy-(r.top+r.height*.4))/260,-1,1)};
      if(S.state!=='point')api.set('point');
      if(S.still)settle();
      wake();return api;
    };
    api.clearAim=function(){S.aim=null;S.lookTarget=null;S.flipT=1;return api;};
    api.mount=function(h){if(h&&svg.parentNode!==h){h.replaceChildren(svg);}wake();return api;};
    api.destroy=function(){live.delete(api);clearTimeout(S.timer);svg.remove();};
    api.state=()=>S.state;

    function settle(){for(let i=0;i<40;i++)api.step(.05);}
    api.step=function(dt){
      S.t+=dt;const t=S.t,P=POSES[S.state],c=S.cur;
      const still=S.still;
      // suavizado hacia la pose objetivo
      const tgtAr=S.aim!=null&&S.state==='point'?S.aim:P.ar;
      c.ar=damp(c.ar,tgtAr,still?60:9,dt);c.al=damp(c.al,P.al,still?60:8,dt);c.tilt=damp(c.tilt,P.tilt,6,dt);
      c.legs=damp(c.legs,P.legs,4,dt);
      const lt=S.lookTarget||{x:P.lx,y:P.ly};
      S.lx=damp(S.lx,lt.x,7,dt);S.ly=damp(S.ly,lt.y,7,dt);
      S.flip=damp(S.flip,S.flipT,still?60:14,dt);
      S.handPop=Math.max(0,S.handPop-dt*4);
      // capa procedural
      const osc=still?0:1;
      let ar=c.ar,al=c.al;
      if(S.state==='wave')ar+=osc*16*Math.sin(t*9);
      else if(S.state==='cheer'){ar+=osc*9*Math.sin(t*11);al+=osc*9*Math.sin(t*11+1.3);}
      else if(S.state==='point')ar+=osc*2.4*Math.sin(t*4);
      else{ar+=osc*2.5*Math.sin(t*1.7);al+=osc*3.5*Math.sin(t*1.7+1);}
      const breath=still?0:Math.sin(t*2.1)*.012;
      const sway=(still?0:Math.sin(t*1.3)*1.1)+c.tilt;
      // salto con anticipación y aplastamiento
      let hy=0,sx=1,sy=1,sh=1;
      if(S.hopT>=0){
        S.hopT+=dt;const T=S.hopT,A=.14,U=.52,L=.16;
        if(T<A){const p=T/A;sy=1-.09*p;sx=1+.06*p;}
        else if(T<A+U){const p=(T-A)/U;hy=-S.hopH*4*p*(1-p);sy=1+.035*Math.sin(p*Math.PI);sx=1-.02*Math.sin(p*Math.PI);sh=1-.3*Math.sin(p*Math.PI);}
        else if(T<A+U+L){const p=(T-A-U)/L;sy=1-.07*Math.sin(p*Math.PI);sx=1+.05*Math.sin(p*Math.PI);}
        else S.hopT=-1;
      }
      if(S.state==='cheer'&&!still&&S.hopT<0&&Math.sin(t*3.2)>.985)S.hopT=0,S.hopH=34;
      sy*=1+breath;sx*=1-breath*.6;
      // parpadeo
      if(!still){
        if(S.blink<0&&t>=S.blinkAt){S.blink=0;}
        if(S.blink>=0){S.blink+=dt;if(S.blink>.16){S.blink=-1;S.blinkAt=t+1.8+Math.random()*3.2;}}
      }
      const bk=S.blink<0?0:Math.sin(clamp(S.blink/.16,0,1)*Math.PI);
      // boca al hablar
      const talking=S.t<S.talkUntil&&!still;
      const mo=talking?(.35+.65*Math.abs(Math.sin(t*17)*Math.cos(t*6.3))):0;
      S.mouth=damp(S.mouth,mo,30,dt);
      // ---- aplicar ----
      R.flip.setAttribute('transform',scl(S.flip,1,CENTER)+(S.flipT<0&&Math.abs(S.flip)<.02?'':''));
      R.hop.setAttribute('transform','translate(0 '+hy.toFixed(1)+')');
      R.shadow.setAttribute('transform',scl(sh,sh,{x:1750,y:1392}));
      R.shadow.setAttribute('opacity',(.16*(hy<0?(1+hy/260):1)).toFixed(3));
      R.body.setAttribute('transform',scl(sx,sy,TIP)+' '+rot(sway,TIP));
      const stepA=still?0:Math.sin(t*2.1)*1.3*c.legs;
      R.legR.setAttribute('transform',rot(stepA+(hy<0?-5:0),HIP_R));
      R.legL.setAttribute('transform',rot(-stepA+(hy<0?5:0),HIP_L));
      R.armR.setAttribute('transform','translate('+SH_R.x+' '+SH_R.y+') rotate('+ar.toFixed(2)+')'+(S.handPop>0?' scale('+(1+.06*Math.sin(S.handPop*Math.PI)).toFixed(3)+')':''));
      R.armL.setAttribute('transform','translate('+SH_L.x+' '+SH_L.y+') rotate('+al.toFixed(2)+')');
      R.ring.setAttribute('transform','translate('+(S.lx*16).toFixed(1)+' '+(S.ly*12).toFixed(1)+')');
      const ey=1-.92*bk,ex=S.lx*8,eyy=S.ly*6;
      R.eyeL.setAttribute('transform','translate('+ex.toFixed(1)+' '+eyy.toFixed(1)+') '+scl(1,ey,{x:1803,y:838}));
      R.eyeR.setAttribute('transform','translate('+ex.toFixed(1)+' '+eyy.toFixed(1)+') '+scl(1,ey,{x:1903,y:838}));
      const open=S.mouth>.06;
      R.smile.setAttribute('opacity',open?'0':'1');
      R.mouthG.setAttribute('opacity',open?'1':'0');
      if(open){R.mouth.setAttribute('ry',(3+S.mouth*20).toFixed(1));R.tongue.setAttribute('ry',(1+S.mouth*9).toFixed(1));R.tongue.setAttribute('cy',(905+S.mouth*9).toFixed(1));}
      R.face.setAttribute('transform','translate('+(S.lx*6).toFixed(1)+' '+(S.ly*5).toFixed(1)+')');
    };
    applyHand('relax');
    api.set(opts.state||'idle');
    if(host)api.mount(host);
    api.step(.001);
    if(!S.still){live.add(api);wake();}
    api.setStill=function(v){S.still=!!v||reduce();if(S.still){live.delete(api);settle();}else{live.add(api);wake();}};
    return api;
  }
  root.TaxflyMascot={create,POSES:Object.keys(POSES),_COL:COL};
  if(typeof module!=='undefined')module.exports=root.TaxflyMascot;
})(typeof window!=='undefined'?window:globalThis);
