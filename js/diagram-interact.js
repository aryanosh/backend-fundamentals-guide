(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function findTextInSvg(el) {
    var svgRoot = el.closest('svg');
    if (!svgRoot) return '';

    var textEl;

    // try sibling text element
    var sib = el.nextElementSibling;
    while (sib) {
      if (sib.tagName === 'text' || (sib.tagName && sib.tagName.toLowerCase() === 'text')) {
        textEl = sib;
        break;
      }
      sib = sib.nextElementSibling;
    }

    if (!textEl) {
      // try parent's text child
      var parent = el.parentElement;
      if (parent) {
        var children = parent.children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child.tagName && child.tagName.toLowerCase() === 'text') {
            textEl = child;
            break;
          }
        }
      }
    }

    if (!textEl) {
      // fallback: look for nearest text in the entire SVG
      var allText = svgRoot.querySelectorAll('text');
      var elRect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
      var bestDist = Infinity;
      for (var j = 0; j < allText.length; j++) {
        var t = allText[j];
        if (elRect && t.getBoundingClientRect) {
          var tRect = t.getBoundingClientRect();
          var dx = tRect.left - elRect.left;
          var dy = tRect.top - elRect.top;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < bestDist) {
            bestDist = dist;
            textEl = t;
          }
        } else {
          // no layout info – assign last resort
          textEl = t;
        }
      }
    }

    return textEl ? (textEl.textContent || '').trim() : '';
  }

  function animatePath(pathEl) {
    var length = pathEl.getTotalLength ? pathEl.getTotalLength() : 0;
    if (length === 0) return;
    pathEl.style.strokeDasharray = length + ' ' + length;
    pathEl.style.strokeDashoffset = length;
    pathEl.style.animation = 'diagram-flow 1.5s linear infinite';
  }

  function createTooltip(text, x, y) {
    var tip = document.createElement('div');
    tip.className = 'diagram-tooltip';
    tip.textContent = text;
    tip.style.cssText =
      'position:fixed;z-index:10000;pointer-events:none;' +
      'background:var(--bg,#1e1e2e);color:var(--text,#cdd6f4);' +
      'padding:6px 12px;border-radius:6px;font-size:13px;' +
      'border:1px solid var(--primary,#89b4fa);' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.35);' +
      'white-space:nowrap;transition:opacity 0.15s;' +
      'left:' + x + 'px;top:' + (y - 10) + 'px;' +
      'transform:translateY(-100%);opacity:0;';
    document.body.appendChild(tip);
    // trigger reflow then fade in
    tip.offsetHeight;
    tip.style.opacity = '1';
    return tip;
  }

  function createStepControl(svgContainer, steps) {
    if (svgContainer.querySelector('.diagram-step-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'diagram-step-bar';
    bar.style.cssText =
      'display:flex;align-items:center;gap:8px;' +
      'padding:8px 12px;margin-top:8px;' +
      'background:var(--bg,#1e1e2e);border-radius:8px;' +
      'border:1px solid var(--border,#313244);' +
      'justify-content:center;flex-wrap:wrap;';

    var btnStyle =
      'background:var(--surface,#313244);color:var(--text,#cdd6f4);' +
      'border:1px solid var(--border,#45475a);border-radius:6px;' +
      'padding:4px 12px;cursor:pointer;font-size:13px;' +
      'transition:background 0.15s;';

    var prevBtn = document.createElement('button');
    prevBtn.textContent = '◀ Prev';
    prevBtn.style.cssText = btnStyle;

    var playBtn = document.createElement('button');
    playBtn.textContent = '▶ Play';
    playBtn.style.cssText = btnStyle;

    var nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next ▶';
    nextBtn.style.cssText = btnStyle;

    var counter = document.createElement('span');
    counter.style.cssText = 'font-size:13px;color:var(--subtext0,#a6adc8);min-width:70px;text-align:center;';

    bar.appendChild(prevBtn);
    bar.appendChild(playBtn);
    bar.appendChild(counter);
    bar.appendChild(nextBtn);
    svgContainer.appendChild(bar);

    // state
    var state = {
      current: 0,
      playing: false,
      timer: null,
      steps: steps
    };

    function update() {
      // clear highlights
      steps.forEach(function (el, idx) {
        el.classList.remove('diagram-step-active', 'diagram-step-dimmed');
      });
      if (steps.length === 0) return;
      steps[state.current].classList.add('diagram-step-active');
      // dim others
      steps.forEach(function (el, idx) {
        if (idx !== state.current) {
          el.classList.add('diagram-step-dimmed');
        }
      });
      counter.textContent = (state.current + 1) + ' / ' + steps.length;
    }

    function next() {
      if (state.current < steps.length - 1) {
        state.current++;
        update();
      }
    }

    function prev() {
      if (state.current > 0) {
        state.current--;
        update();
      }
    }

    function togglePlay() {
      state.playing = !state.playing;
      if (state.playing) {
        playBtn.textContent = '⏸ Pause';
        state.timer = setInterval(function () {
          if (state.current >= steps.length - 1) {
            state.current = 0;
          } else {
            state.current++;
          }
          update();
        }, 2000);
      } else {
        playBtn.textContent = '▶ Play';
        clearInterval(state.timer);
        state.timer = null;
      }
    }

    function resetPlay() {
      if (state.playing) {
        clearInterval(state.timer);
        state.playing = false;
        playBtn.textContent = '▶ Play';
        state.timer = null;
      }
    }

    prevBtn.addEventListener('click', function () { resetPlay(); prev(); });
    nextBtn.addEventListener('click', function () { resetPlay(); next(); });
    playBtn.addEventListener('click', togglePlay);

    update();
  }

  // ---------------------------------------------------------------------------
  // Step detection & control injection
  // ---------------------------------------------------------------------------

  function detectSteps(svg) {
    // look for text matching "STEP \d+" or "Step \d+"
    var textNodes = svg.querySelectorAll('text');
    var stepEls = [];
    var seen = {};

    for (var i = 0; i < textNodes.length; i++) {
      var txt = textNodes[i].textContent || '';
      var m = txt.match(/\b[Ss][Tt][Ee][Pp]\s+(\d+)\b/);
      if (m) {
        var num = parseInt(m[1], 10);
        if (!seen[num]) {
          seen[num] = true;
          // find the closest shape sibling/parent to highlight
          var shape = findStepShape(textNodes[i]);
          if (shape) stepEls.push(shape);
        }
      }
    }

    // if no STEP labels found, try sequential numbered list – group by numeric prefix
    if (stepEls.length === 0) {
      var items = [];
      for (var j = 0; j < textNodes.length; j++) {
        var t = textNodes[j].textContent || '';
        var n = parseInt(t, 10);
        if (!isNaN(n) && t.trim() === String(n)) {
          var s = findStepShape(textNodes[j]);
          if (s) items.push({ num: n, el: s });
        }
      }
      items.sort(function (a, b) { return a.num - b.num; });
      for (var k = 0; k < items.length; k++) {
        stepEls.push(items[k].el);
      }
    }

    return stepEls;
  }

  function findStepShape(textEl) {
    // look for sibling or parent rect/circle/polygon
    var sib = textEl.previousElementSibling;
    while (sib) {
      var tag = sib.tagName ? sib.tagName.toLowerCase() : '';
      if (tag === 'rect' || tag === 'circle' || tag === 'polygon' || tag === 'ellipse') {
        return sib;
      }
      sib = sib.previousElementSibling;
    }
    // try parent
    var parent = textEl.parentElement;
    if (parent) {
      var tag2 = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (tag2 === 'rect' || tag2 === 'circle' || tag2 === 'polygon' || tag2 === 'ellipse') return parent;
      var children = parent.children;
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (c === textEl) continue;
        var ct = c.tagName ? c.tagName.toLowerCase() : '';
        if (ct === 'rect' || ct === 'circle' || ct === 'polygon' || ct === 'ellipse') return c;
      }
    }
    return textEl;
  }

  // ---------------------------------------------------------------------------
  // Inject keyframes once
  // ---------------------------------------------------------------------------

  function injectStyles() {
    if (document.getElementById('diagram-interact-styles')) return;
    var style = document.createElement('style');
    style.id = 'diagram-interact-styles';
    style.textContent =
      '@keyframes diagram-flow {' +
      '  to { stroke-dashoffset: 0; }' +
      '}' +
      '@keyframes diagram-pulse {' +
      '  0%, 100% { filter: drop-shadow(0 0 4px var(--primary,#89b4fa)); }' +
      '  50% { filter: drop-shadow(0 0 12px var(--primary,#89b4fa)); }' +
      '}' +
      '.diagram-step-active {' +
      '  animation: diagram-pulse 1.2s ease-in-out infinite;' +
      '}' +
      '.diagram-step-dimmed {' +
      '  opacity: 0.3;' +
      '  transition: opacity 0.3s;' +
      '}' +
      '.diagram-hover-highlight {' +
      '  opacity: 1 !important;' +
      '  filter: brightness(1.3) drop-shadow(0 0 6px var(--primary,#89b4fa));' +
      '  transition: opacity 0.2s, filter 0.2s;' +
      '}' +
      '.diagram-hover-dim {' +
      '  opacity: 0.3 !important;' +
      '  transition: opacity 0.2s;' +
      '}' +
      '.diagram-zoom-overlay {' +
      '  position: fixed; inset: 0; z-index: 20000;' +
      '  background: rgba(0,0,0,0.75);' +
      '  display: flex; align-items: center; justify-content: center;' +
      '  cursor: grab; overflow: hidden;' +
      '}' +
      '.diagram-zoom-overlay.dragging { cursor: grabbing; }' +
      '.diagram-zoom-svg {' +
      '  max-width: 90vw; max-height: 90vh;' +
      '  transition: transform 0.1s;' +
      '  transform-origin: center center;' +
      '}' +
      '.diagram-zoom-close {' +
      '  position: fixed; top: 16px; right: 16px; z-index: 20001;' +
      '  background: var(--surface,#313244); color: var(--text,#cdd6f4);' +
      '  border: 1px solid var(--border,#45475a); border-radius: 8px;' +
      '  width: 36px; height: 36px; font-size: 20px;' +
      '  cursor: pointer; display: flex; align-items: center; justify-content: center;' +
      '}' +
      '.diagram-tooltip { opacity: 0; }' +
      '.diagram-visible-text {' +
      '  transition: box-shadow 0.3s;' +
      '}' +
      '.diagram-visible-text.highlight {' +
      '  box-shadow: 0 0 0 2px var(--primary,#89b4fa);' +
      '  border-radius: 2px;' +
      '}';
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Hover highlighting + tooltips
  // ---------------------------------------------------------------------------

  function enableHover(svg) {
    var targets = svg.querySelectorAll('rect, circle, polygon, ellipse');
    var shapes = Array.prototype.slice.call(targets);

    function onEnter(e) {
      var el = e.currentTarget;
      var text = findTextInSvg(el);
      shapes.forEach(function (s) {
        if (s !== el) s.classList.add('diagram-hover-dim');
        else s.classList.add('diagram-hover-highlight');
      });
      if (text) {
        var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
        var cx = rect ? rect.left + rect.width / 2 : e.clientX;
        var cy = rect ? rect.top : e.clientY;
        el._tip = createTooltip(text, cx, cy);
      }
    }

    function onMove(e) {
      var el = e.currentTarget;
      if (el._tip) {
        el._tip.style.left = e.clientX + 'px';
        el._tip.style.top = (e.clientY - 10) + 'px';
      }
    }

    function onLeave(e) {
      var el = e.currentTarget;
      shapes.forEach(function (s) {
        s.classList.remove('diagram-hover-highlight', 'diagram-hover-dim');
      });
      if (el._tip) {
        el._tip.style.opacity = '0';
        var tip = el._tip;
        setTimeout(function () { if (tip.parentNode) tip.parentNode.removeChild(tip); }, 200);
        el._tip = null;
      }
    }

    for (var i = 0; i < shapes.length; i++) {
      shapes[i].addEventListener('mouseenter', onEnter);
      shapes[i].addEventListener('mousemove', onMove);
      shapes[i].addEventListener('mouseleave', onLeave);
    }
  }

  // ---------------------------------------------------------------------------
  // Flow animations for arrow lines/paths
  // ---------------------------------------------------------------------------

  function enableFlowArrows(svg) {
    var lines = svg.querySelectorAll('line, path');
    for (var i = 0; i < lines.length; i++) {
      var el = lines[i];
      if (el.getAttribute('marker-end') || el.getAttribute('marker-start') || el.getAttribute('marker-mid')) {
        animatePath(el);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Step-through mode
  // ---------------------------------------------------------------------------

  function enableStepMode(svg) {
    var steps = detectSteps(svg);
    if (steps.length < 2) return;
    var container = svg.parentElement;
    if (!container) return;
    createStepControl(container, steps);
  }

  // ---------------------------------------------------------------------------
  // Click-to-zoom overlay
  // ---------------------------------------------------------------------------

  function enableZoom(svg) {
    svg.style.cursor = 'zoom-in';
    svg.addEventListener('click', function (e) {
      e.stopPropagation();
      createZoomOverlay(svg);
    });
  }

  function createZoomOverlay(svg) {
    if (document.querySelector('.diagram-zoom-overlay')) return;

    var overlay = document.createElement('div');
    overlay.className = 'diagram-zoom-overlay';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'diagram-zoom-close';
    closeBtn.innerHTML = '✕';
    overlay.appendChild(closeBtn);

    var clonedSvg = svg.cloneNode(true);
    clonedSvg.removeAttribute('style');
    clonedSvg.className = 'diagram-zoom-svg';
    overlay.appendChild(clonedSvg);

    document.body.appendChild(overlay);

    // state
    var scale = 1;
    var translateX = 0;
    var translateY = 0;
    var isDragging = false;
    var startX, startY, origX, origY;
    var lastDist = 0;

    function applyTransform() {
      clonedSvg.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ')';
    }

    // wheel zoom
    overlay.addEventListener('wheel', function (e) {
      e.preventDefault();
      var delta = e.deltaY > 0 ? 0.9 : 1.1;
      var newScale = scale * delta;
      if (newScale < 0.5) newScale = 0.5;
      if (newScale > 5) newScale = 5;
      // zoom towards mouse
      if (clonedSvg.getBoundingClientRect) {
        var rect = clonedSvg.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        translateX -= mx * (newScale / scale - 1);
        translateY -= my * (newScale / scale - 1);
      }
      scale = newScale;
      applyTransform();
    }, { passive: false });

    // mouse drag
    overlay.addEventListener('mousedown', function (e) {
      if (e.target !== clonedSvg && e.target !== overlay) return;
      isDragging = true;
      overlay.classList.add('dragging');
      startX = e.clientX;
      startY = e.clientY;
      origX = translateX;
      origY = translateY;
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      translateX = origX + dx;
      translateY = origY + dy;
      applyTransform();
    });

    document.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        overlay.classList.remove('dragging');
      }
    });

    // touch support
    var touches = {};
    overlay.addEventListener('touchstart', function (e) {
      var changed = e.changedTouches;
      for (var i = 0; i < changed.length; i++) {
        touches[changed[i].identifier] = { x: changed[i].clientX, y: changed[i].clientY };
      }
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        origX = translateX;
        origY = translateY;
      }
      if (e.touches.length === 2) {
        var t0 = e.touches[0];
        var t1 = e.touches[1];
        lastDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      }
    }, { passive: true });

    overlay.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        var dx = e.touches[0].clientX - startX;
        var dy = e.touches[0].clientY - startY;
        translateX = origX + dx;
        translateY = origY + dy;
        applyTransform();
      }
      if (e.touches.length === 2) {
        var t0 = e.touches[0];
        var t1 = e.touches[1];
        var dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        if (lastDist > 0) {
          var newScale = scale * (dist / lastDist);
          if (newScale < 0.5) newScale = 0.5;
          if (newScale > 5) newScale = 5;
          scale = newScale;
          applyTransform();
        }
        lastDist = dist;
        // track translation while pinching
        var cx = (t0.clientX + t1.clientX) / 2;
        var cy = (t0.clientY + t1.clientY) / 2;
        translateX = origX + (cx - startX);
        translateY = origY + (cy - startY);
        applyTransform();
      }
    }, { passive: false });

    overlay.addEventListener('touchend', function (e) {
      isDragging = false;
      var changed = e.changedTouches;
      for (var i = 0; i < changed.length; i++) {
        delete touches[changed[i].identifier];
      }
    }, { passive: true });

    function close() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape' && document.querySelector('.diagram-zoom-overlay')) {
        close();
        document.removeEventListener('keydown', onKey);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Text-diagram sync via IntersectionObserver
  // ---------------------------------------------------------------------------

  function enableTextSync(svg) {
    // Find SVG shapes with text labels
    var textLabels = svg.querySelectorAll('text');
    var shapes = svg.querySelectorAll('rect, circle, polygon, ellipse');
    var pairs = [];

    for (var i = 0; i < textLabels.length; i++) {
      var label = textLabels[i];
      var shape = findStepShape(label);
      if (shape && shape !== label) {
        pairs.push({ label: label, shape: shape });
      }
    }

    if (pairs.length === 0) return;

    // Find document text paragraphs or headings near this SVG
    var svgId = svg.id || svg.parentElement.id || '';
    // Look for text sections that could be related; we use the SVG's position
    // to find relevant paragraphs in the document
    var container = svg.closest('.topic-diagram') || svg.parentElement;
    var doc = container.ownerDocument || document;

    // Search for text content that matches text from the SVG labels
    var bodyTexts = doc.querySelectorAll('p, li, h3, h4, h5, h6, .text-content, article p, section p');
    var matchedPairs = [];

    for (var j = 0; j < pairs.length; j++) {
      var labelText = (pairs[j].label.textContent || '').trim().toLowerCase();
      if (!labelText) continue;
      for (var k = 0; k < bodyTexts.length; k++) {
        var paraText = (bodyTexts[k].textContent || '').trim().toLowerCase();
        if (paraText.indexOf(labelText) !== -1) {
          matchedPairs.push({ para: bodyTexts[k], shape: pairs[j].shape });
          break;
        }
      }
    }

    if (matchedPairs.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var pair = entry._pair;
        if (entry.isIntersecting) {
          pair.shape.classList.add('diagram-hover-highlight');
        } else {
          pair.shape.classList.remove('diagram-hover-highlight');
        }
      });
    }, { threshold: 0.3 });

    for (var m = 0; m < matchedPairs.length; m++) {
      var entry = matchedPairs[m];
      entry.para.classList.add('diagram-visible-text');
      entry.para._pair = entry;
      observer.observe(entry.para);
    }
  }

  // ---------------------------------------------------------------------------
  // Process a single SVG
  // ---------------------------------------------------------------------------

  function processSvg(svg) {
    if (svg._diagramProcessed) return;
    svg._diagramProcessed = true;

    enableHover(svg);
    enableFlowArrows(svg);
    enableStepMode(svg);
    enableZoom(svg);
    enableTextSync(svg);
  }

  // ---------------------------------------------------------------------------
  // MutationObserver – watch for SVGs being injected
  // ---------------------------------------------------------------------------

  function initObserver() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          var nodes = mutation.addedNodes;
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.nodeType === 1) {
              if (node.tagName && node.tagName.toLowerCase() === 'svg') {
                processSvg(node);
              }
              var svgs = node.querySelectorAll ? node.querySelectorAll('svg') : [];
              for (var j = 0; j < svgs.length; j++) {
                processSvg(svgs[j]);
              }
            }
          }
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
  }

  // ---------------------------------------------------------------------------
  // Bootstrap
  // ---------------------------------------------------------------------------

  function init() {
    injectStyles();

    // process existing SVGs
    var existing = document.querySelectorAll('svg');
    for (var i = 0; i < existing.length; i++) {
      processSvg(existing[i]);
    }

    initObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual re-init by SPA
  window.DiagramInteract = { init: init };

})();
