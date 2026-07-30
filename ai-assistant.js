import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-ai.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDRGvJnNDdraqUjWRnrZ3HQVr2ic0piVCE',
  authDomain: 'marketing-plan-5f2a4.firebaseapp.com',
  projectId: 'marketing-plan-5f2a4',
  storageBucket: 'marketing-plan-5f2a4.firebasestorage.app',
  messagingSenderId: '577412511657',
  appId: '1:577412511657:web:5115af794d95e29acef6b8',
  measurementId: 'G-JL3XTTGVZX'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {
  model: 'gemini-3.6-flash',
  generationConfig: {
    temperature: 0.25,
    topP: 0.8,
    maxOutputTokens: 6000,
    responseMimeType: 'application/json'
  }
});

const MODES = {
  improve: 'Improve clarity, strategic quality, grammar, and presentation impact while keeping the same meaning and similar length.',
  executive: 'Rewrite the narrative in concise executive language suitable for senior management. Make implications and priorities immediately clear.',
  actions: 'Strengthen the slide with specific strategic recommendations and executable actions. Do not merely repeat visible data.',
  simplify: 'Simplify dense language, shorten sentences, remove repetition, and improve readability without losing important meaning.',
  evidence: 'Improve scientific and evidence-oriented wording. Do not invent claims, references, figures, dates, guidelines, or clinical facts.',
  proofread: 'Correct grammar, spelling, punctuation, capitalization, and wording only. Keep meaning, facts, and length as close as possible.'
};

let currentMode = 'improve';
let pendingEdits = [];
let undoHtml = '';
let lastContextKey = '';

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function ensureUi(){
  if (!document.body || document.querySelector('.ai-slide-trigger')) return;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'ai-slide-trigger';
  trigger.textContent = '✦ AI Slide Assistant';

  const panel = document.createElement('aside');
  panel.className = 'ai-slide-panel';
  panel.setAttribute('aria-label','AI Slide Assistant');
  panel.innerHTML = `
    <div class="ai-panel-head">
      <div><b>AI Slide Assistant</b><small>Preview → Apply → Save to Firebase</small></div>
      <button type="button" class="ai-panel-close" aria-label="Close">×</button>
    </div>
    <div class="ai-panel-body">
      <div class="ai-context">Open a slide to start.</div>
      <div class="ai-mode-grid">
        <button type="button" class="ai-mode active" data-mode="improve">Improve slide</button>
        <button type="button" class="ai-mode" data-mode="executive">Executive wording</button>
        <button type="button" class="ai-mode" data-mode="actions">Strategic actions</button>
        <button type="button" class="ai-mode" data-mode="simplify">Simplify content</button>
        <button type="button" class="ai-mode" data-mode="evidence">Evidence language</button>
        <button type="button" class="ai-mode" data-mode="proofread">Proofread only</button>
      </div>
      <textarea class="ai-custom" placeholder="Optional instruction, for example: Make the recommendations more specific for Jordan pharmacies."></textarea>
      <div class="ai-actions">
        <button type="button" class="ai-generate">Generate preview</button>
        <button type="button" class="ai-apply" disabled>Apply changes</button>
        <button type="button" class="ai-undo" disabled>Undo</button>
        <button type="button" class="ai-save">Save slide</button>
      </div>
      <div class="ai-status">AI edits narrative text only. Tables, values, percentages, and dates are protected.</div>
      <div class="ai-preview"></div>
      <div class="ai-disclaimer">Review AI wording before saving. The assistant is instructed not to invent market, medical, regulatory, or financial facts.</div>
    </div>`;

  document.body.append(trigger,panel);
  trigger.addEventListener('click',()=>{
    panel.classList.toggle('open');
    refreshContext();
  });
  panel.querySelector('.ai-panel-close').addEventListener('click',()=>panel.classList.remove('open'));
  panel.querySelectorAll('.ai-mode').forEach(button=>button.addEventListener('click',()=>{
    currentMode = button.dataset.mode || 'improve';
    panel.querySelectorAll('.ai-mode').forEach(x=>x.classList.toggle('active',x===button));
  }));
  panel.querySelector('.ai-generate').addEventListener('click',generatePreview);
  panel.querySelector('.ai-apply').addEventListener('click',applyEdits);
  panel.querySelector('.ai-undo').addEventListener('click',undoEdits);
  panel.querySelector('.ai-save').addEventListener('click',()=>{
    const saveButton = document.getElementById('saveSlide');
    if (!saveButton) return setStatus('Open a slide before saving.','error');
    saveButton.click();
    setStatus('Save requested through the existing Firebase slide workflow.','success');
  });
}

