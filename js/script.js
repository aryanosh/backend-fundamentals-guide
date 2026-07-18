(function(){
  'use strict';

  /* ---- Theme toggle ---- */
  var toggle = document.getElementById('themeToggle');
  var icon = toggle && toggle.querySelector('.icon');

  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if(icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function getPreferredTheme(){
    var stored = localStorage.getItem('theme');
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

  /* Listen for system theme changes */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
    if(!localStorage.getItem('theme')){
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ---- SVG marker fix for dark mode ---- */
  function fixMarkerColors(){
    document.querySelectorAll('marker').forEach(function(m){
      var path = m.querySelector('path');
      if(path){
        var color = getComputedStyle(document.documentElement)
          .getPropertyValue('--border-strong').trim();
        path.setAttribute('fill', color || '#5A5870');
      }
    });
  }
  if(document.querySelector('svg')) fixMarkerColors();

  /* ---- Copy code blocks ---- */
  document.querySelectorAll('.code-block .cb-copy').forEach(function(btn){
    btn.addEventListener('click', function(){
      var pre = btn.closest('.code-block').querySelector('pre');
      if(pre){
        navigator.clipboard.writeText(pre.textContent);
        btn.textContent = 'Copied!';
        setTimeout(function(){ btn.textContent = 'Copy'; }, 2000);
      }
    });
  });

})();
