(function(){
'use strict';

const STORAGE_KEY = 'bt-completed';
const XP_KEY = 'bt-xp';
const LV_KEY = 'bt-level';
const SEC_KEY = 'bt-sections';

// ===== Storage helpers =====
function getCompleted(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e){ return []; }
}
function saveCompleted(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
function getXP(){
  try { return parseInt(localStorage.getItem(XP_KEY)) || 0; }
  catch(e){ return 0; }
}
function setXP(n){
  localStorage.setItem(XP_KEY, String(n));
}
function getLevel(){
  try { return parseInt(localStorage.getItem(LV_KEY)) || 1; }
  catch(e){ return 1; }
}
function setLevel(n){
  localStorage.setItem(LV_KEY, String(n));
}
function getSectionXP(){
  try { return JSON.parse(localStorage.getItem(SEC_KEY)) || {}; }
  catch(e){ return {}; }
}
function saveSectionXP(obj){
  localStorage.setItem(SEC_KEY, JSON.stringify(obj));
}

const XP_PER_SECTION = 50;
const XP_PER_CHAPTER = 100;
const XP_PER_LEVEL = 500;

const GROUP_NAMES = {
  foundation: 'Foundation',
  core: 'Core',
  scale: 'Scale',
  devops: 'DevOps',
  roadmap: 'Roadmap'
};

const GROUP_COLORS = {
  foundation: 'var(--grp-foundation)',
  core: 'var(--grp-core)',
  scale: 'var(--grp-scale)',
  devops: 'var(--grp-devops)',
  roadmap: 'var(--grp-roadmap)'
};

const GROUP_ICONS = {
  foundation: '\uD83C\uDF10',
  core: '\u2699\uFE0F',
  scale: '\uD83D\uDCC8',
  devops: '\uD83D\uDD27',
  roadmap: '\uD83D\uDDFA\uFE0F'
};

const BADGE_EMOJIS = ['\u2B50','\uD83C\uDF1F','\uD83C\uDFC6','\uD83D\uDC8E','\uD83C\uDF89','\uD83D\uDC51','\uD83E\uDE99','\uD83C\uDF96\uFE0F','\uD83E\uDD47','\uD83C\uDFC5','\uD83C\uDF1F','\uD83D\uDCA0','\uD83D\uDD25','\uD83C\uDF1F','\uD83D\uDCAB','\u2728','\uD83C\uDF1F'];

const GROUP_BADGES = {
  foundation: '\uD83C\uDF1F',
  core: '\uD83D\uDD25',
  scale: '\uD83D\uDCC8',
  devops: '\uD83D\uDD27',
  roadmap: '\uD83D\uDDFA\uFE0F'
};

const App = {
  total: 17,
  currentView: 'home',
  currentChapter: null,

  init(){
    this.render();
    window.addEventListener('hashchange', () => this.render());
  },

  getRoute(){
    var hash = window.location.hash || '#/';
    if (hash === '#/' || hash === '' || hash === '#') return { view: 'home' };
    var m = hash.match(/^#\/chapter\/(\d+)$/);
    if (m) return { view: 'chapter', id: parseInt(m[1]) };
    if (hash === '#/chapters') return { view: 'all' };
    return { view: 'home' };
  },

  render(){
    var route = this.getRoute();
    var app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '';
    app.className = '';

    if (route.view === 'chapter' && route.id >= 1 && route.id <= this.total) {
      this.currentView = 'chapter';
      this.currentChapter = route.id;
      app.classList.add('lesson-mode');
      this.renderLessonView(app, route.id);
    } else if (route.view === 'all') {
      this.currentView = 'all';
      this.currentChapter = null;
      this.renderAllChapters(app);
    } else {
      this.currentView = 'home';
      this.currentChapter = null;
      this.renderCatalog(app);
    }

    this.updateNav(route);
    window.scrollTo(0, 0);
  },

  navigate(view, id){
    if (view === 'home') { window.location.hash = '#/'; }
    else if (view === 'chapter') { window.location.hash = '#/chapter/' + id; }
    else if (view === 'all') { window.location.hash = '#/chapters'; }
  },

  updateNav(route){
    // Update nav link active states
    var links = document.querySelectorAll('.nav-link');
    links.forEach(function(l){
      l.classList.toggle('active', l.dataset.view === (route.view === 'chapter' ? 'home' : route.view));
    });
    // Update XP/Level display
    var xp = getXP();
    var lv = getLevel();
    var xpEl = document.getElementById('xpCount');
    var lvEl = document.getElementById('levelNum');
    if (xpEl) xpEl.textContent = xp;
    if (lvEl) lvEl.textContent = lv;
  },

  // ===== GAMIFICATION =====
  addXP(amount, reason){
    var xp = getXP();
    xp += amount;
    setXP(xp);
    // Check level up
    var lv = getLevel();
    var newLv = Math.floor(xp / XP_PER_LEVEL) + 1;
    if (newLv > lv) {
      setLevel(newLv);
      this.showLevelUp(lv, newLv);
    }
    this.updateNav();
  },

  showLevelUp(oldLv, newLv){
    var toast = document.createElement('div');
    toast.className = 'level-up-toast';
    toast.innerHTML = '\uD83C\uDF89 Level Up! Lv.' + oldLv + ' \u2192 Lv.' + newLv;
    toast.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);background:var(--primary);color:#000;padding:12px 24px;border-radius:8px;font-family:var(--font-mono);font-size:13px;font-weight:700;z-index:9999;animation:viewEnter 0.4s ease;box-shadow:0 4px 20px rgba(0,212,255,0.4);';
    document.body.appendChild(toast);
    setTimeout(function(){ toast.style.opacity='0'; toast.style.transition='opacity 0.5s'; setTimeout(function(){ toast.remove(); },500); }, 2500);
  },

  markSectionComplete(chapterId, sectionIdx){
    var key = chapterId + '-' + sectionIdx;
    var sec = getSectionXP();
    if (sec[key]) return false;
    sec[key] = true;
    saveSectionXP(sec);
    this.addXP(XP_PER_SECTION, 'Section completed');
    return true;
  },

  isSectionComplete(chapterId, sectionIdx){
    var sec = getSectionXP();
    return !!sec[chapterId + '-' + sectionIdx];
  },

  isCompleted(id){
    return getCompleted().indexOf(String(id)) !== -1;
  },

  markComplete(id){
    var arr = getCompleted();
    var sid = String(id);
    if (arr.indexOf(sid) !== -1) return false;
    arr.push(sid);
    saveCompleted(arr);
    this.addXP(XP_PER_CHAPTER, 'Chapter completed');

    // Check group completion
    var ch = this.getChapter(id);
    if (ch) {
      var group = ch.group;
      var groupChs = window.CHAPTERS.filter(function(c){ return c.group === group; }) || [];
      var allDone = groupChs.every(function(c){ return arr.indexOf(String(c.id)) !== -1; });
      if (allDone) {
        this.addXP(250, group + ' group completed');
        this.showGroupComplete(group);
      }
    }

    this.render();
    return true;
  },

  showGroupComplete(group){
    var name = GROUP_NAMES[group] || group;
    var icon = GROUP_BADGES[group] || '\uD83C\uDF1F';
    var toast = document.createElement('div');
    toast.className = 'group-toast';
    toast.innerHTML = icon + ' ' + name + ' Complete! +250 XP';
    toast.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);background:var(--grp-' + group + ');color:#000;padding:12px 24px;border-radius:8px;font-family:var(--font-mono);font-size:13px;font-weight:700;z-index:9999;animation:viewEnter 0.4s ease;box-shadow:0 4px 20px rgba(0,0,0,0.4);';
    document.body.appendChild(toast);
    setTimeout(function(){ toast.style.opacity='0'; toast.style.transition='opacity 0.5s'; setTimeout(function(){ toast.remove(); },500); }, 3000);
  },

  getChapter(id){
    return (window.CHAPTERS || [])[id - 1] || null;
  },

  getCompletedSectionsForChapter(chapterId){
    var sec = getSectionXP();
    var ch = this.getChapter(chapterId);
    if (!ch || !ch.sections) return 0;
    var count = 0;
    for (var i = 0; i < ch.sections.length; i++) {
      if (sec[chapterId + '-' + i]) count++;
    }
    return count;
  },

  // ===== COURSE CATALOG =====
  renderCatalog(container){
    var wrapper = document.createElement('div');
    wrapper.className = 'catalog-wrapper';

    var chapters = window.CHAPTERS || [];
    var done = getCompleted();
    var xp = getXP();
    var lv = getLevel();
    var totalSections = chapters.reduce(function(a,c){ return a + (c.sections ? c.sections.length : 0); }, 0);

    wrapper.innerHTML =
      '<div class="catalog-header">' +
        '<h1>Backend Fundamentals</h1>' +
        '<p class="catalog-sub">A free 17-chapter interactive guide to how the backend actually works. Complete chapters to unlock the next group.</p>' +
        '<div class="catalog-stats">' +
          '<span><strong>' + done.length + '</strong>/' + chapters.length + ' Chapters</span>' +
          '<span><strong>' + xp + '</strong> XP</span>' +
          '<span><strong>Lv.' + lv + '</strong></span>' +
        '</div>' +
      '</div>';

    // Group by... actually show all chapters in order with section separators
    var currentGroup = '';
    chapters.forEach(function(ch, i){
      var id = ch.id;
      var isDone = done.indexOf(String(id)) !== -1;
      var isAvailable = id === 1 || done.indexOf(String(id - 1)) !== -1 || isDone;

      if (ch.group !== currentGroup) {
        currentGroup = ch.group;
        var secTitle = document.createElement('div');
        secTitle.className = 'catalog-section-title';
        secTitle.textContent = (GROUP_ICONS[ch.group] || '') + ' ' + (GROUP_NAMES[ch.group] || ch.group);
        wrapper.appendChild(secTitle);

        var grid = document.createElement('div');
        grid.className = 'catalog-grid';
        grid.id = 'grid-' + ch.group;
        wrapper.appendChild(grid);
      }

      var grid = wrapper.querySelector('#grid-' + ch.group);

      var card = document.createElement('div');
      card.className = 'course-card';
      if (isDone) card.classList.add('completed');
      if (!isAvailable) card.classList.add('locked');

      var secCount = ch.sections ? ch.sections.length : 0;
      var doneSecs = this.getCompletedSectionsForChapter(id);

      card.innerHTML =
        '<div class="card-banner grp-' + ch.group + '">' +
          '<span class="card-icon">' + (GROUP_ICONS[ch.group] || '') + '</span>' +
          '<span class="card-num">Ch ' + String(id).padStart(2,'0') + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<span class="card-badge">' + (isDone ? 'Completed' : (isAvailable ? 'Beginner' : 'Locked')) + '</span>' +
          '<div class="card-title">' + ch.title + '</div>' +
          '<div class="card-sub">' + (ch.subtitle || '') + '</div>' +
          '<div class="card-footer">' +
            '<span class="card-status">' + (isDone ? '\u2713 ' + doneSecs + '/' + secCount : doneSecs + '/' + secCount + ' sections') + '</span>' +
            '<span class="card-xp">' + (secCount * XP_PER_SECTION + XP_PER_CHAPTER) + ' XP</span>' +
          '</div>' +
        '</div>';

      if (isAvailable) {
        card.addEventListener('click', function(chId){ return function(){ App.navigate('chapter', chId); }; }(id));
      }

      grid.appendChild(card);
    }.bind(this));

    container.appendChild(wrapper);
  },

  // ===== ALL CHAPTERS PAGE =====
  renderAllChapters(container){
    var wrapper = document.createElement('div');
    wrapper.className = 'all-chapters-wrapper view active';
    wrapper.innerHTML = '<h1>All Chapters</h1><p class="ac-sub">' + this.total + ' chapters covering everything backend.</p>';

    var list = document.createElement('div');
    list.className = 'chapter-list';

    var chapters = window.CHAPTERS || [];
    var done = getCompleted();

    chapters.forEach(function(ch){
      var id = ch.id;
      var isDone = done.indexOf(String(id)) !== -1;
      var isAvailable = id === 1 || done.indexOf(String(id - 1)) !== -1 || isDone;

      var item = document.createElement('div');
      item.className = 'chapter-list-item';
      if (!isAvailable) item.classList.add('locked');

      var statusText = isDone ? 'Completed' : (isAvailable ? 'Available' : 'Locked');
      var statusClass = isDone ? 'completed' : (isAvailable ? 'available' : 'locked');

      item.innerHTML =
        '<span class="cli-num" style="color:' + (GROUP_COLORS[ch.group] || 'var(--text-faint)') + '">' + String(id).padStart(2,'0') + '</span>' +
        '<div class="cli-info">' +
          '<div class="cli-title">' + ch.title + '</div>' +
          '<div class="cli-sub">' + (GROUP_NAMES[ch.group] || ch.group) + ' &middot; ' + (ch.subtitle || '') + '</div>' +
        '</div>' +
        '<span class="cli-status ' + statusClass + '">' + statusText + '</span>';

      if (isAvailable) {
        item.addEventListener('click', function(chId){ return function(){ App.navigate('chapter', chId); }; }(id));
      }

      list.appendChild(item);
    });

    wrapper.appendChild(list);
    container.appendChild(wrapper);
  },

  // ===== LESSON VIEW =====
  renderLessonView(container, id){
    var ch = this.getChapter(id);
    if (!ch) {
      container.innerHTML = '<div class="lesson-content"><div class="lesson-content-inner"><p>Chapter not found.</p></div></div>';
      return;
    }

    var layout = document.createElement('div');
    layout.className = 'lesson-layout';

    // Sidebar
    var sidebar = document.createElement('aside');
    sidebar.className = 'lesson-sidebar';
    this.buildSidebar(sidebar, ch, id);
    layout.appendChild(sidebar);

    // Main content
    var content = document.createElement('div');
    content.className = 'lesson-content';
    this.buildLessonContent(content, ch, id);
    layout.appendChild(content);

    container.appendChild(layout);
  },

  buildSidebar(sidebar, ch, id){
    var sections = ch.sections || [];
    var doneSecs = this.getCompletedSectionsForChapter(id);
    var totalSecs = sections.length;
    var pct = totalSecs > 0 ? Math.round((doneSecs / totalSecs) * 100) : 0;

    var h = document.createElement('div');
    h.className = 'sidebar-header';
    h.innerHTML = '<h3>' + ch.title + '</h3><div class="sidebar-sub">Chapter ' + String(id).padStart(2, '0') + ' &middot; ' + totalSecs + ' sections</div>';
    sidebar.appendChild(h);

    var prog = document.createElement('div');
    prog.className = 'sidebar-progress';
    prog.innerHTML =
      '<div class="sp-label"><span>' + doneSecs + '/' + totalSecs + '</span><span>' + pct + '%</span></div>' +
      '<div class="sp-bar"><div class="sp-fill" style="width:' + pct + '%"></div></div>';
    sidebar.appendChild(prog);

    var list = document.createElement('div');
    list.className = 'sidebar-section-list';

    sections.forEach(function(sec, i){
      var item = document.createElement('div');
      item.className = 'sidebar-section-item';
      if (i === 0) item.classList.add('active');
      if (App.isSectionComplete(id, i)) {
        item.classList.add('completed');
      }

      var statusEl = document.createElement('div');
      statusEl.className = 'ss-status';
      if (App.isSectionComplete(id, i)) {
        statusEl.classList.add('done');
        statusEl.innerHTML = '\u2713';
      } else if (i === 0 || App.isSectionComplete(id, i - 1)) {
        statusEl.classList.add('active-now');
        statusEl.textContent = String(i + 1);
      } else {
        statusEl.textContent = String(i + 1);
      }

      var titleEl = document.createElement('div');
      titleEl.className = 'ss-title';
      titleEl.textContent = sec.title;

      var xpEl = document.createElement('div');
      xpEl.className = 'ss-xp';
      xpEl.textContent = '+' + XP_PER_SECTION + ' XP';

      item.appendChild(statusEl);
      item.appendChild(titleEl);
      item.appendChild(xpEl);

      item.addEventListener('click', function(sectionId){ return function(){
        var el = document.getElementById('section-' + sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }; }(i));

      list.appendChild(item);
    });

    sidebar.appendChild(list);

    // Chapter XP summary
    var sum = document.createElement('div');
    sum.style.cssText = 'padding:16px;border-top:1px solid var(--border);margin-top:12px;';
    sum.innerHTML = '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);">Chapter Reward</div>' +
      '<div style="font-family:var(--font-mono);font-size:12px;color:var(--primary);font-weight:700;margin-top:4px;">+' + (totalSecs * XP_PER_SECTION + XP_PER_CHAPTER) + ' XP</div>';
    sidebar.appendChild(sum);
  },

  buildLessonContent(content, ch, id){
    var inner = document.createElement('div');
    inner.className = 'lesson-content-inner';

    // Header
    var header = document.createElement('div');
    header.className = 'lesson-header';
    var gc = GROUP_COLORS[ch.group] || 'var(--primary)';
    header.innerHTML =
      '<div class="lesson-eyebrow" style="color:' + gc + '">Chapter ' + String(id).padStart(2,'0') + ' / ' + this.total + ' &middot; ' + (GROUP_NAMES[ch.group] || ch.group) + '</div>' +
      '<h1>' + ch.title + '</h1>' +
      (ch.subtitle ? '<p class="lesson-sub">' + ch.subtitle + '</p>' : '');
    inner.appendChild(header);

    // Sections
    var sections = ch.sections || [];
    sections.forEach(function(section, i){
      var sec = document.createElement('div');
      sec.className = 'lesson-section';
      sec.id = 'section-' + i;

      var secNum = String(i + 1).padStart(2, '0');
      sec.innerHTML = '<h2><span class="sec-num" style="color:' + gc + '">' + secNum + '.</span> ' + section.title + '</h2>';

      var grid = document.createElement('div');
      grid.className = 'lesson-grid';

      // Text column
      var txt = document.createElement('div');
      txt.className = 'lesson-text';
      txt.innerHTML = section.text || '';
      grid.appendChild(txt);

      // Diagram column
      if (section.diagram) {
        var dia = document.createElement('div');
        dia.className = 'lesson-diagram';
        dia.innerHTML = section.diagram;

        if (section.caption) {
          var cap = document.createElement('div');
          cap.className = 'diag-cap';
          cap.textContent = section.caption;
          dia.appendChild(cap);
        }

        // Mark for interaction engine
        dia.dataset.sectionIndex = i;
        dia.dataset.chapterId = id;

        grid.appendChild(dia);
      }

      sec.appendChild(grid);

      // Supplementary detailed content
      if (section.detail || section.extraDiagram) {
        var sup = document.createElement('div');
        sup.className = 'supplementary-block';

        var supTitle = document.createElement('div');
        supTitle.className = 'sup-title';
        supTitle.innerHTML = '\u25B6 Deep Dive \u2192';
        supTitle.addEventListener('click', function(bodyEl, titleEl){
          return function(){
            var isOpen = bodyEl.classList.toggle('open');
            titleEl.innerHTML = isOpen ? '\u25BC Deep Dive \u2193' : '\u25B6 Deep Dive \u2192';
          };
        }(sup, supTitle));
        sup.appendChild(supTitle);

        var supBody = document.createElement('div');
        supBody.className = 'sup-body';

        if (section.detail) {
          var p = document.createElement('p');
          p.innerHTML = section.detail;
          supBody.appendChild(p);
        }

        if (section.code) {
          var cb = document.createElement('div');
          cb.className = 'code-block';
          var lang = section.codeLang || 'javascript';
          cb.innerHTML = '<div class="cb-head">' + (section.codeLabel || 'Example') + '</div><pre><code>' + section.code + '</code></pre>';
          supBody.appendChild(cb);
        }

        if (section.callout) {
          var ct = document.createElement('div');
          ct.className = 'callout ' + (section.calloutType || 'info');
          ct.innerHTML = '<strong>' + (section.calloutTitle || '') + '</strong> ' + section.callout;
          supBody.appendChild(ct);
        }

        if (section.extraDiagram && window.diagram) {
          var ed = section.extraDiagram;
          var fn = window.diagram[ed.type];
          if (fn) {
            var dStr = fn.apply(null, ed.args || []);
            var dDiv = document.createElement('div');
            dDiv.className = 'lesson-diagram';
            dDiv.style.marginTop = '12px';
            dDiv.innerHTML = dStr;
            if (ed.caption) {
              var cap2 = document.createElement('div');
              cap2.className = 'diag-cap';
              cap2.textContent = ed.caption;
              dDiv.appendChild(cap2);
            }
            supBody.appendChild(dDiv);
          }
        }

        sup.appendChild(supBody);
        sec.appendChild(sup);
      }

      // Mark complete button for this section
      var isSecDone = App.isSectionComplete(id, i);
      var mw = document.createElement('div');
      mw.className = 'mark-wrap';
      mw.style.marginTop = '16px';
      var btn = document.createElement('button');
      btn.className = 'btn-mark' + (isSecDone ? ' done' : '');
      btn.textContent = isSecDone ? '\u2713 Section Complete (+50 XP)' : 'Mark Section Complete';
      if (!isSecDone) {
        btn.addEventListener('click', function(chId, secIdx, el){
          return function(){
            App.markSectionComplete(chId, secIdx);
            el.textContent = '\u2713 Section Complete (+50 XP)';
            el.classList.add('done');
            // Also update sidebar
            App.render();
          };
        }(id, i, btn));
      }
      mw.appendChild(btn);
      sec.appendChild(mw);

      inner.appendChild(sec);
    });

    // Back to catalog
    var backBtn = document.createElement('button');
    backBtn.className = 'btn-mark';
    backBtn.style.marginRight = '12px';
    backBtn.textContent = '\u2190 Back to Courses';
    backBtn.addEventListener('click', function(){ App.navigate('home'); });

    // Mark chapter complete
    var isChDone = this.isCompleted(id);
    var chBtn = document.createElement('button');
    chBtn.className = 'btn-mark' + (isChDone ? ' done' : '');
    chBtn.textContent = isChDone ? '\u2713 Chapter Completed (+100 XP)' : 'Complete Chapter (+100 XP)';
    if (!isChDone) {
      chBtn.addEventListener('click', function(chId, el){
        return function(){
          App.markComplete(chId);
          el.textContent = '\u2713 Chapter Completed (+100 XP)';
          el.classList.add('done');
        };
      }(id, chBtn));
    }

    var mw2 = document.createElement('div');
    mw2.className = 'mark-wrap';
    mw2.style.cssText = 'display:flex;gap:12px;justify-content:center;margin-top:32px;';
    mw2.appendChild(backBtn);
    mw2.appendChild(chBtn);
    inner.appendChild(mw2);

    // Chapter nav
    var chapters = window.CHAPTERS || [];
    var nav = document.createElement('nav');
    nav.className = 'lesson-nav';
    if (id > 1) {
      var prev = document.createElement('a');
      prev.href = '#/chapter/' + (id - 1);
      prev.innerHTML = '<div class="nav-dir">\u2190 Previous</div><div class="nav-ch">' + (chapters[id - 2] ? chapters[id - 2].title : '') + '</div>';
      nav.appendChild(prev);
    }
    if (id < this.total) {
      var next = document.createElement('a');
      next.href = '#/chapter/' + (id + 1);
      next.className = 'nav-next';
      next.innerHTML = '<div class="nav-dir">Next \u2192</div><div class="nav-ch">' + (chapters[id] ? chapters[id].title : '') + '</div>';
      nav.appendChild(next);
    }
    inner.appendChild(nav);

    content.appendChild(inner);

    // Trigger diagram interaction engine after DOM inserted
    setTimeout(function(){
      if (window.DiagramInteract) {
        window.DiagramInteract.init();
      }
    }, 100);
  }
};

// ===== INIT =====
function init(){
  if (window.location.hash === '' || window.location.hash === '#') {
    window.location.hash = '#/';
  }
  App.init();
  // Initial nav update
  App.updateNav(App.getRoute());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