function getSlideContext(){
  const body = document.querySelector('#slides .slide .slide-body');
  const slide = body?.closest('.slide');
  const country = document.getElementById('countrySelect')?.value || '';
  const product = document.getElementById('productSelect')?.value || '';
  const counter = document.getElementById('slideCounter')?.textContent || '';
  const title = body?.querySelector('.slide-title,h1,h2')?.textContent?.trim() || 'Current slide';
  return { body, slide, country, product, counter, title };
}

function refreshContext(){
  const panel = document.querySelector('.ai-slide-panel');
  if (!panel) return;
  const ctx = getSlideContext();
  const key = `${ctx.country}|${ctx.product}|${ctx.counter}|${ctx.title}`;
  if (key !== lastContextKey){
    pendingEdits = [];
    panel.querySelector('.ai-preview').innerHTML = '';
    panel.querySelector('.ai-apply').disabled = true;
    lastContextKey = key;
  }
  panel.querySelector('.ai-context').innerHTML = ctx.body
    ? `<b>${escapeHtml(ctx.title)}</b><br>${escapeHtml(ctx.product)} • ${escapeHtml(ctx.country)} • ${escapeHtml(ctx.counter)}`
    : 'Open a slide to start.';
}

function isMostlyNumeric(text){
  const compact = text.replace(/\s/g,'');
  if (!compact) return true;
  const numeric = (compact.match(/[\d.,%$€£¥()+\-/:]/g)||[]).length;
  return numeric / compact.length > 0.55;
}

function collectEditableElements(body){
  const tags = 'h1,h2,h3,h4,p,li,span,b,strong,small,div';
  const labelBlocklist = new Set(['findings','actions','recommendations','source','market definition','strategic implication']);
  const all = [...body.querySelectorAll(tags)];
  const eligible = all.filter(el=>{
    if (el.closest('table,svg,canvas,.table-wrap,.bar-row,.chart,.slide-header-flag')) return false;
    if (el.matches('.slide-no,.source')) return false;
    const text = el.textContent?.replace(/\s+/g,' ').trim() || '';
    if (text.length < 4 || text.length > 1000 || isMostlyNumeric(text)) return false;
    if (labelBlocklist.has(text.toLowerCase())) return false;
    const hasEligibleChild = [...el.children].some(child=>child.matches(tags) && child.textContent?.trim());
    if (hasEligibleChild) return false;
    return true;
  });
  return eligible.slice(0,80).map((el,index)=>({
    id:`E${index+1}`,
    el,
    tag:el.tagName.toLowerCase(),
    text:el.textContent.replace(/\s+/g,' ').trim()
  }));
}

function buildPrompt(ctx,elements,custom){
  const payload = elements.map(({id,tag,text})=>({id,tag,text}));
  return `You are a world-class regional pharmaceutical product manager, medical-marketing writer, and presentation editor.

TASK
${MODES[currentMode] || MODES.improve}
${custom ? `Additional user instruction: ${custom}` : ''}

SLIDE CONTEXT
Country: ${ctx.country || 'Not specified'}
Brand: ${ctx.product || 'Not specified'}
Slide: ${ctx.title}

STRICT RULES
1. Return valid JSON only, with this exact structure: {"summary":"...","edits":[{"id":"E1","text":"replacement text","reason":"brief reason"}]}.
2. Use only IDs provided below. Omit elements that do not need changes.
3. Never modify or invent any number, percentage, date, currency, market share, growth rate, ranking, product name, molecule, competitor name, medical claim, guideline, citation, source, or regulatory statement.
4. Do not infer unsupported facts. When evidence is missing, improve wording without adding claims.
5. Keep each replacement close to the original length so the slide layout remains readable. Prefer concise language.
6. Do not repeat table values. Findings should interpret; actions should specify what to do; recommendations should prioritize decisions.
7. Keep language professional, direct, and suitable for a regional marketing-plan presentation.
8. Plain text only inside each replacement. Do not return HTML or markdown.

EDITABLE ELEMENTS
${JSON.stringify(payload)}`;
}

