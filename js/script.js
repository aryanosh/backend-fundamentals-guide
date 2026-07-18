(function(){
  'use strict';

  // === SETUP ===
  var toggle = document.getElementById('themeToggle');
  var icon = toggle && toggle.querySelector('.icon');

  function setTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('bt-theme', t);
    if(icon) icon.textContent = t === 'dark' ? '\u2600' : '\uD83C\uDF13';
  }
  function getTheme(){
    var s = localStorage.getItem('bt-theme');
    if(s) return s;
    return window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  }
  if(toggle){
    setTheme(getTheme());
    toggle.addEventListener('click', function(){
      setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // === BOOT ANIMATION ===
  (function boot(){
    var already = sessionStorage.getItem('bt-booted');
    if(already) return;
    var overlay = document.createElement('div');
    overlay.className = 'boot-overlay';
    overlay.innerHTML =
      '<div class="boot-content">' +
        '<div class="line">╔══ Backend Terminal v2.0 ═══════════════╗</div>' +
        '<div class="line">║                                      ║</div>' +
        '<div class="line">║  Initializing environment...         ║</div>' +
        '<div class="line">║  Loading curriculum...               ║</div>' +
        '<div class="line">║  Establishing connection...          ║</div>' +
        '<div class="line">║  System ready.                       ║</div>' +
        '<div class="line">║                                      ║</div>' +
        '<div class="line">╚══════════════════════════════════════╝</div>' +
        '<div class="line" style="margin-top:12px;">[ Press any key to continue ]<span class="cursor">_</span></div>' +
      '</div>';
    document.body.appendChild(overlay);

    var dismissed = false;
    function dismiss(){
      if(dismissed) return;
      dismissed = true;
      overlay.classList.add('hidden');
      sessionStorage.setItem('bt-booted', '1');
      setTimeout(function(){ overlay.remove(); }, 500);
    }
    document.addEventListener('keydown', dismiss);
    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  })();

  // === PROGRESS ===
  var STORAGE_KEY = 'bt-completed';

  function getCompleted(){
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch(e) { return []; }
  }
  function saveCompleted(arr){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function isCompleted(id){ return getCompleted().indexOf(id) !== -1; }
  function markCompleted(id){
    var arr = getCompleted();
    if(arr.indexOf(id) !== -1) return false;
    arr.push(id);
    saveCompleted(arr);
    return true;
  }
  function getXP(){ return getCompleted().length * 10; }

  // === LEVEL CARDS ===
  function updateLevelCards(){
    var cards = document.querySelectorAll('.level-card');
    if(!cards.length) return;
    var completed = getCompleted();
    cards.forEach(function(c){
      var num = c.getAttribute('data-ch');
      if(!num) return;
      var status = c.querySelector('.lv-status');
      var badge = c.querySelector('.lv-badge');
      var href = c.getAttribute('href');
      if(completed.indexOf(num) !== -1){
        if(status){ status.textContent = 'Completed'; status.className = 'lv-status completed'; }
        if(badge){ badge.textContent = '\u2713'; badge.className = 'lv-badge done'; }
        if(href) c.setAttribute('href', 'chapters/' + href);
      } else if(href === 'chapters/ch-01.html' || completed.indexOf(String(Number(num)-1)) !== -1){
        if(status){ status.textContent = 'Play'; status.className = 'lv-status active'; }
        if(badge){ badge.textContent = '\u25B6'; badge.className = 'lv-badge play'; }
        if(href) c.setAttribute('href', 'chapters/' + href);
      } else {
        if(status){ status.textContent = 'Locked'; status.className = 'lv-status locked'; }
        if(badge){ badge.textContent = '\uD83D\uDD12'; badge.className = 'lv-badge locked'; }
        c.removeAttribute('href');
        c.style.cursor = 'not-allowed';
      }
    });
  }

  // === XP BAR ===
  function updateXPBar(){
    var inner = document.querySelector('.xp-bar-inner');
    var xpLabel = document.querySelector('.xp-bar-wrap .xp');
    var rankLabel = document.querySelector('.xp-bar-wrap .rank');
    if(!inner) return;
    var total = 17;
    var done = getCompleted().length;
    var pct = Math.round((done / total) * 100);
    inner.style.width = pct + '%';
    if(xpLabel) xpLabel.textContent = getXP() + ' XP';
    if(rankLabel){
      var ranks = ['Recruit', 'Apprentice', 'Operator', 'Engineer', 'Architect'];
      var idx = Math.min(Math.floor(done / 4), 4);
      rankLabel.textContent = 'Rank: ' + ranks[idx];
    }
  }

  // === MARK COMPLETE ===
  function initMarkComplete(){
    var btn = document.querySelector('.btn-mark');
    if(!btn) return;
    var chId = btn.getAttribute('data-ch');
    if(isCompleted(chId)){
      btn.textContent = '\u2713 Completed';
      btn.className = 'btn-mark done';
      btn.disabled = true;
    }
    btn.addEventListener('click', function(){
      if(btn.disabled) return;
      var ok = markCompleted(chId);
      if(!ok) return;
      btn.textContent = '\u2713 Completed';
      btn.className = 'btn-mark done';
      btn.disabled = true;
      showXP();
      updateXPBar();
      updateLevelCards();
      updateChapterProgress();
    });
  }

  function showXP(){
    var pop = document.createElement('div');
    pop.className = 'xp-popup';
    pop.innerHTML =
      '<span class="icon">\u2B50</span>' +
      '<div class="txt">+10 XP</div>' +
      '<div class="sub">Chapter completed!</div>';
    document.body.appendChild(pop);
    setTimeout(function(){
      pop.style.opacity = '0';
      pop.style.transition = 'opacity 0.4s';
      setTimeout(function(){ pop.remove(); }, 400);
    }, 2000);
  }

  // === CHAPTER PROGRESS ===
  function updateChapterProgress(){
    var fill = document.querySelector('.cp-fill');
    var label = document.querySelector('.cp-label');
    if(!fill) return;
    var total = 17;
    var done = getCompleted().length;
    var pct = Math.round((done / total) * 100);
    fill.style.width = pct + '%';
    if(label) label.textContent = done + '/' + total + ' completed';
  }

  // === INIT ===
  function init(){
    updateLevelCards();
    updateXPBar();
    initMarkComplete();
    updateChapterProgress();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
