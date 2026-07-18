(function(){
  'use strict';

  var toggle = document.getElementById('themeToggle');
  var icon = toggle && toggle.querySelector('.icon');

  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bfg-theme', theme);
    if(icon) icon.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
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
})();