function parseJson(text){
  const cleaned = String(text||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();
  return JSON.parse(cleaned);
}

async function generatePreview(){
  const panel = document.querySelector('.ai-slide-panel');
  const ctx = getSlideContext();
  if (!ctx.body) return setStatus('Open a slide before using AI.','error');
  const elements = collectEditableElements(ctx.body);
  if (!elements.length) return setStatus('No narrative text was found on this slide.','error');
  const custom = panel.querySelector('.ai-custom').value.trim();
  setBusy(true);
  setStatus(`Analyzing ${elements.length} editable text elements…`);
  try{
    const result = await model.generateContent(buildPrompt(ctx,elements,custom));
    const parsed = parseJson(result.response.text());
    const map = new Map(elements.map(item=>[item.id,item]));
    pendingEdits = (Array.isArray(parsed.edits)?parsed.edits:[])
      .filter(edit=>map.has(edit.id) && typeof edit.text==='string' && edit.text.trim())
      .map(edit=>({
        id:edit.id,
        el:map.get(edit.id).el,
        before:map.get(edit.id).text,
        after:edit.text.trim(),
        reason:String(edit.reason||'Improved wording')
      }))
      .filter(edit=>edit.before !== edit.after)
      .slice(0,40);
    renderPreview(parsed.summary || 'AI review completed.');
  }catch(error){
    console.error('AI slide assistant failed',error);
    const message = String(error?.message||error);
    if (/app.?check|403|permission|unauth/i.test(message)){
      setStatus('AI Logic is connected, but Firebase App Check or authenticated-users mode still needs to allow this deployed domain.','error');
    }else{
      setStatus(`AI request failed: ${message}`,'error');
    }
  }finally{
    setBusy(false);
  }
}

function renderPreview(summary){
  const panel = document.querySelector('.ai-slide-panel');
  const preview = panel.querySelector('.ai-preview');
  if (!pendingEdits.length){
    preview.innerHTML = '';
    panel.querySelector('.ai-apply').disabled = true;
    return setStatus('Review completed. No safe text changes were required.','success');
  }
  preview.innerHTML = pendingEdits.map((edit,index)=>`
    <div class="ai-edit-card">
      <b>Change ${index+1}</b>
      <div class="before">${escapeHtml(edit.before)}</div>
      <div class="after">${escapeHtml(edit.after)}</div>
      <div class="reason">${escapeHtml(edit.reason)}</div>
    </div>`).join('');
  panel.querySelector('.ai-apply').disabled = false;
  setStatus(`${summary} ${pendingEdits.length} change${pendingEdits.length===1?'':'s'} ready for review.`,'success');
}

function applyEdits(){
  const ctx = getSlideContext();
  if (!ctx.body || !pendingEdits.length) return;
  undoHtml = ctx.body.innerHTML;
  pendingEdits.forEach(edit=>{
    if (edit.el?.isConnected) edit.el.textContent = edit.after;
  });
  document.querySelector('.ai-undo').disabled = false;
  document.querySelector('.ai-apply').disabled = true;
  setStatus('AI changes applied to the current slide. Review them, then click Save slide.','success');
}

function undoEdits(){
  const ctx = getSlideContext();
  if (!ctx.body || !undoHtml) return;
  ctx.body.innerHTML = undoHtml;
  undoHtml = '';
  pendingEdits = [];
  const panel = document.querySelector('.ai-slide-panel');
  panel.querySelector('.ai-preview').innerHTML = '';
  panel.querySelector('.ai-undo').disabled = true;
  panel.querySelector('.ai-apply').disabled = true;
  setStatus('AI changes were undone.','success');
}

function setBusy(busy){
  const button = document.querySelector('.ai-generate');
  if (!button) return;
  button.disabled = busy;
  button.textContent = busy ? 'Generating…' : 'Generate preview';
}

function setStatus(message,type=''){
  const status = document.querySelector('.ai-status');
  if (!status) return;
  status.className = `ai-status ${type}`.trim();
  status.textContent = message;
}

const observer = new MutationObserver(()=>{
  ensureUi();
  if (document.querySelector('.ai-slide-panel.open')) refreshContext();
});
observer.observe(document.documentElement,{childList:true,subtree:true});
ensureUi();
