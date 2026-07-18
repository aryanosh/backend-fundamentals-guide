(function(){
  'use strict';

  var toggle = document.getElementById('themeToggle');
  var icon = toggle && toggle.querySelector('.icon');

  function getComputedCSSVar(name){
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function fixSVGFills(theme){
    // Fix hardcoded fill colors in SVG diagrams based on theme
    var svgTexts = document.querySelectorAll('.chapter-visual text[fill]');
    var svgShapes = document.querySelectorAll('.chapter-visual rect[fill], .chapter-visual polygon[fill]');

    if(theme === 'light'){
      svgTexts.forEach(function(el){
        var f = el.getAttribute('fill').toLowerCase();
        if(f === '#fff' || f === '#ffffff') el.setAttribute('fill', '#EAE8E0');
        else if(f === '#888' || f === '#888888') el.setAttribute('fill', '#9B97A8');
        else if(f === '#333' || f === '#222') el.setAttribute('fill', '#EAE8E0');
        else if(f === '#1a1a2e') el.setAttribute('fill', '#EAE8E0');
      });
      svgShapes.forEach(function(el){
        var f = el.getAttribute('fill').toLowerCase();
        if(f === '#888' || f === '#888888') el.setAttribute('fill', '#9B97A8');
      });
    } else {
      svgTexts.forEach(function(el){
        var f = el.getAttribute('fill').toLowerCase();
        if(f === '#eae8e0' && el.closest('.chapter-visual')) el.setAttribute('fill', '#fff');
        else if(f === '#9b97a8') el.setAttribute('fill', '#888');
      });
      svgShapes.forEach(function(el){
        var f = el.getAttribute('fill').toLowerCase();
        if(f === '#9b97a8') el.setAttribute('fill', '#888');
      });
    }
  }

  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bfg-theme', theme);
    if(icon) icon.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
    fixSVGFills(theme);
  }

  function getPreferredTheme(){
    var stored = localStorage.getItem('bfg-theme');
    if(stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  if(toggle){
    setTheme(getPreferredTheme());
    toggle.addEventListener('click', function(){
      var current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
    if(!localStorage.getItem('bfg-theme')){
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Fix markers on load
  function fixMarkers(){
    document.querySelectorAll('marker path').forEach(function(p){
      var computedColor = getComputedCSSVar('--border-strong') || '#5A5870';
      p.setAttribute('fill', computedColor);
    });
  }
  if(document.querySelector('svg')) fixMarkers();
  document.addEventListener('DOMContentLoaded', fixMarkers);

})();
