import { $ } from './dom.js';

const slides = [
  { kicker:'DecodeLabs · Batch 2026', title:'Full Stack Development', subtitle:'Industrial Training Kit · Project 4', body:'Optional Mastery Phase · Frontend & Backend Integration', visual:'DECODELABS / 2026' },
  { kicker:'Welcome to the team', title:'You are the connector.', body:'Project 4 is the Optional Mastery Phase: connect a UI to server logic and manage the full data flow of a web app.', points:['Your certificate does not depend on this phase.','Completing it proves you can make both halves work together.'] },
  { kicker:'Project 4 · Frontend & Backend Integration', title:'Make the request. Move the data.', body:'Goal: integrate frontend with backend APIs.', points:['Send requests from frontend → backend','Display dynamic data on the UI','Handle basic errors and responses'], tags:['API integration','Asynchronous requests','Full-stack data flow'], visual:'⚙  ↔  ☁  ↔  { }' },
  { kicker:'The metaphor', title:'Build the nervous system.', body:'The frontend senses. The backend thinks. Project 4 builds the nerve between them.', visual:'◉  ?  ◉', visualLabels:['Frontend · Sensory Interface','Backend · Cognitive Vault'] },
  { kicker:'Why integration matters', title:'The missing link in modern applications', body:'You have already mastered UI (Project 1) and databases/APIs (Projects 2 & 3) separately. Real engineering happens in the connection between systems.', split:[['CLASSIC PLAQUE','A UI without a backend is just a static facade.'],['BANK VAULT','A database without a frontend is an inaccessible vault.']], note:'74% of organizations now follow an API-first approach · Postman State of API Report' },
  { kicker:'Architecture', title:'The I-P-O model', body:'Three stages. One stateless request/reply loop.', flow:[['01 · INPUT','Frontend sends HTTP request','GET /api/users'],['02 · PROCESS','Backend queries DB and packages JSON','server → database → response'],['03 · OUTPUT','Frontend receives payload and updates DOM','data → interface']] , note:'Client and server live on separate hardware, connected only through the network.' },
  { kicker:'The bridge protocol', title:'RESTful principles & idempotency', table:[['METHOD','ACTION','RETRY?','EXAMPLE'],['GET','Retrieve','YES','Fetch interns'],['POST','Create','NO','Register intern'],['PUT','Replace entire resource','YES','Update whole profile'],['PATCH','Partial update','NO','Update phone'],['DELETE','Remove','YES','Delete intern']], note:'Use nouns, not verbs: /users, not /getUsers. Every request carries its own auth and context.' },
  { kicker:'Async fundamentals', title:'The problem of the frozen webpage', split:[['SYNCHRONOUS','The browser freezes while waiting for a response 5,000 miles away.'],['ASYNCHRONOUS','The request runs in the background. The UI stays responsive, then updates when the Promise resolves.']], body:'JavaScript is single-threaded. The Event Loop and Promises move work through Pending → Fulfilled / Rejected.' },
  { kicker:'Modern JavaScript', title:'async / await', split:[['OLD WAY · PROMISE HELL','.then().then().catch() — deeply nested and hard to scan.'],['MODERN WAY','async function + await fetch(...) — clean, linear, readable.']], note:'await pauses this function without blocking the browser thread. It only works inside an async function.' },
  { kicker:'Native mechanism', title:'The fetch() skeleton', code:"fetch('https://api.domain.com/v1/users', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(userData)\n});", points:['Endpoint = URI target','Configuration = REST method','Headers = data format','Payload = serialized body'] },
  { kicker:'Network security', title:'CORS is the gate.', body:'A frontend on Domain A cannot cross to a backend on Domain B unless the server grants permission.', visual:'FRONTEND A  ──▣──  BACKEND B', visualLabels:['Browser same-origin policy','Access-Control-Allow-Origin'], points:['CORS blocks cross-domain requests by default.','Complex requests trigger an invisible OPTIONS preflight.','If the server rejects your URL, the real request never leaves.'] },
  { kicker:'Diagnostic vocabulary', title:'Read the status before the body.', status:[['2xx','Success','200 OK · 201 Created · 204 No Content'],['4xx','Client error','400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 422 Unprocessable'],['5xx','Server error','500 Internal Server Error · 502 Bad Gateway']], note:'Professional code checks response.ok (boolean) rather than trusting error text.' },
  { kicker:'The border crossing', title:'JSON translates the network.', split:[['DESERIALIZATION','response.json()\nnetwork text → JS object'],['SERIALIZATION','JSON.stringify()\nJS object → network text']], points:['Keys need double quotes. No trailing commas.','Functions, undefined, and Symbols are stripped.','Date objects become ISO strings.'] },
  { kicker:'Close the IPO loop', title:'State → UI → Event → State', code:"const card = document.createElement('div');\ncard.textContent = user.name;\ncontainer.appendChild(card);", visual:'STATE  →  DOM  →  CLICK  →  NEW STATE', note:'Security rule: prefer textContent over innerHTML for user data. It prevents XSS attacks.' },
  { kicker:'Defensive programming', title:'Shield the fetch logic.', body:'External threats include network drops, 500 errors, and broken JSON.', points:['No silent failures — blank screens are not a strategy.','Graceful degradation — show a fallback and an actionable retry.','finally() — hide spinners and clean up on every path.'], visual:'TRY / CATCH / FINALLY' },
  { kicker:'Diagnostic table', title:'Intern anti-patterns → senior code', table:[['MISTAKE','RESULT','FIX'],['Forget await','[object Promise]','Pair async + await'],['await in a loop','10 requests take 10 seconds','Promise.all() in parallel'],['Assume 404 throws','Crash parsing HTML as JSON','Check !response.ok'],['console.log in prod','Errors vanish untraced','Central logging + user toast']] },
  { kicker:'Synthesis', title:'The complete nervous system lifecycle', steps:['User clicks Load → async function','try {} opens → shield activates','fetch() → CORS preflight check','await pauses → server responds','Check 200 green or 500 red','response.json() → JS object','DOM injection → UI updates','finally {} → spinner hides'] },
  { kicker:'The full-stack milestone', title:'From scripter to systems thinker.', body:'A frontend eye and backend brain connected by a living data tunnel.', visual:'◉  ═══  ◉', points:['Master the IPO model','Translate with JSON','Handle async logic defensively'], note:'Project 4 is the gatekeeper phase for modern, multi-cloud, AI-driven environments.' },
  { kicker:'Conclusion', title:'You are ready for the next layer.', body:'Project 4 is optional. You have already met the core certification requirements.', points:['Submit completed tasks to the portal for final verification.','DecodeLabs is proud of your progress.'], visual:'FRONTEND  ↔  API  ↔  BACKEND', note:'Bottom line: fetch + async/await + REST + CORS + JSON + DOM + try/catch/finally = full-stack integration.' }
];

