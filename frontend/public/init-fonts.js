// Activate Google Fonts: flip the preload link to a real stylesheet.
// Runs with defer so the DOM is parsed but we target by id to avoid
// accidentally matching other preload links (e.g. LCP image preload).
var l = document.getElementById('gfonts-preload');
if (l) { l.rel = 'stylesheet'; }
