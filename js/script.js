(function(){
  'use strict';

  var STORAGE_KEY = 'bt-completed';

  function getCompleted(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch(e){ return []; }
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

  var totalChapters = 17;

  // === SIDEBAR ===
  var sidebar = document.getElementById('sidebar');
  var sidebarToggle = document.getElementById('sidebarToggle');
  var overlay = document.getElementById('sidebarOverlay');
  var sidebarState = localStorage.getItem('bt-sidebar');

  function openSidebar(){
    if(!sidebar) return;
    if(window.innerWidth <= 768){
      sidebar.classList.add('open');
      if(overlay) overlay.classList.add('show');
    } else {
      sidebar.classList.add('open');
      if(sidebarToggle) sidebarToggle.classList.add('shifted');
    }
    localStorage.setItem('bt-sidebar', 'open');
  }

  function closeSidebar(){
    if(!sidebar) return;
    if(window.innerWidth <= 768){
      sidebar.classList.remove('open');
      if(overlay) overlay.classList.remove('show');
    } else {
      sidebar.classList.remove('open');
      if(sidebarToggle) sidebarToggle.classList.remove('shifted');
    }
    localStorage.setItem('bt-sidebar', 'closed');
  }

  function toggleSidebar(){
    if(!sidebar) return;
    if(window.innerWidth <= 768){
      if(sidebar.classList.contains('open')){
        closeSidebar();
      } else {
        openSidebar();
      }
    } else {
      if(sidebar.classList.contains('open')){
        closeSidebar();
      } else {
        openSidebar();
      }
    }
  }

  if(sidebarToggle){
    sidebarToggle.addEventListener('click', toggleSidebar);
  }
  if(overlay){
    overlay.addEventListener('click', closeSidebar);
  }

  // Init sidebar state: restore or default to closed
  if(sidebar){
    if(sidebarState === 'open' && window.innerWidth > 768){
      sidebar.classList.add('open');
      if(sidebarToggle) sidebarToggle.classList.add('shifted');
    }
  }

  // === SIDEBAR NAV HIGHLIGHT & STATUS ===
  function updateSidebar(){
    var links = document.querySelectorAll('.sidebar-link');
    var currentPath = window.location.pathname.split('/').pop();
    var currentCh = null;
    links.forEach(function(a){
      var href = a.getAttribute('href');
      if(!href) return;
      var pageName = href.split('/').pop();
      var ch = a.getAttribute('data-ch');
      if(pageName === currentPath){
        a.classList.add('active');
        currentCh = ch;
      } else {
        a.classList.remove('active');
      }
      var status = a.querySelector('.status');
      if(!status) return;
      if(pageName === currentPath){
        status.textContent = '\u25B6';
      } else if(isCompleted(ch)){
        status.textContent = '\u2713';
        status.className = 'status done';
      } else {
        status.textContent = '';
        status.className = '';
      }
    });
    updateAllProgress();
  }

  // === PROGRESS ===
  function updateAllProgress(){
    var done = getCompleted().length;
    var bars = document.querySelectorAll('.progress-bar-inner, .cp-fill, .sidebar-progress-fill');
    var labels = document.querySelectorAll('.cp-label, .sidebar-progress-text, .progress-wrap .labels .done');
    var pcts = document.querySelectorAll('.progress-wrap .labels .pct');
    var pct = Math.round((done / totalChapters) * 100);

    bars.forEach(function(bar){
      bar.style.width = pct + '%';
    });
    labels.forEach(function(lbl){
      if(lbl.classList.contains('cp-label')){
        lbl.textContent = done + '/' + totalChapters + ' completed';
      } else if(lbl.classList.contains('sidebar-progress-text')){
        lbl.textContent = done + ' / ' + totalChapters + ' completed';
      } else if(lbl.classList.contains('done')){
        lbl.textContent = done + '/' + totalChapters + ' completed';
      }
    });
    pcts.forEach(function(p){
      p.textContent = pct + '%';
    });
  }

  // === HOMEPAGE CARDS ===
  function updateCards(){
    var cards = document.querySelectorAll('.chapter-card');
    if(!cards.length) return;
    var completed = getCompleted();
    cards.forEach(function(c){
      var num = c.getAttribute('data-ch');
      if(!num) return;
      var status = c.querySelector('.card-status');
      if(completed.indexOf(num) !== -1){
        if(status){ status.textContent = 'Completed'; status.className = 'card-status completed'; }
        c.classList.add('available');
      } else if(num === '1' || completed.indexOf(String(Number(num)-1)) !== -1){
        if(status){ status.textContent = 'Available'; status.className = 'card-status available'; }
        c.classList.add('available');
      } else {
        if(status){ status.textContent = 'Locked'; status.className = 'card-status locked'; }
        c.classList.add('locked');
        c.removeAttribute('href');
      }
    });
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
      updateSidebar();
      updateAllProgress();
    });
  }

  // === INIT ===
  function init(){
    updateCards();
    updateSidebar();
    updateAllProgress();
    initMarkComplete();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