function renderSlide(slide, index) {
  const visual = slide.visual ? `<div class="deck-visual">${slide.visual}</div>` : '';
  const visualLabels = slide.visualLabels ? `<div class="deck-visual-labels"><span>${slide.visualLabels[0]}</span><span>${slide.visualLabels[1]}</span></div>` : '';
  const body = slide.body ? `<p class="deck-body">${slide.body}</p>` : '';
  const points = slide.points ? `<ul class="deck-points">${slide.points.map(point => `<li>${point}</li>`).join('')}</ul>` : '';
  const tags = slide.tags ? `<div class="deck-tags">${slide.tags.map(tag => `<span>${tag}</span>`).join('')}</div>` : '';
  const split = slide.split ? `<div class="deck-split">${slide.split.map(item => `<article><strong>${item[0]}</strong><p>${item[1]}</p></article>`).join('')}</div>` : '';
  const flow = slide.flow ? `<div class="deck-flow">${slide.flow.map(item => `<article><b>${item[0]}</b><strong>${item[1]}</strong><code>${item[2]}</code></article>`).join('<span class="flow-arrow">→</span>')}</div>` : '';
  const table = slide.table ? `<div class="deck-table-wrap"><table class="deck-table"><tbody>${slide.table.map((row, rowIndex) => `<tr>${row.map(cell => rowIndex === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  const status = slide.status ? `<div class="deck-status">${slide.status.map(item => `<article><b>${item[0]}</b><strong>${item[1]}</strong><span>${item[2]}</span></article>`).join('')}</div>` : '';
  const code = slide.code ? `<pre class="deck-code"><code>${slide.code.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</code></pre>` : '';
  const steps = slide.steps ? `<ol class="deck-steps">${slide.steps.map(step => `<li>${step}</li>`).join('')}</ol>` : '';
  const note = slide.note ? `<aside class="deck-note">${slide.note}</aside>` : '';
  return `<div class="deck-slide-number">${String(index + 1).padStart(2, '0')}</div><div class="deck-content"><p class="deck-kicker">${slide.kicker}</p><h1>${slide.title}</h1>${body}${visual}${visualLabels}${points}${tags}${split}${flow}${table}${status}${code}${steps}${note}</div>`;
}

export function initTraining() {
  const slideRoot = $('#trainingSlide');
  if (!slideRoot) return;
  const counter = $('#trainingCounter');
  const progress = $('#trainingProgress');
  const dotsRoot = $('#trainingDots');
  const prev = $('#trainingPrev');
  const next = $('#trainingNext');
  let current = 0;

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'training-dot';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => show(index));
    dotsRoot.appendChild(dot);
  });

  function show(index) {
    current = Math.max(0, Math.min(index, slides.length - 1));
    slideRoot.innerHTML = renderSlide(slides[current], current);
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    [...dotsRoot.children].forEach((dot, index) => dot.classList.toggle('active', index === current));
    prev.disabled = current === 0;
    next.textContent = current === slides.length - 1 ? 'Restart ↺' : 'Next →';
  }

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current === slides.length - 1 ? 0 : current + 1));
  document.addEventListener('keydown', event => {
    if ($('#view-training')?.classList.contains('active')) {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') show(current + 1);
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') show(current - 1);
      if (event.key === 'Home') show(0);
      if (event.key === 'End') show(slides.length - 1);
    }
  });
  show(0);
}
