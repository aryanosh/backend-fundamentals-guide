const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, 'chapters');
const outputPath = path.join(__dirname, 'js', 'content.js');

const GROUP_MAP = {
  1: 'foundation', 2: 'foundation', 3: 'foundation', 4: 'foundation',
  5: 'core', 6: 'core', 7: 'core', 8: 'core',
  9: 'scale', 10: 'scale', 11: 'scale', 12: 'scale',
  13: 'devops', 14: 'devops', 15: 'devops', 16: 'devops',
  17: 'roadmap'
};

function extractChapter(filePath, num) {
  const html = fs.readFileSync(filePath, 'utf-8');

  // Chapter title + subtitle
  const titleMatch = html.match(/<h1>(.*?)<\/h1>/);
  const subtitleMatch = html.match(/<p class="subtitle">(.*?)<\/p>/);

  const title = titleMatch ? titleMatch[1] : `Chapter ${num}`;
  const subtitle = subtitleMatch ? subtitleMatch[1] : '';

  // Extract sections
  const sections = [];
  const sectionRegex = /<section class="topic-section">(.*?)<\/section>/gs;
  let secMatch;

  while ((secMatch = sectionRegex.exec(html)) !== null) {
    const secHtml = secMatch[1];

    // Section title
    const h2Match = secHtml.match(/<h2>(.*?)<\/h2>/);
    const secTitle = h2Match ? h2Match[1] : '';

    // Text content (innerHTML of .topic-text)
    const textMatch = secHtml.match(/<div class="topic-text">(.*?)<\/div>\s*<div class="topic-diagram"/s);
    // Try without diagram
    const textMatch2 = secHtml.match(/<div class="topic-text">(.*?)<\/div>/s);
    let text = '';
    if (textMatch) {
      text = textMatch[1].trim();
    } else if (textMatch2) {
      text = textMatch2[1].trim();
    }

    // SVG diagram
    const svgMatch = secHtml.match(/<svg[\s\S]*?<\/svg>/);
    let svgString = '';
    let caption = '';
    if (svgMatch) {
      svgString = svgMatch[0];
      // Caption
      const capMatch = secHtml.match(/<div class="cap">(.*?)<\/div>/);
      if (capMatch) caption = capMatch[1].trim();
    }

    sections.push({
      title: secTitle,
      text: text,
      diagram: svgString || null,
      caption: caption || null
    });
  }

  return { title, subtitle, sections };
}

// Build content array
const chapters = [];
for (let i = 1; i <= 17; i++) {
  const filePath = path.join(chaptersDir, `ch-${String(i).padStart(2, '0')}.html`);
  if (!fs.existsSync(filePath)) {
    console.log(`Warning: ${filePath} not found`);
    continue;
  }
  const ch = extractChapter(filePath, i);
  chapters.push({
    id: i,
    title: ch.title,
    subtitle: ch.subtitle,
    group: GROUP_MAP[i] || 'foundation',
    narrativePrev: null,
    narrativeNext: i < 17 ? `Continue to Chapter ${i + 1}` : null,
    sections: ch.sections
  });
}

// Write output
const output = 'window.CHAPTERS = ' + JSON.stringify(chapters, null, 2) + ';';
fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`Extracted ${chapters.length} chapters with ${chapters.reduce((a,c) => a + c.sections.length, 0)} sections to ${outputPath}`);
