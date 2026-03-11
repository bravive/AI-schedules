#!/usr/bin/env node

/**
 * HTML Content Validation Tests
 *
 * Validates that all generated HTML pages and the homepage contain
 * required structure, links, and content. Run before every push.
 *
 * Usage: node tests/validate-html.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32mPASS\x1b[0m ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.log(`  \x1b[31mFAIL\x1b[0m ${message}`);
  }
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf-8');
}

function countOccurrences(html, pattern) {
  const regex = typeof pattern === 'string' ? new RegExp(escapeRegex(pattern), 'g') : pattern;
  return (html.match(regex) || []).length;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Test: Required files exist ───────────────────────────────────────────────

console.log('\n\x1b[1m[File Structure]\x1b[0m');

const requiredFiles = [
  'index.html',
  'shared/css/style.css',
  'tasks/ai-learning-engineer/prompt.md',
  'tasks/ai-learning-engineer/progress.json',
  'tasks/stock-trader/prompt.md',
  'tasks/market-news/prompt.md',
  'scripts/generate-ai-learning.sh',
  'scripts/generate-stock-trader.sh',
  'scripts/generate-market-news.sh',
  'scripts/update-manifest.sh',
  '.github/workflows/daily-briefing.yml',
  'output/manifest.json',
];

for (const f of requiredFiles) {
  assert(fileExists(f), `${f} exists`);
}

// ─── Test: Shared CSS has required icon classes ───────────────────────────────

console.log('\n\x1b[1m[Shared CSS]\x1b[0m');

const css = readFile('shared/css/style.css');
const requiredCssClasses = [
  '.card__icon--ai',
  '.card__icon--stock',
  '.card__icon--news',
  '.content-item',
  '.section-title',
  '.stock-table',
  '.nav-back',
  '.site-header',
  '.site-footer',
  '.disclaimer',
];

for (const cls of requiredCssClasses) {
  assert(css.includes(cls), `CSS contains ${cls}`);
}

// ─── Test: index.html (Homepage / Dashboard) ─────────────────────────────────

console.log('\n\x1b[1m[Homepage: index.html]\x1b[0m');

const index = readFile('index.html');

// Basic HTML structure
assert(index.includes('<!DOCTYPE html>'), 'Has DOCTYPE');
assert(index.includes('<html lang="en">'), 'Has html lang');
assert(index.includes('shared/css/style.css'), 'Links shared CSS');

// Sidebar structure - all 3 task groups
assert(index.includes('id="entries-ai-learning-engineer"'), 'Sidebar has AI Learning entries container');
assert(index.includes('id="entries-stock-trader"'), 'Sidebar has Stock Trader entries container');
assert(index.includes('id="entries-market-news"'), 'Sidebar has Market News entries container');

// Sidebar icons for all 3 tasks
assert(index.includes('sidebar__task-icon--ai'), 'Sidebar has AI icon');
assert(index.includes('sidebar__task-icon--stock'), 'Sidebar has Stock icon');
assert(index.includes('sidebar__task-icon--news'), 'Sidebar has News icon');

// Dashboard cards - all 3 tasks
const dashCardCount = countOccurrences(index, /class="dash-card"/g);
assert(dashCardCount === 3, `Dashboard has exactly 3 task cards (found ${dashCardCount})`);
assert(index.includes('AI Learning Engineer'), 'Dashboard has AI Learning card title');
assert(index.includes('Stock Trader'), 'Dashboard has Stock Trader card title');
assert(index.includes('Market-Moving News'), 'Dashboard has Market News card title');

// Dashboard card bullet points
assert(index.includes('id="summary-ai-learning-engineer"'), 'AI Learning card has bullet list');
assert(index.includes('id="summary-stock-trader"'), 'Stock Trader card has bullet list');
assert(index.includes('id="summary-market-news"'), 'Market News card has bullet list');

// AI Learning card - YouTube link
assert(index.includes('youtube.com/watch'), 'AI Learning card has YouTube link');
assert(index.includes('Andrej Karpathy'), 'AI Learning card shows channel name');

// Dashboard bullets have content (not empty)
const aiBullets = (index.match(/id="summary-ai-learning-engineer"[\s\S]*?<\/ul>/)?.[0] || '').match(/<li>/g);
assert(aiBullets && aiBullets.length >= 3, 'AI Learning card has at least 3 bullet points');

const stockBullets = (index.match(/id="summary-stock-trader"[\s\S]*?<\/ul>/)?.[0] || '').match(/<li>/g);
assert(stockBullets && stockBullets.length >= 3, 'Stock Trader card has at least 3 bullet points');

const newsBullets = (index.match(/id="summary-market-news"[\s\S]*?<\/ul>/)?.[0] || '').match(/<li>/g);
assert(newsBullets && newsBullets.length >= 3, 'Market News card has at least 3 bullet points');

// JavaScript functions
assert(index.includes('function showDashboard'), 'Has showDashboard function');
assert(index.includes('function loadEntry'), 'Has loadEntry function');
assert(index.includes('function openTask'), 'Has openTask function');
assert(index.includes("fetch('output/manifest.json')"), 'Fetches manifest.json');

// iframe for content
assert(index.includes('id="content-frame"'), 'Has content iframe');

// iframe nav-back interception (prevents nested sidebar bug)
assert(index.includes('content-frame') && index.includes("addEventListener('load'"), 'Has iframe load event listener for nav-back interception');
assert(index.includes('contentDocument'), 'Iframe handler accesses contentDocument');
assert(index.includes("querySelector('.nav-back')") || index.includes('querySelector(\'.nav-back\')'), 'Iframe handler finds nav-back links');
assert(index.includes('preventDefault'), 'Iframe handler prevents default nav-back navigation');

// ─── Test: Output pages - common structure ────────────────────────────────────

const taskPages = [
  { name: 'AI Learning Engineer', dir: 'ai-learning-engineer' },
  { name: 'Stock Trader', dir: 'stock-trader' },
  { name: 'Market-Moving News', dir: 'market-news' },
];

for (const task of taskPages) {
  // Find any .html files in output dir (skip latest.html, test dated files)
  const outputDir = path.join(ROOT, 'output', task.dir);
  if (!fs.existsSync(outputDir)) {
    assert(false, `Output directory exists: output/${task.dir}/`);
    continue;
  }

  const htmlFiles = fs.readdirSync(outputDir).filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.html$/));
  assert(htmlFiles.length > 0, `${task.name}: has at least one dated output file`);

  // Also check latest.html exists
  assert(fs.existsSync(path.join(outputDir, 'latest.html')), `${task.name}: latest.html exists`);

  for (const file of htmlFiles) {
    const filePath = `output/${task.dir}/${file}`;
    const html = readFile(filePath);

    console.log(`\n\x1b[1m[${task.name}: ${file}]\x1b[0m`);

    // Basic HTML structure
    assert(html.includes('<!DOCTYPE html>'), `${file}: has DOCTYPE`);
    assert(html.includes('<html lang="en">'), `${file}: has html lang`);
    assert(html.includes('<meta charset="UTF-8">'), `${file}: has charset`);
    assert(html.includes('<meta name="viewport"'), `${file}: has viewport meta`);

    // Shared CSS link
    assert(html.includes('shared/css/style.css'), `${file}: links shared CSS`);
    assert(html.includes('fonts.googleapis.com'), `${file}: loads Google Fonts`);

    // Navigation
    assert(html.includes('nav-back'), `${file}: has back navigation`);
    assert(html.includes('index.html'), `${file}: links back to dashboard`);

    // Header
    assert(html.includes('site-header'), `${file}: has site header`);
    assert(html.includes('site-header__title'), `${file}: has header title`);
    assert(html.includes('site-header__date'), `${file}: has header date`);

    // Footer
    assert(html.includes('site-footer'), `${file}: has site footer`);

    // Content sections exist (at least one section-title or content-item)
    const hasSections = html.includes('section-title') || html.includes('content-item');
    assert(hasSections, `${file}: has content sections`);

    // Date in the file matches filename
    const dateFromFile = file.replace('.html', '');
    assert(html.includes(dateFromFile), `${file}: content includes matching date`);

    // No empty body
    const bodyContent = html.match(/<body>([\s\S]*)<\/body>/)?.[1] || '';
    assert(bodyContent.trim().length > 200, `${file}: body has substantial content (${bodyContent.trim().length} chars)`);

    // Tags are properly closed (basic check for common unclosed tags)
    const openDivs = countOccurrences(html, /<div[\s>]/g);
    const closeDivs = countOccurrences(html, /<\/div>/g);
    assert(openDivs === closeDivs, `${file}: div tags balanced (${openDivs} open, ${closeDivs} close)`);

    const openSections = countOccurrences(html, /<section[\s>]/g);
    const closeSections = countOccurrences(html, /<\/section>/g);
    assert(openSections === closeSections, `${file}: section tags balanced (${openSections} open, ${closeSections} close)`);
  }
}

// ─── Test: AI Learning page-specific content ──────────────────────────────────

console.log('\n\x1b[1m[AI Learning: Content-specific]\x1b[0m');

const aiOutputDir = path.join(ROOT, 'output', 'ai-learning-engineer');
const aiFiles = fs.readdirSync(aiOutputDir).filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.html$/));

for (const file of aiFiles) {
  const html = readFile(`output/ai-learning-engineer/${file}`);

  // YouTube video link
  assert(html.includes('youtube.com/watch'), `${file}: has YouTube video link`);
  assert(html.includes('target="_blank"'), `${file}: YouTube link opens in new tab`);

  // Session progress indicator
  assert(/Session \d+ of \d+/.test(html), `${file}: shows session progress (Session X of Y)`);

  // Key sections from the prompt
  assert(html.includes('Key Concepts') || html.includes('Key concepts'), `${file}: has Key Concepts section`);
  assert(html.includes('Practical Exercise') || html.includes('practical exercise') || html.includes('Exercise'), `${file}: has Practical Exercise section`);
  assert(html.includes('Key Takeaways') || html.includes('Takeaways'), `${file}: has Key Takeaways section`);

  // Why This Video section (for session 1)
  if (html.includes('Session 1 of')) {
    assert(html.includes('Why This Video'), `${file}: Session 1 has "Why This Video" section`);
  }

  // Session roadmap
  assert(html.includes('Session Roadmap') || html.includes('Roadmap') || html.includes("What's Next") || html.includes('What&#8217;s Next'), `${file}: has roadmap or what's next section`);
}

// ─── Test: Stock Trader page-specific content ─────────────────────────────────

console.log('\n\x1b[1m[Stock Trader: Content-specific]\x1b[0m');

const stockOutputDir = path.join(ROOT, 'output', 'stock-trader');
const stockFiles = fs.readdirSync(stockOutputDir).filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.html$/));

for (const file of stockFiles) {
  const html = readFile(`output/stock-trader/${file}`);

  // Must have stock table
  assert(html.includes('stock-table'), `${file}: has stock table`);

  // Must have stock symbols
  assert(html.includes('stock-symbol'), `${file}: has stock symbols`);

  // Must have market overview
  assert(html.includes('Market Overview') || html.includes('market overview'), `${file}: has Market Overview`);

  // Must have disclaimer
  assert(html.includes('disclaimer') || html.includes('Disclaimer'), `${file}: has disclaimer`);

  // Wide container for tables
  assert(html.includes('container--wide'), `${file}: uses wide container`);

  // Has at least some ticker mentions (capital letter sequences typical of tickers)
  const tickers = html.match(/stock-symbol/g);
  assert(tickers && tickers.length >= 5, `${file}: has at least 5 stock symbols (found ${tickers ? tickers.length : 0})`);
}

// ─── Test: Market News page-specific content ──────────────────────────────────

console.log('\n\x1b[1m[Market News: Content-specific]\x1b[0m');

const newsOutputDir = path.join(ROOT, 'output', 'market-news');
const newsFiles = fs.readdirSync(newsOutputDir).filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.html$/));

for (const file of newsFiles) {
  const html = readFile(`output/market-news/${file}`);

  // Must have market mood
  assert(html.includes('Market Mood') || html.includes('market mood'), `${file}: has Market Mood section`);

  // Must have multiple news stories (content-item cards)
  const newsItems = countOccurrences(html, /content-item mt-4/g);
  assert(newsItems >= 8, `${file}: has at least 8 news story cards (found ${newsItems})`);

  // Must have crypto corner
  assert(html.includes('Crypto Corner') || html.includes('crypto corner') || html.includes('Crypto'), `${file}: has Crypto section`);

  // Must have disclaimer
  assert(html.includes('disclaimer') || html.includes('Disclaimer'), `${file}: has disclaimer`);

  // Must have bullish/bearish indicators
  const hasSentiment = html.includes('Bullish') || html.includes('Bearish') || html.includes('Mixed');
  assert(hasSentiment, `${file}: has sentiment indicators`);

  // Wide container
  assert(html.includes('container--wide'), `${file}: uses wide container`);
}

// ─── Test: manifest.json structure ────────────────────────────────────────────

console.log('\n\x1b[1m[Manifest]\x1b[0m');

const manifest = JSON.parse(readFile('output/manifest.json'));
assert(manifest.latest !== undefined, 'Manifest has "latest" field');
assert(manifest.archive !== undefined, 'Manifest has "archive" field');
assert(Array.isArray(manifest.archive), 'Manifest archive is an array');

if (manifest.archive.length > 0) {
  const entry = manifest.archive[0];
  assert(entry.date !== undefined, 'Archive entry has date');
  assert(Array.isArray(entry.tasks), 'Archive entry has tasks array');
  assert(entry.tasks.length >= 1, 'Archive entry has at least 1 task');

  // Verify all task types are present in latest
  const taskTypes = ['ai-learning-engineer', 'stock-trader', 'market-news'];
  for (const t of taskTypes) {
    assert(manifest.latest[t] !== undefined, `Manifest latest has ${t}`);
    if (manifest.latest[t]) {
      assert(manifest.latest[t].date !== undefined, `Manifest latest.${t} has date`);
      assert(manifest.latest[t].path !== undefined, `Manifest latest.${t} has path`);
      // Verify the referenced file exists
      assert(fileExists(manifest.latest[t].path), `Manifest latest.${t} file exists: ${manifest.latest[t].path}`);
    }
  }
}

// ─── Test: progress.json structure ────────────────────────────────────────────

console.log('\n\x1b[1m[Progress Tracking]\x1b[0m');

const progress = JSON.parse(readFile('tasks/ai-learning-engineer/progress.json'));
assert(progress.current_video !== undefined, 'Progress has current_video');
assert(progress.current_video.title !== undefined, 'Current video has title');
assert(progress.current_video.url !== undefined, 'Current video has url');
assert(progress.current_video.url.includes('youtube.com'), 'Current video URL is YouTube');
assert(progress.current_video.channel !== undefined, 'Current video has channel');
assert(typeof progress.current_video.total_sessions === 'number', 'Current video has total_sessions (number)');
assert(typeof progress.current_video.current_session === 'number', 'Current video has current_session (number)');
assert(progress.current_video.current_session >= 1, 'Current session is >= 1');
assert(progress.current_video.current_session <= progress.current_video.total_sessions, 'Current session <= total sessions');
assert(Array.isArray(progress.current_video.why_selected), 'Current video has why_selected array');
assert(progress.current_video.why_selected.length >= 2, 'Current video has at least 2 selection reasons');
assert(Array.isArray(progress.completed_videos), 'Progress has completed_videos array');
assert(Array.isArray(progress.topic_queue), 'Progress has topic_queue array');

// Verify queued videos have required fields
for (const video of progress.topic_queue) {
  assert(video.title !== undefined, `Queued "${video.title?.substring(0, 30)}..." has title`);
  assert(video.url !== undefined && video.url.includes('youtube.com'), `Queued "${video.title?.substring(0, 30)}..." has YouTube URL`);
  assert(video.channel !== undefined, `Queued "${video.title?.substring(0, 30)}..." has channel`);
  assert(Array.isArray(video.why_selected) && video.why_selected.length >= 2, `Queued "${video.title?.substring(0, 30)}..." has selection reasons`);
}

// ─── Test: Generation scripts are executable ──────────────────────────────────

console.log('\n\x1b[1m[Scripts]\x1b[0m');

const scripts = [
  'scripts/generate-ai-learning.sh',
  'scripts/generate-stock-trader.sh',
  'scripts/generate-market-news.sh',
  'scripts/update-manifest.sh',
];

for (const script of scripts) {
  const content = readFile(script);
  assert(content.startsWith('#!/usr/bin/env bash'), `${script}: has bash shebang`);
  assert(content.includes('set -euo pipefail'), `${script}: has strict mode`);
  assert(content.includes('ANTHROPIC_API_KEY') || script.includes('update-manifest'), `${script}: references API key (or is manifest script)`);
}

// AI learning script reads progress
const aiScript = readFile('scripts/generate-ai-learning.sh');
assert(aiScript.includes('progress.json'), 'AI learning script reads progress.json');
assert(aiScript.includes('PROGRESS'), 'AI learning script passes PROGRESS context');

// ─── Test: Workflow includes all 3 tasks ──────────────────────────────────────

console.log('\n\x1b[1m[Workflow]\x1b[0m');

const workflow = readFile('.github/workflows/daily-briefing.yml');
assert(workflow.includes('generate-ai-learning'), 'Workflow has AI learning job');
assert(workflow.includes('generate-stock-trader'), 'Workflow has stock trader job');
assert(workflow.includes('generate-market-news'), 'Workflow has market news job');
assert(workflow.includes('generate-ai-learning, generate-stock-trader, generate-market-news'), 'Publish needs all 3 jobs');
assert(workflow.includes('market-news-output'), 'Workflow downloads market news artifact');

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`);

if (failed > 0) {
  console.log('\n\x1b[31mFailures:\x1b[0m');
  for (const f of failures) {
    console.log(`  - ${f}`);
  }
  process.exit(1);
} else {
  console.log('\n\x1b[32mAll tests passed!\x1b[0m\n');
  process.exit(0);
}
