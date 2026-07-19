(function () {
'use strict';

// ===== Icon path data (24x24 viewBox, currentColor) =====
var I = {};
I.server = '<rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
I.database = '<ellipse cx="12" cy="6" rx="8" ry="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" fill="none" stroke="currentColor" stroke-width="1.8"/><ellipse cx="12" cy="18" rx="8" ry="3" fill="none" stroke="currentColor" stroke-width="1.8"/>';
I.browser = '<rect x="2" y="3" width="20" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="2" y1="8" x2="22" y2="8" stroke="currentColor" stroke-width="1.8"/><circle cx="6" cy="5.5" r="1" fill="currentColor"/><circle cx="9" cy="5.5" r="1" fill="currentColor"/><circle cx="12" cy="5.5" r="1" fill="currentColor"/>';
I.cloud = '<path d="M17.5 17.5a4.5 4.5 0 1 0-4.4-5.8A5.5 5.5 0 1 0 7 18.5h10.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>';
I.user = '<circle cx="12" cy="8" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 21c0-4.5 4-7 9-7s9 2.5 9 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
I.lock = '<rect x="7" y="11" width="10" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="15" r="1.5" fill="currentColor"/>';
I.gear = '<path d="M12 2l1.5 3.5c.4.1.9.3 1.3.5l3.5-1.5 1.5 3.5-3 2.5c.1.5.1 1 0 1.5l3 2.5-1.5 3.5-3.5-1.5c-.4.2-.9.4-1.3.5L12 22l-1.5-3.5a7.3 7.3 0 0 1-1.3-.5l-3.5 1.5-1.5-3.5 3-2.5a7 7 0 0 1 0-1.5l-3-2.5L5.7 5.5l3.5 1.5c.4-.2.8-.4 1.3-.5L12 2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/>';
I.code = '<polyline points="7 8 3 12 7 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 8 21 12 17 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';

// ===== Helpers =====
function uid() {
  return 'dg-' + Math.random().toString(36).substr(2, 9);
}

function tag(name, attrs, kids) {
  var a = '';
  if (attrs) {
    for (var k in attrs) {
      if (attrs.hasOwnProperty(k)) {
        var v = attrs[k];
        if (v === true) { a += ' ' + k; }
        else if (v !== null && v !== undefined && v !== false) {
          a += ' ' + k + '="' + String(v).replace(/"/g, '&quot;') + '"';
        }
      }
    }
  }
  var inner = Array.isArray(kids) ? kids.join('') : (kids || '');
  return '<' + name + a + '>' + inner + '</' + name + '>';
}

function textLines(text, max) {
  if (!text) return [''];
  if (text.length <= max) return [text];
  var lines = [], words = text.split(' '), line = '';
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    var test = line ? line + ' ' + w : w;
    if (test.length <= max) { line = test; }
    else { if (line) lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

function defs(id) {
  return tag('defs', {}, [
    tag('marker', {id:'arrow-'+id, viewBox:'0 0 10 10', refX:'9', refY:'5', markerWidth:'7', markerHeight:'7', orient:'auto'}, [
      tag('path', {d:'M0 0l10 5-10 5z', fill:'var(--dg-line)'})
    ]),
    tag('marker', {id:'arrfill-'+id, viewBox:'0 0 10 10', refX:'9', refY:'5', markerWidth:'7', markerHeight:'7', orient:'auto'}, [
      tag('path', {d:'M0 0l10 5-10 5z', fill:'var(--dg-1)'})
    ]),
    tag('marker', {id:'dot-'+id, viewBox:'0 0 10 10', refX:'5', refY:'5', markerWidth:'6', markerHeight:'6', orient:'auto'}, [
      tag('circle', {cx:'5', cy:'5', r:'3', fill:'var(--dg-line)'})
    ])
  ]);
}

function color(name) {
  if (!name) return 'var(--dg-1)';
  if (name.charAt(0) === '#') return name;
  var m = {cyan:'var(--dg-1)', purple:'var(--dg-2)', green:'var(--dg-3)', amber:'var(--dg-4)', red:'var(--dg-5)'};
  return m[name] || name;
}

function dim(name) {
  if (!name) return 'var(--cyan-dim)';
  if (name.charAt(0) === '#') return name + '33';
  var m = {cyan:'var(--cyan-dim)', amber:'var(--amber-dim)', green:'var(--green-dim)', red:'var(--red-dim)', indigo:'var(--indigo-dim)', purple:'var(--indigo-dim)'};
  return m[name] || name;
}

function renderIcon(name, tx, ty, c) {
  if (!name || !I[name]) return '';
  return tag('g', {transform:'translate('+tx+','+ty+')', color:c||'var(--dg-text)'}, [I[name]]);
}

function wrapSvg(els, defsStr, W, H) {
  return tag('svg', {
    xmlns:'http://www.w3.org/2000/svg',
    viewBox:'0 0 '+W+' '+H,
    width:W, height:H,
    style:'font-family:system-ui,-apple-system,sans-serif;background:transparent;color-scheme:light dark'
  }, [defsStr].concat(els));
}

// ============================================================
// 1. illustratedFlow
// ============================================================
function illustratedFlow(steps, arrows, opts) {
  opts = opts || {};
  arrows = arrows || [];
  var W = opts.width || 720;
  var pad = opts.padding || 40;
  var nw = opts.nodeWidth || 110;
  var nh = opts.nodeHeight || 68;
  var gap = opts.gap || 28;
  var n = steps.length;

  var ttlH = opts.title ? 40 : 0;
  var topY = pad + ttlH;
  var totalW = n * nw + (n - 1) * gap;
  var startX = Math.max(pad, (W - totalW) / 2);

  var ann = opts.annotations || [];
  var annRows = [];
  for (var i = 0; i < ann.length; i++) {
    var a = ann[i];
    var tIdx = a.target !== undefined ? a.target : i;
    var lines = textLines(a.text || '', 28);
    annRows.push({target:tIdx, lines:lines, color:a.color||'cyan', text:a.text});
  }
  var annH = 0;
  if (annRows.length) {
    annH = annRows.length * 34 + 6;
  }

  var sumH = opts.summary ? 46 : 0;
  var botPad = 24;
  var H = topY + nh + annH + sumH + botPad;

  var uid$ = uid();
  var d = defs(uid$);
  var els = [];

  // title
  if (opts.title) {
    els.push(tag('text', {x:W/2, y:pad+22, 'text-anchor':'middle', fill:'var(--dg-text)', 'font-size':'18', 'font-weight':'700'}, [opts.title]));
  }

  // arrows
  for (var i = 0; i < arrows.length; i++) {
    var ar = arrows[i];
    var fx = startX + ar.from * (nw + gap) + nw;
    var fy = topY + nh / 2;
    var tx = startX + ar.to * (nw + gap);
    var ty = topY + nh / 2;
    var midX = (fx + tx) / 2;

    els.push(tag('line', {x1:fx, y1:fy, x2:tx, y2:ty, stroke:'var(--dg-line)', 'stroke-width':'1.8', 'marker-end':'url(#arrow-'+uid$+')'}));
    if (ar.label) {
      els.push(tag('text', {x:midX, y:fy-12, 'text-anchor':'middle', fill:'var(--dg-text-dim)', 'font-size':'10', 'font-style':'italic'}, [ar.label]));
    }
  }

  // nodes
  for (var i = 0; i < n; i++) {
    var s = steps[i];
    var x = startX + i * (nw + gap);
    var y = topY;
    var c = color(s.color || 'cyan');
    var dm = dim(s.color || 'cyan');

    els.push(tag('rect', {x:x, y:y, width:nw, height:nh, rx:'8', fill:dm, stroke:c, 'stroke-width':'1.5'}));

    // badge
    var bx = x + nw - 13, by = y + 11;
    els.push(tag('circle', {cx:bx, cy:by, r:'9', fill:c}));
    els.push(tag('text', {x:bx, y:by+4, 'text-anchor':'middle', fill:'#fff', 'font-size':'10', 'font-weight':'700'}, [String(i+1)]));

    // icon
    if (s.icon && I[s.icon]) {
      els.push(renderIcon(s.icon, x + nw/2 - 12, y + 10, c));
    }

    // label
    var lY = y + (s.icon ? 48 : nh/2 + 5);
    var lbl = textLines(s.label, 12);
    for (var li = 0; li < lbl.length; li++) {
      els.push(tag('text', {x:x+nw/2, y:lY+li*13, 'text-anchor':'middle', fill:'var(--dg-text)', 'font-size':'11', 'font-weight':'500'}, [lbl[li]]));
    }
  }

  // annotations
  if (annRows.length) {
    var ay = topY + nh + 8;
    for (var i = 0; i < annRows.length; i++) {
      var r = annRows[i];
      var ax = startX + r.target * (nw + gap) + nw/2;
      var ac = color(r.color);
      var lns = r.lines;
      var bh = Math.max(22, lns.length * 15 + 8);

      els.push(tag('circle', {cx:ax, cy:topY+nh, r:'3', fill:ac}));
      els.push(tag('line', {x1:ax, y1:topY+nh, x2:ax, y2:ay+bh/2, stroke:ac, 'stroke-width':'1.2', 'stroke-dasharray':'3,3'}));
      els.push(tag('rect', {x:ax-90, y:ay, width:180, height:bh, rx:'5', fill:'var(--dg-node)', stroke:'var(--dg-line)', 'stroke-width':'0.8'}));
      for (var li = 0; li < lns.length; li++) {
        els.push(tag('text', {x:ax, y:ay+15+li*15, 'text-anchor':'middle', fill:'var(--dg-text-dim)', 'font-size':'10', 'font-style':'italic'}, [lns[li]]));
      }
      ay += bh + 6;
    }
  }

  // summary bar
  if (opts.summary) {
    var sumY = topY + nh + annH + 10;
    var gid = 'grad-'+uid$;
    var sc1 = color(steps[0] ? steps[0].color : 'cyan');
    var sc2 = color(steps[n-1] ? steps[n-1].color : 'purple');
    d += tag('linearGradient', {id:gid, x1:'0', y1:'0', x2:'1', y2:'0'}, [
      tag('stop', {offset:'0%', 'stop-color':sc1}),
      tag('stop', {offset:'100%', 'stop-color':sc2})
    ]);
    els.push(tag('rect', {x:pad, y:sumY, width:W-2*pad, height:36, rx:'6', fill:'url(#'+gid+')'}));
    els.push(tag('text', {x:W/2, y:sumY+23, 'text-anchor':'middle', fill:'#fff', 'font-size':'13', 'font-weight':'600'}, [opts.summary]));
  }

  return wrapSvg(els, d, W, H);
}

// ============================================================
// 2. infographic
// ============================================================
function infographic(sections, opts) {
  opts = opts || {};
  sections = sections || [];
  var W = opts.width || 720;
  var pad = opts.padding || 30;
  var cols = opts.columns || Math.min(sections.length, 3);
  var colGap = 16;
  var rowGap = 16;

  var ttlH = opts.title ? 60 : 0;
  var zoneW = (W - 2*pad - (cols-1)*colGap) / cols;
  var zoneH = 170;
  var rows = Math.ceil(sections.length / cols);
  var contentH = rows * zoneH + (rows - 1) * rowGap;
  var sumH = opts.summary ? 80 : 0;
  var H = pad + ttlH + 16 + contentH + sumH + pad;

  var uid$ = uid();
  var d = defs(uid$);
  var els = [];

  // title bar
  if (opts.title) {
    var ty = pad;
    els.push(tag('rect', {x:0, y:ty, width:W, height:ttlH-4, fill:'var(--dg-1)', opacity:'0.08'}));
    els.push(tag('text', {x:W/2, y:ty+ttlH/2+4, 'text-anchor':'middle', fill:'var(--dg-text)', 'font-size':'20', 'font-weight':'700'}, [opts.title]));
  }

  var zoneTop = pad + ttlH + 12;

  // zones
  for (var i = 0; i < sections.length; i++) {
    var sec = sections[i];
    var col = i % cols;
    var row = Math.floor(i / cols);
    var zx = pad + col * (zoneW + colGap);
    var zy = zoneTop + row * (zoneH + rowGap);
    var c = color(sec.color || 'cyan');
    var dm = dim(sec.color || 'cyan');

    // bg
    els.push(tag('rect', {x:zx, y:zy, width:zoneW, height:zoneH, rx:'8', fill:dm, stroke:c, 'stroke-width':'1', 'stroke-opacity':'0.6'}));

    // icon circle
    var icX = zx + 22, icY = zy + 22;
    els.push(tag('circle', {cx:icX, cy:icY, r:'18', fill:c}));
    if (sec.icon && I[sec.icon]) {
      els.push(tag('g', {transform:'translate('+(icX-12)+','+(icY-12)+')', color:'#fff'}, [I[sec.icon]]));
    }

    // heading
    els.push(tag('text', {x:zx+48, y:zy+20, fill:'var(--dg-text)', 'font-size':'14', 'font-weight':'700'}, [sec.heading||'']));
    els.push(tag('line', {x1:zx+48, y1:zy+26, x2:zx+zoneW-10, y2:zy+26, stroke:c, 'stroke-width':'1.5', 'stroke-opacity':'0.5'}));

    // bullets
    if (sec.bullets) {
      for (var b = 0; b < sec.bullets.length && b < 5; b++) {
        var bx = zx + 14, by = zy + 42 + b * 23;
        els.push(tag('circle', {cx:bx+4, cy:by-6, r:'3', fill:c}));
        var bt = textLines(sec.bullets[b], Math.floor(zoneW / 6.5));
        els.push(tag('text', {x:bx+16, y:by, fill:'var(--dg-text)', 'font-size':'11'}, [bt[0]]));
        if (bt.length > 1) {
          els.push(tag('text', {x:bx+16, y:by+13, fill:'var(--dg-text-dim)', 'font-size':'10'}, [bt[1]]));
        }
      }
    }

    // optional mini diagram (compact bar)
    if (sec.diagram && sec.diagram.type === 'bar') {
      var barX = zx + 14, barY = zy + zoneH - 30, barW = zoneW - 28, barH = 14;
      els.push(tag('rect', {x:barX, y:barY, width:barW, height:barH, rx:'4', fill:'var(--dg-node)', stroke:'var(--dg-line)', 'stroke-width':'0.5'}));
      var pct = Math.min(100, Math.max(0, sec.diagram.value || 0));
      var fillW = barW * pct / 100;
      if (fillW > 0) {
        els.push(tag('rect', {x:barX, y:barY, width:fillW, height:barH, rx:'4', fill:c, opacity:'0.8'}));
      }
      els.push(tag('text', {x:barX+barW/2, y:barY+barH/2+4, 'text-anchor':'middle', fill:'var(--dg-text)', 'font-size':'9', 'font-weight':'600'}, [String(Math.round(pct))+'%']));
    }
  }

  // decorative connecting paths between zones
  for (var i = 0; i < sections.length - 1; i++) {
    var col1 = i % cols, row1 = Math.floor(i / cols);
    var col2 = (i+1) % cols, row2 = Math.floor((i+1) / cols);
    var zx1 = pad + col1 * (zoneW + colGap) + zoneW;
    var zy1 = zoneTop + row1 * (zoneH + rowGap) + zoneH / 2;
    var zx2 = pad + col2 * (zoneW + colGap);
    var zy2 = zoneTop + row2 * (zoneH + rowGap) + zoneH / 2;

    if (row1 === row2) {
      // same row, left to right
      els.push(tag('path', {d:'M'+zx1+' '+zy1+' C'+(zx1+12)+' '+zy1+', '+(zx2-12)+' '+zy2+', '+zx2+' '+zy2, fill:'none', stroke:'var(--dg-line)', 'stroke-width':'1.5', 'stroke-dasharray':'4,3', opacity:'0.5', 'marker-end':'url(#arrfill-'+uid$+')'}));
    } else {
      // next row, connect from bottom of current to top of next
      var bx1 = pad + col1 * (zoneW + colGap) + zoneW / 2;
      var by1 = zoneTop + row1 * (zoneH + rowGap) + zoneH;
      var bx2 = pad + col2 * (zoneW + colGap) + zoneW / 2;
      var by2 = zoneTop + row2 * (zoneH + rowGap);
      els.push(tag('path', {d:'M'+bx1+' '+by1+' C'+bx1+' '+(by1+16)+', '+bx2+' '+(by2-16)+', '+bx2+' '+by2, fill:'none', stroke:'var(--dg-line)', 'stroke-width':'1.5', 'stroke-dasharray':'4,3', opacity:'0.5', 'marker-end':'url(#arrfill-'+uid$+')'}));
    }
  }

  // summary box
  if (opts.summary) {
    var sumY = zoneTop + contentH + 12;
    els.push(tag('rect', {x:pad+20, y:sumY, width:W-2*pad-40, height:sumH-16, rx:'8', fill:'var(--dg-node)', stroke:'var(--dg-line)', 'stroke-width':'1'}));
    els.push(tag('text', {x:W/2, y:sumY+24, 'text-anchor':'middle', fill:'var(--dg-text)', 'font-size':'13', 'font-weight':'700'}, ['Key Takeaway']));
    var sumL = textLines(opts.summary, Math.floor((W-2*pad-60)/6.5));
    for (var li = 0; li < sumL.length; li++) {
      els.push(tag('text', {x:W/2, y:sumY+46+li*16, 'text-anchor':'middle', fill:'var(--dg-text-dim)', 'font-size':'12'}, [sumL[li]]));
    }
  }

  return wrapSvg(els, d, W, H);
}

// ============================================================
// 3. comparisonIllustrated
// ============================================================
function comparisonIllustrated(left, right, opts) {
  opts = opts || {};
  left = left || {};
  right = right || {};
  var W = opts.width || 720;
  var pad = opts.padding || 30;
  var midGap = 24;
  var colW = (W - 3*pad - midGap) / 2;

  var hdrH = 48;
  var itemH = 28;
  var leftItems = left.items || [];
  var rightItems = right.items || [];
  var maxItems = Math.max(leftItems.length, rightItems.length);
  var contentH = maxItems * itemH + 12;
  var sumH = opts.summary ? 50 : 0;
  var H = pad + hdrH + contentH + sumH + pad;

  var uid$ = uid();
  var d = defs(uid$);
  var els = [];

  function drawCol(x, col, side) {
    var c = color(col.color || (side==='left'?'cyan':'purple'));
    var dm = dim(col.color || (side==='left'?'cyan':'purple'));

    // header
    els.push(tag('rect', {x:x, y:pad, width:colW, height:hdrH, rx:'6', fill:c}));
    if (col.icon && I[col.icon]) {
      els.push(tag('g', {transform:'translate('+(x+14)+','+(pad+12)+')', color:'#fff'}, [I[col.icon]]));
    }
    els.push(tag('text', {x:x+46, y:pad+hdrH/2+5, fill:'#fff', 'font-size':'15', 'font-weight':'700'}, [col.header||'']));

    // items
    var items = col.items || [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var iy = pad + hdrH + 8 + i * itemH;
      var pos = item.positive !== false;

      if (pos) {
        els.push(tag('path', {d:'M'+(x+16)+' '+(iy+14)+' l4 4 l8-8', stroke:'var(--dg-3)', 'stroke-width':'2', fill:'none', 'stroke-linecap':'round', 'stroke-linejoin':'round'}));
      } else {
        els.push(tag('path', {d:'M'+(x+14)+' '+(iy+12)+' l8 8 M'+(x+22)+' '+(iy+12)+' l-8 8', stroke:'var(--dg-5)', 'stroke-width':'2', fill:'none', 'stroke-linecap':'round'}));
      }

      var txt = item.text || String(item);
      els.push(tag('text', {x:x+36, y:iy+17, fill:'var(--dg-text)', 'font-size':'12'}, [txt]));
    }
  }

  drawCol(pad, left, 'left');
  drawCol(pad+colW+midGap, right, 'right');

  // divider
  var divX = pad + colW + midGap/2;
  els.push(tag('line', {x1:divX, y1:pad, x2:divX, y2:pad+hdrH+contentH, stroke:'var(--dg-line)', 'stroke-width':'1', 'stroke-dasharray':'4,4'}));

  // vs label
  els.push(tag('circle', {cx:divX, cy:pad+hdrH/2, r:'13', fill:'var(--dg-node)', stroke:'var(--dg-line)', 'stroke-width':'1'}));
  els.push(tag('text', {x:divX, y:pad+hdrH/2+4, 'text-anchor':'middle', fill:'var(--dg-text)', 'font-size':'10', 'font-weight':'700'}, ['VS']));

  // summary bar
  if (opts.summary) {
    var sumY = pad + hdrH + contentH + 6;
    els.push(tag('rect', {x:pad, y:sumY, width:W-2*pad, height:sumH-6, rx:'6', fill:'var(--dg-node)', stroke:'var(--dg-line)', 'stroke-width':'1'}));
    els.push(tag('text', {x:W/2, y:sumY+(sumH-6)/2+4, 'text-anchor':'middle', fill:'var(--dg-text)', 'font-size':'13', 'font-weight':'600'}, [opts.summary]));
  }

  return wrapSvg(els, d, W, H);
}

// ============================================================
// 4. steppedTimeline
// ============================================================
function steppedTimeline(steps, opts) {
  opts = opts || {};
  steps = steps || [];
  var W = opts.width || 720;
  var dir = opts.direction || 'vertical';
  var pad = opts.padding || 40;
  var circleR = 14;
  var n = steps.length;

  if (dir === 'horizontal') {
    var lineY = pad + 50;
    var cardW = 150;
    var cardH = 90;
    var spacing = n > 1 ? (W - 2*pad) / (n - 1) : 0;
    var H = lineY + circleR + 20 + cardH + pad;

    var uid$ = uid();
    var d = defs(uid$);
    var els = [];

    // timeline
    els.push(tag('line', {x1:pad, y1:lineY, x2:W-pad, y2:lineY, stroke:'var(--dg-line)', 'stroke-width':'2'}));

    for (var i = 0; i < n; i++) {
      var s = steps[i];
      var cx = n > 1 ? (pad + i * spacing) : (W / 2);
      var c = color(s.color || 'cyan');
      var isCur = opts.currentStep === i || s.status === 'current';

      // circle
      els.push(tag('circle', {cx:cx, cy:lineY, r:circleR, fill:isCur ? c : 'var(--dg-node)', stroke:c, 'stroke-width':'2.5'}));
      if (isCur) {
        els.push(tag('circle', {cx:cx, cy:lineY, r:circleR+4, fill:'none', stroke:c, 'stroke-width':'1', 'stroke-dasharray':'3,2', opacity:'0.6'}));
      }
      els.push(tag('text', {x:cx, y:lineY+5, 'text-anchor':'middle', fill:isCur?'#fff':'var(--dg-text)', 'font-size':'11', 'font-weight':'700'}, [String(i+1)]));

      // connector dash
      var cardY = lineY + circleR + 14;
      els.push(tag('line', {x1:cx, y1:lineY+circleR, x2:cx, y2:cardY, stroke:c, 'stroke-width':'1.5', 'stroke-dasharray':'3,3'}));

      // card
      var cardX = cx - cardW/2;
      els.push(tag('rect', {x:cardX, y:cardY, width:cardW, height:cardH, rx:'6', fill:'var(--dg-node)', stroke:c, 'stroke-width':'1.5'}));

      // card title
      var tLines = textLines(s.title || '', 18);
      els.push(tag('text', {x:cx, y:cardY+20, 'text-anchor':'middle', fill:'var(--dg-text)', 'font-size':'12', 'font-weight':'700'}, [tLines[0]]));

      // card desc
      var dLines = textLines(s.desc || '', 20);
      for (var li = 0; li < dLines.length && li < 3; li++) {
        els.push(tag('text', {x:cx, y:cardY+40+li*14, 'text-anchor':'middle', fill:'var(--dg-text-dim)', 'font-size':'10'}, [dLines[li]]));
      }
    }

    return wrapSvg(els, d, W, H);
  }

  // vertical timeline
  var lineX = pad + 50;
  var cardW = Math.min(460, W - lineX - 60);
  var cardH = 80;
  var stepGap = 24;
  var H = pad + n * (cardH + stepGap) + pad;

  var uid$ = uid();
  var d = defs(uid$);
  var els = [];

  // vertical line
  var lineTop = pad + 20;
  var lineBot = pad + n * (cardH + stepGap) - stepGap + 20;
  els.push(tag('line', {x1:lineX, y1:lineTop, x2:lineX, y2:lineBot, stroke:'var(--dg-line)', 'stroke-width':'2'}));

  for (var i = 0; i < n; i++) {
    var s = steps[i];
    var cy = pad + i * (cardH + stepGap) + cardH / 2 + 20;
    var c = color(s.color || 'cyan');
    var isCur = opts.currentStep === i || s.status === 'current';
    var isLeft = i % 2 === 0;
    var cardX = isLeft ? lineX + 30 : lineX - cardW - 30;

    // circle on timeline
    els.push(tag('circle', {cx:lineX, cy:cy, r:circleR, fill:isCur ? c : 'var(--dg-node)', stroke:c, 'stroke-width':'2.5'}));
    if (isCur) {
      els.push(tag('circle', {cx:lineX, cy:cy, r:circleR+4, fill:'none', stroke:c, 'stroke-width':'1', 'stroke-dasharray':'3,2', opacity:'0.6'}));
    }
    els.push(tag('text', {x:lineX, y:cy+5, 'text-anchor':'middle', fill:isCur?'#fff':'var(--dg-text)', 'font-size':'11', 'font-weight':'700'}, [String(i+1)]));

    // connector
    var connX = isLeft ? lineX + circleR : lineX - circleR;
    var connEnd = isLeft ? cardX : cardX + cardW;
    els.push(tag('line', {x1:connX, y1:cy, x2:connEnd, y2:cy, stroke:c, 'stroke-width':'1.5', 'stroke-dasharray':'3,3', 'marker-end':'url(#arrow-'+uid$+')'}));

    // card
    els.push(tag('rect', {x:cardX, y:cy-cardH/2, width:cardW, height:cardH, rx:'6', fill:'var(--dg-node)', stroke:c, 'stroke-width':'1.5'}));

    // card content
    var contentX = isLeft ? cardX + 14 : cardX + cardW - 14;
    var anchor = isLeft ? 'start' : 'end';
    var tLines = textLines(s.title || '', 30);
    els.push(tag('text', {x:contentX, y:cy-10, 'text-anchor':anchor, fill:'var(--dg-text)', 'font-size':'13', 'font-weight':'700'}, [tLines[0]]));

    var dLines = textLines(s.desc || '', 35);
    for (var li = 0; li < dLines.length && li < 2; li++) {
      els.push(tag('text', {x:contentX, y:cy+10+li*14, 'text-anchor':anchor, fill:'var(--dg-text-dim)', 'font-size':'11'}, [dLines[li]]));
    }
  }

  return wrapSvg(els, d, W, H);
}

// ============================================================
// 5. annotatedDiagram
// ============================================================
function annotatedDiagram(baseElements, annotations, opts) {
  opts = opts || {};
  baseElements = baseElements || [];
  annotations = annotations || [];
  var W = opts.width || 720;
  var H = opts.height || 400;
  var uid$ = uid();
  var d = defs(uid$);
  var els = [];

  // base elements
  for (var i = 0; i < baseElements.length; i++) {
    var el = baseElements[i];
    var c = color(el.color || 'cyan');
    var dm = dim(el.color || 'cyan');
    var x = el.x || 0, y = el.y || 0, w = el.w || 80, h = el.h || 50;
    var type = el.type || 'box';

    if (type === 'circle' || type === 'ellipse') {
      els.push(tag('ellipse', {cx:x+w/2, cy:y+h/2, rx:w/2, ry:h/2, fill:dm, stroke:c, 'stroke-width':'1.5'}));
    } else if (type === 'cylinder') {
      var ryCyl = Math.min(12, h/4);
      els.push(tag('ellipse', {cx:x+w/2, cy:y+ryCyl, rx:w/2, ry:ryCyl, fill:dm, stroke:c, 'stroke-width':'1.5'}));
      els.push(tag('path', {d:'M'+x+' '+(y+ryCyl)+' L'+x+' '+(y+h-ryCyl)+' A'+(w/2)+' '+ryCyl+' 0 0 0 '+(x+w)+' '+(y+h-ryCyl)+' L'+(x+w)+' '+(y+ryCyl), fill:'none', stroke:c, 'stroke-width':'1.5'}));
    } else {
      els.push(tag('rect', {x:x, y:y, width:w, height:h, rx:'6', fill:dm, stroke:c, 'stroke-width':'1.5'}));
    }

    // label
    if (el.label) {
      els.push(tag('text', {x:x+w/2, y:y+h/2+4, 'text-anchor':'middle', fill:'var(--dg-text)', 'font-size':'12', 'font-weight':'600'}, [el.label]));
    }

    // icon inside element
    if (el.icon && I[el.icon]) {
      els.push(tag('g', {transform:'translate('+(x+w/2-12)+','+(y+10)+')', color:c}, [I[el.icon]]));
    }
  }

  // annotations
  for (var i = 0; i < annotations.length; i++) {
    var ann = annotations[i];
    var target = baseElements[ann.targetIndex];
    if (!target) continue;

    var ac = color(ann.color || 'cyan');
    var side = ann.side || 'top';
    var cx = target.x + target.w / 2;
    var cy = target.y + target.h / 2;
    var txt = ann.text || '';

    // callout dimensions
    var cw = 170, ch = 36;
    var lines = textLines(txt, 22);
    ch = Math.max(30, lines.length * 16 + 10);

    var cax, cay;
    var lx1, ly1, lx2, ly2;

    if (side === 'top') {
      cax = cx - cw / 2; cay = target.y - ch - 18;
      lx1 = cx; ly1 = target.y;
      lx2 = cx; ly2 = cay + ch;
    } else if (side === 'bottom') {
      cax = cx - cw / 2; cay = target.y + target.h + 18;
      lx1 = cx; ly1 = target.y + target.h;
      lx2 = cx; ly2 = cay;
    } else if (side === 'left') {
      cax = target.x - cw - 16; cay = cy - ch / 2;
      lx1 = target.x; ly1 = cy;
      lx2 = cax + cw; ly2 = cy;
    } else {
      cax = target.x + target.w + 16; cay = cy - ch / 2;
      lx1 = target.x + target.w; ly1 = cy;
      lx2 = cax; ly2 = cy;
    }

    // clamp callout inside view
    cax = Math.max(10, Math.min(cax, W - cw - 10));
    cay = Math.max(10, Math.min(cay, H - ch - 10));

    // dot on target
    els.push(tag('circle', {cx:lx1, cy:ly1, r:'3.5', fill:ac}));
    // line
    els.push(tag('line', {x1:lx1, y1:ly1, x2:lx2, y2:ly2, stroke:ac, 'stroke-width':'1.5', 'stroke-dasharray':'3,3'}));

    // callout rect
    els.push(tag('rect', {x:cax, y:cay, width:cw, height:ch, rx:'7', fill:'var(--dg-node)', stroke:ac, 'stroke-width':'1.5'}));
    // small connector dot at line endpoint
    els.push(tag('circle', {cx:lx2, cy:ly2, r:'3', fill:ac}));

    // text
    for (var li = 0; li < lines.length; li++) {
      els.push(tag('text', {x:cax+cw/2, y:cay+ch/2+(li-(lines.length-1)/2)*15, 'text-anchor':'middle', fill:'var(--dg-text)', 'font-size':'11'}, [lines[li]]));
    }
  }

  return wrapSvg(els, d, W, H);
}

// ===== Public API =====
window.diagram = {
  illustratedFlow: illustratedFlow,
  infographic: infographic,
  comparisonIllustrated: comparisonIllustrated,
  steppedTimeline: steppedTimeline,
  annotatedDiagram: annotatedDiagram
};

})();
