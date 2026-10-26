(function () {
  'use strict';

  // Credentials are held only in memory and sent exclusively to api.github.com.
  var REPO = 'P-JSL/P-JSL.github.io';
  var MAX_BYTES = 25 * 1024 * 1024;
  var token = null;
  var busy = false;
  var authPanel = document.getElementById('auth-panel');
  var uploadPanel = document.getElementById('upload-panel');
  var tokenInput = document.getElementById('token');
  var fileInput = document.getElementById('file');
  var loginButton = document.getElementById('login');
  var uploadButton = document.getElementById('upload');
  var logoutButton = document.getElementById('logout');
  var authStatus = document.getElementById('auth-status');
  var uploadStatus = document.getElementById('upload-status');
  var progressWrap = document.getElementById('progress-wrap');
  var progressBar = document.getElementById('progress');
  var progressText = document.getElementById('progress-text');

  function setBusy(value) {
    busy = value;
    loginButton.disabled = value;
    uploadButton.disabled = value;
    logoutButton.disabled = value;
    fileInput.disabled = value;
  }

  function setStatus(el, message, success) {
    el.className = 'status ' + (success === true ? 'success' : success === false ? 'danger' : '');
    el.textContent = message;
  }

  async function github(method, path, body) {
    if (!token) throw new Error('먼저 관리자로 인증하세요.');
    var headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + token
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    var response;
    try {
      response = await fetch('https://api.github.com' + path, {
        method: method, headers: headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store', credentials: 'omit', redirect: 'error'
      });
    } catch (_) {
      throw new Error('GitHub API 연결 실패입니다. 네트워크 및 CORS 설정을 확인하세요.');
    }
    if (response.status === 404) return { missing: true };
    var data;
    try { data = await response.json(); } catch (_) { data = {}; }
    if (!response.ok) {
      throw new Error('GitHub API HTTP ' + response.status + ': ' +
        (typeof data.message === 'string' ? data.message : '요청을 처리하지 못했습니다.'));
    }
    return data;
  }

  async function authenticate() {
    if (busy) return;
    var raw = tokenInput.value.trim();
    if (!raw) { setStatus(authStatus, 'GitHub 토큰을 입력하세요.', false); return; }
    token = raw;
    tokenInput.value = '';
    setBusy(true);
    setStatus(authStatus, 'GitHub 계정 및 저장소 권한을 확인 중입니다.');
    try {
      var user = await github('GET', '/user');
      if (!user || !user.login || user.login.toLowerCase() !== 'p-jsl') {
        throw new Error('P-JSL 계정만 관리자 업로드를 수행할 수 있습니다.');
      }
      var repo = await github('GET', '/repos/' + REPO);
      if (!repo || !repo.permissions || repo.permissions.push !== true) {
        throw new Error('P-JSL.github.io 저장소 Contents 쓰기 권한이 없습니다.');
      }
      authPanel.hidden = true;
      uploadPanel.hidden = false;
      document.getElementById('identity').textContent = 'GitHub 관리자 인증: ' + user.login;
      setStatus(uploadStatus, '업로드할 ZIP 파일을 선택하세요.');
    } catch (error) {
      token = null;
      setStatus(authStatus, error.message, false);
    } finally { setBusy(false); }
  }

  function validateFilename(name) {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.zip$/i.test(name) ||
        name.length > 120) {
      throw new Error('ZIP 파일명은 영문·숫자·점·하이픈·언더바를 사용하고 .zip으로 끝나야 합니다.');
    }
    if (['latest-extension.zip', 'latest-desktop-windows.zip'].includes(name.toLowerCase())) {
      throw new Error('latest-*.zip은 자동 생성용 이름입니다. 다른 파일명을 사용하세요.');
    }
  }

  async function toBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var CHUNK = 24 * 1024; // Multiple of 3: independently encoded chunks concatenate safely.
    var parts = [];
    for (var i = 0; i < bytes.length; i += CHUNK) {
      var block = bytes.subarray(i, Math.min(bytes.length, i + CHUNK));
      var raw = '';
      for (var j = 0; j < block.length; ++j) raw += String.fromCharCode(block[j]);
      parts.push(btoa(raw));
      if (i % (CHUNK * 64) === 0) {
        progressBar.value = 10 + Math.round(60 * i / bytes.length);
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
      }
    }
    return parts.join('');
  }

  async function upload() {
    if (busy) return;
    if (!token) { setStatus(uploadStatus, '인증 세션이 없습니다.', false); return; }
    var file = fileInput.files && fileInput.files[0];
    if (!file) { setStatus(uploadStatus, '업로드할 ZIP 파일을 선택하세요.', false); return; }
    try {
      validateFilename(file.name);
      if (file.size === 0) throw new Error('빈 파일은 업로드할 수 없습니다.');
      if (file.size > MAX_BYTES) {
        throw new Error('이 업로드 화면의 제한은 25MiB입니다. 250MB 등 대용량은 GitHub Releases 또는 업로드 백엔드를 사용해야 합니다.');
      }
      if (!confirm(file.name + ' (' + file.size.toLocaleString() +
        ' bytes)을 공개 저장소의 downloads/에 업로드하시겠습니까?')) return;
      setBusy(true);
      progressWrap.hidden = false;
      progressBar.value = 3;
      progressText.textContent = 'ZIP 파일 검증 및 인코딩 중...';
      setStatus(uploadStatus, '파일 읽는 중...');
      var buffer = await file.arrayBuffer();
      var b = new Uint8Array(buffer);
      if (b.length < 4 || b[0] !== 0x50 || b[1] !== 0x4b ||
          b[2] !== 0x03 || b[3] !== 0x04) {
        throw new Error('ZIP 파일 시그니처가 유효하지 않습니다.');
      }
      var encoded = await toBase64(buffer);
      progressBar.value = 72;
      progressText.textContent = '기존 파일의 GitHub SHA 확인 중...';
      var path = '/repos/' + REPO + '/contents/downloads/' + encodeURIComponent(file.name);
      var oldFile = await github('GET', path);
      var body = {
        message: 'Upload ZIP from authenticated site administrator: ' + file.name,
        branch: 'main',
        content: encoded
      };
      if (!oldFile.missing) {
        if (!oldFile.sha || oldFile.type !== 'file') throw new Error('대상 경로가 일반 파일이 아닙니다.');
        body.sha = oldFile.sha;
      }
      progressBar.value = 78;
      progressText.textContent = 'GitHub로 업로드 중... (실제 네트워크 전송 진행률은 제공되지 않습니다)';
      var result = await github('PUT', path, body);
      if (!result || !result.commit || !result.content || !result.content.sha) {
        throw new Error('GitHub에서 정상적인 업로드 결과를 받지 못했습니다.');
      }
      progressBar.value = 100;
      progressText.textContent = 'GitHub 저장 완료. GitHub Actions 배포는 별도로 진행됩니다.';
      setStatus(uploadStatus,
        '업로드 성공: ' + file.name +
        '\n커밋: ' + result.commit.sha +
        '\n배포 상태: GitHub Actions에서 확인하세요.', true);
      fileInput.value = '';
    } catch (error) {
      setStatus(uploadStatus, error.message || '업로드에 실패했습니다.', false);
    } finally { setBusy(false); }
  }

  function logout() {
    token = null;
    tokenInput.value = '';
    fileInput.value = '';
    progressWrap.hidden = true;
    uploadPanel.hidden = true;
    authPanel.hidden = false;
    document.getElementById('identity').textContent = '';
    setStatus(authStatus, '인증 세션을 종료했습니다.');
    setStatus(uploadStatus, '');
  }

  loginButton.addEventListener('click', authenticate);
  uploadButton.addEventListener('click', upload);
  logoutButton.addEventListener('click', logout);
  window.addEventListener('pagehide', function () { token = null; });
})();
