// Reproducible, labelled wiring guides for the current Multisim block interfaces.
// These are drawings for manual assembly; they are not Multisim simulations.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'deliverables', 'integration_guide');
fs.mkdirSync(out, { recursive: true });

const C = {
  red: '#d5252a', q: '#c12b32', clk: '#14a24a', reset: '#2666c8',
  start: '#e98a00', stop: '#7d38ad', black: '#141414', gray: '#667078',
  grid: '#b6bfc5', pale: '#f4f7f8', white: '#ffffff'
};
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const line = (x1,y1,x2,y2,color=C.black,width=3,dash='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const pathEl = (d,color=C.black,width=3,dash='') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const rect = (x,y,w,h,fill=C.white,stroke=C.black,sw=3,rx=0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const circle = (x,y,r,fill=C.white,stroke=C.black,sw=2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const txt = (x,y,s,size=24,color=C.black,weight=400,anchor='start') => `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`;
const dot = (x,y,color,r=6) => circle(x,y,r,color,color,1);
const tag = (x,y,label,color,side='right',font=18) => {
  const w = Math.max(46,label.length*font*0.62+20), h=font+16;
  const bx = side==='left'?x-w:x;
  return rect(bx,y-h/2,w,h,C.white,color,2,4)+txt(bx+w/2,y+font*0.34,label,font,color,700,'middle');
};
const pin = (x,y,label,side='left',color=C.black,font=20) => {
  const x2=side==='left'?x-34:x+34;
  return line(x,y,x2,y,color,2)+txt(side==='left'?x+12:x-12,y+7,label,font,C.black,400,side==='left'?'start':'end');
};
const block = (x,y,w,h,id,name,sub='') =>
  rect(x,y,w,h,C.white,C.black,3)+txt(x+w/2,y-14,id,22,C.black,700,'middle')+
  txt(x+w/2,y+h+35,name,25,C.black,700,'middle')+
  (sub?txt(x+w/2,y+h+63,sub,17,C.gray,400,'middle'):'');
const header = (w,h,title,subtitle) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M9 10h2M10 9v2" stroke="${C.grid}" stroke-width="0.9"/></pattern></defs>
<rect width="${w}" height="${h}" fill="white"/><rect width="${w}" height="${h}" fill="url(#grid)"/>
${txt(70,80,title,36,C.black,700)}${txt(70,120,subtitle,21,C.gray)}
`;

function overview(){
  const w=2100,h=1420; let s=header(w,h,'Общая схема: подключение новых блоков','Компоновка по вашему проекту. Одинаковые имена у выводов означают одну цепь; линии шины не замкнуты между собой.');
  // Existing blocks and instruments.
  s+=block(150,390,255,320,'HB1','Logic_D');
  s+=block(790,390,290,365,'HB2','D_Counter');
  s+=block(1455,390,250,460,'HB3','DC');
  s+=rect(1735,60,200,160,'#171717',C.black,3)+txt(1835,164,'D',103,'#00bbed',700,'middle')+
     txt(1835,49,'U26  DCD_HEX_BLUE',21,C.black,700,'middle');
  s+=block(1775,400,235,450,'XLA1','Logic Analyzer');
  s+=block(800,1000,300,245,'HB4','CLK_GEN');
  s+=block(150,1050,260,135,'HB5','P_RES_GEN');
  // Labels within logic and counter.
  s+=txt(174,440,'Q3, NOT_Q3',19)+txt(174,474,'Q2, NOT_Q2',19)+txt(174,508,'Q1, NOT_Q1',19)+txt(174,542,'Q0, NOT_Q0',19);
  s+=txt(315,590,'D3 D2 D1 D0',18,C.red,700);
  s+=txt(810,445,'D0',20)+txt(810,480,'D1',20)+txt(810,515,'D2',20)+txt(810,550,'D3',20);
  s+=txt(810,612,'CLK',20,C.clk,700)+txt(810,682,'P_RES',20,C.reset,700);
  s+=txt(1060,455,'Q0, NOT_Q0',17,C.q,700,'end')+txt(1060,489,'Q1, NOT_Q1',17,C.q,700,'end')+
     txt(1060,523,'Q2, NOT_Q2',17,C.q,700,'end')+txt(1060,557,'Q3, NOT_Q3',17,C.q,700,'end');
  s+=txt(1475,447,'NOT_Q0, Q0',18)+txt(1475,480,'NOT_Q1, Q1',18)+txt(1475,513,'NOT_Q2, Q2',18)+txt(1475,546,'NOT_Q3, Q3',18);
  s+=txt(1678,465,'Y0',19,C.stop,700,'end')+txt(1678,500,'Y2',19,C.stop,700,'end')+
     txt(1678,535,'Y3…Y14',19,C.stop,700,'end');
  s+=txt(825,1050,'Q3, NOT_Q2, Q1, NOT_Q0',17,C.q,700)+txt(825,1090,'P_RES',18,C.reset,700)+
     txt(825,1130,'START_N',18,C.start,700)+txt(1078,1060,'CLK',21,C.clk,700,'end');
  s+=line(790,965,800,965,C.q,4)+tag(770,965,'4 входа из Bus2',C.q,'left',16);
  s+=txt(386,1115,'P_RES',20,C.reset,700,'end')+txt(1774,425,'1–14: Y',18,C.stop,700,'end')+
     txt(1774,610,'C: CLK*',18,C.clk,700,'end');
  // Four D nets bundled as Bus1, preserving the different visible pin order on HB1/HB2.
  for(let i=0;i<4;i++){let yy=605+i*25; s+=pathEl(`M405 ${yy} H500`,C.red,3)+pathEl(`M695 ${yy} H790`,C.red,3);}
  s+=pathEl('M500 605 V680 M695 605 V680 M500 642 H695',C.red,8);
  s+=tag(553,633,'Bus1: D0…D3',C.red,'right',20);
  // State/feedback bus: visual equivalent of Bus2, with labelled taps.
  s+=pathEl('M1080 600 H1245 V285 H125 V405',C.q,9);
  s+=pathEl('M1245 285 H1450 V455',C.q,9);
  s+=pathEl('M1245 285 H1840 V320',C.q,9);
  s+=pathEl('M125 405 H150',C.q,4)+pathEl('M1450 455 H1455',C.q,4);
  s+=tag(470,280,'Bus2: Q3…Q0 и NOT_Q3…NOT_Q0',C.q,'right',20);
  // HEX is four Q bits only, not all eight feedback signals.
  s+=pathEl('M1840 320 V335',C.q,4);
  s+=tag(1625,340,'к HEX: только Q3 Q2 Q1 Q0',C.q,'right',17);
  // Y bundle from decoder to analyzer.
  s+=pathEl('M1705 675 H1755 V680 H1775',C.stop,8);
  s+=txt(1500,716,'14 отдельных Y → XLA',18,C.stop,700);
  // Clock net: HB4 -> counter and analyzer C in external Y test.
  s+=pathEl('M1100 1095 H1190 V905 H730 V612 H790',C.clk,5);
  s+=pathEl('M1190 905 H1750 V620 H1775',C.clk,5);
  s+=tag(1200,938,'CLK',C.clk,'right',20);
  // Reset: HB5 -> counter and CLK_GEN.
  s+=pathEl('M410 1115 H625 V682 H790',C.reset,5);
  s+=pathEl('M625 1115 V1090 H800',C.reset,5);
  s+=tag(520,1035,'P_RES',C.reset,'right',18);
  // Start source, independent from the reset switch inside HB5.
  s+=rect(465,1260,95,54,C.white,C.start,3,5)+txt(512,1295,'1 / 0',22,C.start,700,'middle');
  s+=pathEl('M560 1287 H700 V1130 H800',C.start,5);
  s+=tag(575,1240,'START_N: 1 → 0 → 1',C.start,'right',19);
  // Ground/power and notes.
  s+=rect(1360,1020,620,205,C.pale,'#a8b0b3',2,8);
  s+=txt(1390,1063,'Питание и наблюдение',24,C.black,700)+txt(1390,1105,'VCC = +5 В; GND — общая земля',21)+
     txt(1390,1141,'Пробники D3…D0 остаются на Bus1.',21)+
     txt(1390,1177,'Для полной диаграммы XLA: внутренний такт, C открыт.',19,C.gray);
  s+=txt(70,1385,'* В режиме проверки Y: XLA C ← CLK. В режиме остановки: C свободен, внутренняя выборка 100 Гц.',20,C.gray);
  return s+'</svg>';
}

function clockDetail(){
  const w=1900,h=1230;let s=header(w,h,'Новая цепь запуска и остановки','Это актуальная архитектура с вашего снимка CLK_GEN: U44A находится внутри HB4.');
  s+=block(90,300,270,195,'HB5','P_RES_GEN','S1 находится внутри блока');
  s+=block(120,755,205,110,'S_START','START_N','Interactive Digital Constant');
  s+=block(620,245,470,750,'HB4','CLK_GEN');
  s+=block(1350,275,320,380,'HB2','D_Counter');
  s+=rect(700,315,310,80,C.pale,C.black,2)+txt(855,351,'STOP_UNIT / AND4',22,C.black,700,'middle')+
     txt(855,380,'Q3 · NOT_Q2 · Q1 · NOT_Q0',18,C.q,700,'middle');
  s+=rect(700,465,310,120,C.pale,C.black,2)+txt(855,507,'U44A  74AS74N',23,C.black,700,'middle')+
     txt(855,539,'D ← STOP_SIG; CLK ← CLK',18,C.stop,700,'middle')+txt(855,566,'/PRE ← P_RES; /CLR ← START_N',18,C.black,400,'middle');
  s+=rect(700,655,310,92,C.pale,C.black,2)+txt(855,692,'LM555 / RST',21,C.black,700,'middle')+
     txt(855,721,'разрешение ← U44A /Q',18,C.clk,700,'middle');
  s+=rect(700,820,310,90,C.pale,C.black,2)+txt(855,858,'74LS04',23,C.black,700,'middle')+
     txt(855,888,'CLK = NOT(555 OUT)',18,C.clk,700,'middle');
  // Internal flow.
  s+=pathEl('M855 395 V465',C.stop,4)+pathEl('M855 585 V655',C.clk,4)+pathEl('M855 747 V820',C.clk,4);
  s+=tag(875,422,'STOP_SIG',C.stop,'right',16)+tag(875,615,'/Q = RUN_EN',C.clk,'right',16);
  // Inputs from state feedback.
  s+=pathEl('M1670 375 H1780 V180 H520 V355 H700',C.q,5);
  s+=tag(1140,185,'Q3, NOT_Q2, Q1, NOT_Q0',C.q,'right',18);
  // P_RES to both memory and controller.
  s+=pathEl('M360 395 H510 V555 H620',C.reset,5)+pathEl('M510 555 V215 H1270 V600 H1350',C.reset,5);
  s+=tag(435,579,'P_RES',C.reset,'right',19);
  // Start_N and clock out.
  s+=pathEl('M325 810 H530 V805 H620',C.start,5)+tag(360,783,'START_N',C.start,'right',19);
  s+=pathEl('M1010 865 H1170 V500 H1350',C.clk,5);
  s+=pathEl('M1170 540 H1010',C.clk,4)+dot(1170,540,C.clk,5);
  s+=tag(1098,839,'CLK',C.clk,'right',19)+tag(1410,737,'тот же CLK → XLA и U44A:CLK',C.clk,'right',17);
  s+=txt(1380,335,'D0…D3 от Logic_D',20,C.red,700)+txt(1380,405,'CLK ← HB4',20,C.clk,700)+
     txt(1380,605,'P_RES ← HB5',20,C.reset,700);
  // Explicit start protocol.
  s+=rect(110,1030,1670,150,C.white,'#8c9aa0',2,8);
  s+=txt(145,1071,'Порядок проверки',25,C.black,700)+
     txt(145,1112,'1. START_N = 1. Включить моделирование, дождаться P_RES = 1. На HEX должно быть D.',21)+
     txt(145,1149,'2. Кратко перевести START_N: 1 → 0 → 1. Через 13 фронтов CLK на HEX должно остаться 6.',21);
  s+=txt(85,1210,'Старый источник 20 Hz и старый внешний Key=1 на CLK/P_RES отсоединить. S1 в HB5 — кнопка общего сброса.',20,C.gray);
  return s+'</svg>';
}

function decoder(){
  const w=1900,h=1420;let s=header(w,h,'Дешифратор DC и логический анализатор','Точные имена выводов с вашего HB3. Каждый Y — отдельный сигнал, а не один общий провод.');
  s+=block(150,235,315,460,'HB2','D_Counter');
  s+=block(780,235,370,690,'HB3','DC');
  s+=block(1410,235,360,690,'XLA1','Logic Analyzer');
  s+=block(145,900,320,110,'U26','DCD_HEX_BLUE');
  const rows=[
    ['NOT_Q0','NOT_Q0'],['Q0','Q0'],['NOT_Q1','NOT_Q1'],['Q1','Q1'],
    ['NOT_Q2','NOT_Q2'],['Q2','Q2'],['NOT_Q3','NOT_Q3'],['Q3','Q3']
  ];
  rows.forEach((r,i)=>{
    const yy=320+i*52;
    s+=line(465,yy,780,yy,C.q,3)+txt(170,yy+7,r[0],20,C.q,700)+txt(802,yy+7,r[1],20,C.q,700);
  });
  const ys=['Y0','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10','Y11','Y12','Y13','Y14'];
  ys.forEach((y,i)=>{
    let yy=285+i*42;
    s+=line(1150,yy,1410,yy,C.stop,2.8)+txt(1118,yy+7,y,18,C.stop,700,'end')+
       txt(1432,yy+7,`${i+1}  ${y}`,18,C.black);
    if(y==='Y6') s+=circle(1290,yy,13,C.white,C.stop,2)+txt(1290,yy+6,'P',16,C.stop,700,'middle');
  });
  s+=txt(1450,895,'15, 16 — свободны',18,C.gray);
  // Four Q bits also feed the existing HEX display via named on-page nets.
  s+=txt(160,947,'Q3  Q2  Q1  Q0',22,C.q,700);
  s+=txt(510,957,'четыре отдельные линии Q → HEX',18,C.q,700);
  s+=rect(160,1135,1580,195,C.pale,'#a8b0b3',2,8)+
     txt(195,1180,'Два режима одного XLA1',26,C.black,700)+
     txt(195,1222,'Проверка DC: 1–14 ← Y0,Y2,…,Y14; C ← CLK; режим External (C).',21)+
     txt(195,1260,'Итоговая остановка: 1–4 ← Q3…Q0; 5 ← START_N; 6 ← P_RES; 7 ← STOP_SIG*; 8 ← CLK.',21)+
     txt(195,1298,'Для удержания после остановки: Internal 100 Hz, вход C свободен. Y6 должен остаться активным.',20);
  s+=txt(160,1385,'* STOP_SIG находится внутри HB4: добавьте выход/контрольную точку либо оставьте канал 7 свободным.',19,C.gray);
  return s+'</svg>';
}

async function write(name, source){
  const svg=Buffer.from(source,'utf8');
  fs.writeFileSync(path.join(out,name+'.svg'),svg);
  await sharp(svg,{density:120}).png().toFile(path.join(out,name+'.png'));
}

(async()=>{
  await write('01_obshchaya_skhema',overview());
  await write('02_zapusk_i_ostanovka',clockDetail());
  await write('03_dc_i_analizator',decoder());
  console.log(out);
})().catch(err=>{console.error(err);process.exit(1)});
