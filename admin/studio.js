(function(){
'use strict';
var ROOT='/repos/P-JSL/P-JSL.github.io',PAGES=ROOT+'/contents/site-pages.json',LIMIT=25*1024*1024;
var token=null,pages=[],home=null,sha=null,current=-1,activeBlock=-1,dirty=false,working=false;
var $=function(id){return document.getElementById(id);};
function msg(t,bad){$('global-message').textContent=t;$('global-message').className='global-message '+(bad?'error':'ok');}
async function api(method,path,body){
if(!token)throw Error('인증이 필요합니다.');
var r=await fetch('https://api.github.com'+path,{method:method,cache:'no-store',credentials:'omit',headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
if(r.status===404)return {missing:true};
var d=await r.json().catch(function(){return {};});
if(!r.ok)throw Error('GitHub HTTP '+r.status+': '+(d.message||'요청 오류'));
return d;
}
function dec(s){var b=atob(s.replace(/\s/g,'')),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return new TextDecoder().decode(a);}
function enc(s){var a=new TextEncoder().encode(s),x=[];for(var i=0;i<a.length;i+=8190){var p='';for(var j=i;j<Math.min(a.length,i+8190);j++)p+=String.fromCharCode(a[j]);x.push(btoa(p));}return x.join('');}
function label(t,text){var l=document.createElement(t);l.textContent=text;return l;}
async function login(){
var t=$('token').value.trim();if(!t)return $('auth-message').textContent='토큰을 입력하세요.';
$('login').disabled=true;token=t;$('token').value='';
try{
var u=await api('GET','/user');if(!u.login||u.login.toLowerCase()!=='p-jsl')throw Error('P-JSL 계정만 허용됩니다.');
var r=await api('GET',ROOT);if(!r.permissions||!r.permissions.push)throw Error('저장소 쓰기 권한이 없습니다.');
await load();
$('auth-view').hidden=true;$('workspace').hidden=false;$('signout').hidden=false;$('auth-chip').textContent='P-JSL · 인증됨';
}catch(e){token=null;$('auth-message').textContent=e.message;}finally{$('login').disabled=false;}
}
async function load(){
var d=await api('GET',PAGES);if(d.missing)throw Error('site-pages.json을 찾을 수 없습니다.');
var doc=JSON.parse(dec(d.content));if(doc.schema!==1||!Array.isArray(doc.pages)||doc.pages.some(function(p){return !SitePages.validPage(p);}))throw Error('페이지 데이터 오류');
home=doc.home||null;if(!home)throw Error('기본 홈페이지 설정이 없습니다.');
pages=doc.pages.map(function(p){if(!Array.isArray(p.blocks)){p.blocks=p.content?[block('text','',p.content)]:[];}return p;});sha=d.sha;current=-1;activeBlock=-1;dirty=false;drawPages();renderEditor();msg('GitHub 메뉴 '+pages.length+'개 동기화 완료');
}
function change(){dirty=true;msg('저장되지 않은 변경 사항이 있습니다.');}
function page(){return current===-2?home:pages[current];}
function drawPages(){
var base=$('home-page-button');if(base){base.textContent=home?home.title:'Video App Download';base.classList.toggle('selected',current===-2);}
var list=$('page-list');list.replaceChildren();
pages.forEach(function(p,i){var b=label('button',p.title);b.className='page-entry'+(i===current?' selected':'');b.type='button';
var sub=label('small',p.slug+(p.visible?'':' · 비공개'));b.appendChild(sub);b.onclick=function(){select(i);};list.appendChild(b);});
}
function select(i){if(page())readFields();current=i;activeBlock=-1;drawPages();renderEditor();}
function readFields(){if(!page())return;page().title=$('page-title-input').value.trim();if(current!==-2){page().slug=$('page-slug').value.trim();page().visible=$('page-visible').checked;}page().summary=$('page-summary-input').value.trim();}
function renderEditor(){
var p=page();$('editor').hidden=!p;$('empty-state').hidden=!!p;if(!p){renderPreview();return;}
$('page-title-input').value=p.title;$('page-slug').value=p.slug;$('page-summary-input').value=p.summary;$('page-visible').checked=p.visible;$('page-slug').disabled=current===-2;$('page-visible').disabled=current===-2;$('delete-page').disabled=current===-2;$('move-page-up').disabled=current===-2;$('move-page-down').disabled=current===-2;
renderCanvas();drawInspector();renderPreview();
}
var TYPES=[['downloads','자동 다운로드'],['hero','히어로'],['heading','제목'],['text','텍스트'],['image','이미지'],['button','버튼'],['cards','카드'],['list','목록'],['notice','안내'],['divider','구분선'],['spacer','여백']];
var templates={
blank:[],
landing:[['hero','새로운 페이지','원하는 내용을 소개하세요.'],['cards','핵심 기능',''],['button','','']],
news:[['heading','공지사항',''],['notice','최신 소식','변경 사항을 안내하세요.'],['text','상세 내용','내용을 입력하세요.']],
products:[['hero','프로젝트 소개','프로젝트를 확인하세요.'],['cards','프로젝트',''],['button','','']]
};
function block(type,title,text){return {id:'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,8),type:type,title:title||'',text:text||'',url:'',label:'',alt:'',caption:'',align:'left',items:type==='cards'?[{title:'항목 1',text:'설명'},{title:'항목 2',text:'설명'}]:[]};}
function add(type,index){if(!page())return msg('먼저 페이지를 선택하세요.',true);if(page().blocks.length>=60)return msg('블록은 최대 60개입니다.',true);var b=block(type);page().blocks.splice(index===undefined?page().blocks.length:index,0,b);activeBlock=page().blocks.indexOf(b);change();renderCanvas();drawInspector();renderPreview();}
function renderCanvas(){
var host=$('canvas');host.replaceChildren();if(!page())return;
(page().blocks||[]).forEach(function(b,i){
var item=document.createElement('div');item.className='canvas-block'+(activeBlock===i?' selected':'');item.draggable=true;item.tabIndex=0;
var header=document.createElement('div');header.className='canvas-block-head';header.appendChild(label('span',(TYPES.find(function(x){return x[0]===b.type;})||[])[1]||b.type));header.appendChild(label('span','↕ 이동'));item.appendChild(header);
var body=document.createElement('div');body.className='canvas-block-body';SitePages.renderBlocks(body,[b]);item.appendChild(body);
item.onclick=function(){activeBlock=i;renderCanvas();drawInspector();};item.onkeydown=function(e){if(e.key==='Enter'){activeBlock=i;renderCanvas();drawInspector();}};
item.ondragstart=function(e){e.dataTransfer.setData('text/plain','move:'+i);e.dataTransfer.effectAllowed='move';};
item.ondragover=function(e){e.preventDefault();item.classList.add('drag-over');};item.ondragleave=function(){item.classList.remove('drag-over');};
item.ondrop=function(e){e.preventDefault();e.stopPropagation();item.classList.remove('drag-over');drop(e,i);};host.appendChild(item);
});
host.ondragover=function(e){e.preventDefault();host.classList.add('drag-over');};
host.ondragleave=function(e){if(!host.contains(e.relatedTarget))host.classList.remove('drag-over');};
host.ondrop=function(e){e.preventDefault();host.classList.remove('drag-over');drop(e,page().blocks.length);};
}
function drop(e,to){
if(!page())return;
var data=e.dataTransfer.getData('text/plain');
if(data.startsWith('add:'))return add(data.slice(4),to);
if(!data.startsWith('move:'))return;
var from=Number(data.slice(5));if(!Number.isInteger(from)||from<0||from>=page().blocks.length)return;
var a=page().blocks.splice(from,1)[0];if(from<to)to--;page().blocks.splice(to,0,a);activeBlock=to;change();renderCanvas();drawInspector();renderPreview();
}
function inputField(host,title,value,onchange,multi){var l=label('label',title),v=document.createElement(multi?'textarea':'input');v.value=value||'';v.oninput=function(){onchange(v.value);change();renderPreview();renderCanvas();};host.appendChild(l);host.appendChild(v);}
function drawInspector(){
var host=$('inspector-fields');host.replaceChildren();var b=page()&&page().blocks[activeBlock];$('inspector-empty').hidden=!!b;$('inspector-actions').hidden=!b;if(!b)return;
function field(title,key,multi){inputField(host,title,b[key],function(v){b[key]=v;},multi);}
if(!['divider','spacer','button','image'].includes(b.type))field('제목','title');
if(['hero','text','notice','downloads'].includes(b.type))field('설명·본문','text',true);
if(['image','button'].includes(b.type))field('링크 URL (https 또는 / 내부경로)','url');
if(b.type==='image'){field('대체 텍스트','alt');field('캡션','caption');}
if(b.type==='button')field('버튼 이름','label');
if(['cards','list'].includes(b.type)){
var l=label('label','항목 (한 줄당 제목 | 설명, 최대 12개)');var ta=document.createElement('textarea');ta.value=(b.items||[]).map(function(x){return x.title+' | '+x.text;}).join('\n');ta.oninput=function(){b.items=ta.value.split('\n').filter(Boolean).slice(0,12).map(function(line){var n=line.indexOf('|');return {title:(n<0?line:line.slice(0,n)).trim().slice(0,100),text:(n<0?'':line.slice(n+1)).trim().slice(0,750)};});change();renderPreview();renderCanvas();};host.appendChild(l);host.appendChild(ta);
}
if(!['divider','spacer','downloads'].includes(b.type)){var l=label('label','정렬');var sel=document.createElement('select');['left','center'].forEach(function(v){var o=label('option',v==='left'?'왼쪽':'가운데');o.value=v;sel.appendChild(o);});sel.value=b.align||'left';sel.onchange=function(){b.align=sel.value;change();renderPreview();renderCanvas();};host.appendChild(l);host.appendChild(sel);}
}
function shiftBlock(d){if(!page()||activeBlock<0)return;var j=activeBlock+d;if(j<0||j>=page().blocks.length)return;var b=page().blocks.splice(activeBlock,1)[0];page().blocks.splice(j,0,b);activeBlock=j;change();renderCanvas();drawInspector();renderPreview();}
function renderPreview(){var host=$('preview');host.replaceChildren();if(page()){var title=label('h1',page().title);host.appendChild(title);host.appendChild(label('p',page().summary));var body=document.createElement('div');SitePages.renderBlocks(body,page().blocks||[]);host.appendChild(body);}else host.appendChild(label('p','페이지를 선택하면 실시간 미리보기가 나타납니다.'));}
function createPage(template){if(pages.length>=100)return msg('메뉴는 최대 100개입니다.',true);if(page())readFields();var count=pages.length+1,slug='page-'+count;while(pages.some(function(p){return p.slug===slug;})){count++;slug='page-'+count;}var p={slug:slug,title:'새 메뉴 '+count,summary:'',content:'',linkLabel:'',linkUrl:'',visible:true,blocks:(templates[template]||[]).map(function(x){return block(x[0],x[1],x[2]);})};pages.push(p);current=pages.length-1;activeBlock=-1;change();drawPages();renderEditor();}
async function save(){
if(working)return;if(page())readFields();
if(!home||!SitePages.validPage(home)||home.slug!=='home'||!home.visible||!home.blocks.some(function(b){return b.type==='downloads';}))return msg('기본 홈페이지에는 다운로드 블록이 1개 이상 필요합니다.',true);
if(pages.some(function(p){return !SitePages.validPage(p);}))return msg('메뉴명, 주소 식별자, 블록 URL·내용을 확인하세요. 링크는 HTTPS 또는 /로 시작해야 합니다.',true);
var seen=new Set();for(var p of pages){if(seen.has(p.slug))return msg('메뉴 주소가 중복되었습니다.',true);seen.add(p.slug);}
if(!dirty)return msg('저장할 변경 사항이 없습니다.');
if(!confirm('메뉴 '+pages.length+'개의 변경 사항을 GitHub에 저장하고 배포하시겠습니까?'))return;
working=true;$('save').disabled=true;
try{var output=await api('PUT',PAGES,{message:'Update site pages via visual drag-and-drop studio',branch:'main',sha:sha,content:enc(JSON.stringify({schema:1,home:home,pages:pages},null,2)+'\n')});sha=output.content.sha;dirty=false;msg('GitHub 저장 성공: '+output.commit.sha+' · Pages 자동 배포가 시작됩니다.');}
catch(e){msg('저장 실패: '+e.message+' · 다른 사용자의 변경이 있었다면 GitHub 새로고침 후 다시 편집하세요.',true);}
finally{working=false;$('save').disabled=false;}
}
function logout(){token=null;pages=[];home=null;sha=null;current=-1;dirty=false;$('workspace').hidden=true;$('auth-view').hidden=false;$('signout').hidden=true;$('token').value='';$('auth-chip').textContent='잠금 상태';}
function selectTab(name){document.querySelectorAll('[data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===name);});['designer','files','info'].forEach(function(n){$(n+'-tab').hidden=n!==name;});}
async function uploadZip(){
var f=$('zip-file').files[0];if(!f||f.size>LIMIT||f.size===0)return;
if(!/^[a-z0-9][a-z0-9._-]*\.zip$/i.test(f.name)||f.name.length>120||/^latest-(extension|desktop-windows)\.zip$/i.test(f.name))return $('upload-message').textContent='파일명을 확인하세요.';
if(!confirm(f.name+' 파일을 공개 downloads 폴더에 업로드하시겠습니까?'))return;
$('zip-upload').disabled=true;$('upload-message').textContent='파일을 읽고 인코딩하는 중입니다.';
try{
var data=new Uint8Array(await f.arrayBuffer());if(data[0]!==80||data[1]!==75)throw Error('ZIP 파일이 아닙니다.');
var parts=[];for(var i=0;i<data.length;i+=24000){var str='';for(var j=i;j<Math.min(i+24000,data.length);j++)str+=String.fromCharCode(data[j]);parts.push(btoa(str));}
var path=ROOT+'/contents/downloads/'+encodeURIComponent(f.name),old=await api('GET',path);
var request={message:'Upload ZIP through site studio: '+f.name,branch:'main',content:parts.join('')};if(!old.missing)request.sha=old.sha;
var out=await api('PUT',path,request);$('upload-message').textContent='업로드 완료: '+out.commit.sha+' · 자동 배포가 시작됩니다.';$('zip-file').value='';
}catch(e){$('upload-message').textContent='실패: '+e.message;}finally{$('zip-upload').disabled=false;}
}
$('login').onclick=login;$('signout').onclick=logout;$('refresh').onclick=async function(){if(dirty&&!confirm('저장하지 않은 변경을 버리고 GitHub에서 새로고침하시겠습니까?'))return;try{await load();}catch(e){msg(e.message,true);}};
$('save').onclick=save;$('add-page').onclick=function(){createPage('blank');};$('home-page-button').onclick=function(){select(-2);};
$('page-title-input').oninput=$('page-slug').oninput=$('page-summary-input').oninput=$('page-visible').onchange=function(){if(!page())return;readFields();change();drawPages();renderPreview();};
$('delete-page').onclick=function(){if(current<0)return;if(!confirm('선택한 메뉴를 삭제하시겠습니까? 저장을 눌러 확정됩니다.'))return;pages.splice(current,1);current=-1;change();drawPages();renderEditor();};
function movePage(delta){if(current<0)return;var j=current+delta;if(j<0||j>=pages.length)return;readFields();var p=pages.splice(current,1)[0];pages.splice(j,0,p);current=j;change();drawPages();}
$('move-page-up').onclick=function(){movePage(-1);};$('move-page-down').onclick=function(){movePage(1);};
$('block-up').onclick=function(){shiftBlock(-1);};$('block-down').onclick=function(){shiftBlock(1);};
$('block-delete').onclick=function(){if(!page()||activeBlock<0)return;if(current===-2&&page().blocks[activeBlock].type==='downloads'&&page().blocks.filter(function(b){return b.type==='downloads';}).length===1)return msg('최신 버전 다운로드를 유지하기 위해 마지막 다운로드 블록은 삭제할 수 없습니다.',true);page().blocks.splice(activeBlock,1);activeBlock=-1;change();renderCanvas();drawInspector();renderPreview();};
TYPES.forEach(function(t){var b=label('button',t[1]);b.draggable=true;b.onclick=function(){add(t[0]);};b.ondragstart=function(e){e.dataTransfer.setData('text/plain','add:'+t[0]);};$('palette').appendChild(b);});
$('templates').querySelectorAll('[data-template]').forEach(function(b){b.onclick=function(){if(current>=0){if(!confirm('새 메뉴를 이 템플릿으로 생성하시겠습니까?'))return;}createPage(b.dataset.template);};});
document.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){selectTab(b.dataset.tab);};});
$('preview-toggle').onclick=function(){var hidden=$('preview').hidden;$('preview').hidden=!hidden;this.textContent=hidden?'미리보기 접기':'미리보기 펼치기';};
$('zip-file').onchange=function(){var f=this.files[0];$('zip-size').textContent=f?f.name+' · '+(f.size/1048576).toFixed(1)+' MiB'+(f.size>LIMIT?' · 25MiB 제한 초과':''):'';$('zip-upload').disabled=!f||f.size>LIMIT;};
$('zip-upload').onclick=uploadZip;
window.addEventListener('pagehide',function(){token=null;});
window.addEventListener('beforeunload',function(e){if(dirty){e.preventDefault();e.returnValue='';}});
}());