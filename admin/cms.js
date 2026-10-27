(function(){
'use strict';
var REPO='/repos/P-JSL/P-JSL.github.io/contents/site-pages.json';
var pages=[],sha=null,selected=-1,originalSlug=null,working=false;
var $=function(id){return document.getElementById(id);};
function status(message,error){$('cms-status').textContent=message;$('cms-status').className='status'+(error?' danger':'');}
function workingState(on){working=on;$('cms-save').disabled=on;$('cms-delete').disabled=on;$('cms-new').disabled=on;}
function api(){if(!window.AdminSiteApi)throw new Error('먼저 관리자 인증을 완료하세요.');return window.AdminSiteApi.request;}
function decodeUtf8(base64){
var binary=atob(base64.replace(/\s/g,'')),arr=new Uint8Array(binary.length);
for(var i=0;i<binary.length;i++)arr[i]=binary.charCodeAt(i);
return new TextDecoder().decode(arr);
}
function encodeUtf8(value){
var bytes=new TextEncoder().encode(value),binary='';
for(var i=0;i<bytes.length;i+=8192){
 var slice=bytes.subarray(i,i+8192);for(var j=0;j<slice.length;j++)binary+=String.fromCharCode(slice[j]);
}
return btoa(binary);
}
function draw(){
var list=$('cms-pages');list.replaceChildren();
pages.forEach(function(p,i){
 var option=document.createElement('option');option.value=String(i);
 option.textContent=(p.visible?'':'[비공개] ')+p.title+' ('+p.slug+')';list.appendChild(option);
});
if(selected>=pages.length)selected=pages.length-1;
if(selected>=0){list.selectedIndex=selected;edit(selected);}
else{list.selectedIndex=-1;clear();}
}
function clear(){
originalSlug=null;
['cms-title-input','cms-slug','cms-summary','cms-content','cms-link-label','cms-link-url'].forEach(function(id){$(id).value='';});
$('cms-visible').checked=true;
}
function edit(i){
if(i<0||i>=pages.length)return;selected=i;var p=pages[i];originalSlug=p.slug;
$('cms-title-input').value=p.title;$('cms-slug').value=p.slug;
$('cms-summary').value=p.summary;$('cms-content').value=p.content;
$('cms-link-label').value=p.linkLabel;$('cms-link-url').value=p.linkUrl;$('cms-visible').checked=p.visible;
}
function formPage(){
return {
slug:$('cms-slug').value.trim(),title:$('cms-title-input').value.trim(),
summary:$('cms-summary').value.trim(),content:$('cms-content').value,
linkLabel:$('cms-link-label').value.trim(),linkUrl:$('cms-link-url').value.trim(),
visible:$('cms-visible').checked
};
}
function validatePage(item){
if(!window.SitePages.validPage(item))throw new Error('제목·주소·링크 형식을 확인하세요. 슬러그는 영문 소문자로 시작하고 2~50자입니다.');
if(item.slug==='admin'||item.slug==='pages'||item.slug==='downloads'||item.slug==='video-app-download')throw new Error('예약된 메뉴 주소입니다.');
}
function applyForm(){
var p=formPage();validatePage(p);
if(pages.some(function(other,i){return other.slug===p.slug&&i!==selected;}))throw new Error('이미 사용 중인 페이지 주소입니다.');
if(selected===-1){if(pages.length>=100)throw new Error('최대 100개 메뉴를 지원합니다.');pages.push(p);selected=pages.length-1;}
else pages[selected]=p;
return p;
}
async function load(){
try{
 workingState(true);status('GitHub에서 메뉴 설정을 조회 중입니다.');
 var data=await api()('GET',REPO);
 if(data.missing){throw new Error('site-pages.json 파일이 존재하지 않습니다.');}
 var doc=JSON.parse(decodeUtf8(data.content));
 if(doc.schema!==1||!Array.isArray(doc.pages)||doc.pages.length>100||doc.pages.some(function(p){return !window.SitePages.validPage(p);}))
 throw new Error('저장소의 메뉴 데이터가 유효하지 않습니다.');
 pages=doc.pages;sha=data.sha;selected=-1;draw();$('cms-panel').hidden=false;
 status('메뉴 '+pages.length+'개 조회 완료. 기본 Video App Download 메뉴는 유지됩니다.');
}catch(e){status(e.message,true);}finally{workingState(false);}
}
async function save(){
if(working)return;
try{
 applyForm();
 var input=JSON.stringify({schema:1,pages:pages},null,2)+'\n';
 if(!confirm('메뉴 '+pages.length+'개의 설정을 GitHub main 브랜치에 저장하고 Pages 배포를 시작하시겠습니까?'))return;
 workingState(true);status('GitHub에 변경 사항을 커밋하는 중입니다.');
 var output=await api()('PUT',REPO,{message:'Update site menu and managed pages via administrator',branch:'main',sha:sha,content:encodeUtf8(input)});
 if(!output.content||!output.content.sha)throw new Error('커밋 응답이 올바르지 않습니다.');
 sha=output.content.sha;draw();status('저장 완료. GitHub Actions 배포가 끝나면 공개됩니다. 커밋: '+output.commit.sha);
}catch(e){
 status(e.message+' (다른 변경 사항이 있었다면 새로 로그인한 후 다시 확인하세요.)',true);
}finally{workingState(false);}
}
function remove(){
if(selected<0||working)return;
var p=pages[selected];if(!confirm('"'+p.title+'" 메뉴를 삭제하시겠습니까? 저장을 눌러야 실제 반영됩니다.'))return;
pages.splice(selected,1);selected=-1;draw();status('삭제 예정입니다. [GitHub에 저장 및 배포] 버튼을 눌러 확정하세요.');
}
function move(dir){
if(selected<0)return;var target=selected+dir;if(target<0||target>=pages.length)return;
var tmp=pages[target];pages[target]=pages[selected];pages[selected]=tmp;selected=target;draw();status('순서가 변경됐습니다. 저장하면 반영됩니다.');
}
function preview(){
try{var p=formPage();validatePage(p);
 var host=$('cms-preview-content');host.replaceChildren();
 var h=document.createElement('h2');h.textContent=p.title;host.appendChild(h);
 var summary=document.createElement('p');summary.textContent=p.summary;host.appendChild(summary);
 var body=document.createElement('div');window.SitePages.renderContent(body,p.content);host.appendChild(body);
 if(p.linkLabel){var a=document.createElement('a');a.textContent=p.linkLabel;a.href=p.linkUrl;a.rel='noopener noreferrer';a.target='_blank';host.appendChild(a);}
 $('cms-preview').hidden=false;status('미리보기는 GitHub에 저장하지 않습니다.');
}catch(e){status(e.message,true);}
}
$('cms-pages').addEventListener('change',function(){selected=Number(this.value);edit(selected);});
$('cms-new').addEventListener('click',function(){selected=-1;$('cms-pages').selectedIndex=-1;clear();status('새 메뉴를 작성한 후 저장하세요.');});
$('cms-save').addEventListener('click',save);
$('cms-delete').addEventListener('click',remove);
$('cms-up').addEventListener('click',function(){move(-1);});
$('cms-down').addEventListener('click',function(){move(1);});
$('cms-preview-button').addEventListener('click',preview);
document.addEventListener('admin-authenticated',load);
document.addEventListener('admin-logout',function(){pages=[];sha=null;selected=-1;$('cms-panel').hidden=true;$('cms-preview').hidden=true;});
}());
