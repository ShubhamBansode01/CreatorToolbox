const BACKEND_URL = "https://script.google.com/macros/s/AKfycbyE4VW5Lj72Rb3kRcjSQFP_vMyI_excrDW0PABJwTUTOGfQExTZEMgTInvi-pDd-d--zw/exec";

const AI_TOOLS = {
  script:{input:"scriptTopic",output:"scriptOutput",label:"Scriptwriter",prompt:t=>`You are an expert short-form video scriptwriter. Create an original high-retention Instagram Reel/YouTube Short script about "${t}". Use a strong hook, short natural sentences, clear value, conversational pacing and a memorable ending. Maximum 30 seconds. Output only the script in {{lang}}.`},
  reviver:{input:"reviverTopic",output:"reviverOutput",label:"Content Reviver",prompt:t=>`You are a short-form content strategist. A previous video about "${t}" underperformed. Create: 1) a fresh angle, 2) a curiosity-driven hook, 3) a new title, and 4) one concrete editing change. Be practical and write in {{lang}}.`},
  promo:{input:"promoTopic",output:"promoOutput",label:"CTA Generator",prompt:t=>`Create 3 persuasive but natural CTAs for promoting "${t}". Avoid spammy or manipulative language. Make each CTA suitable for a short-form video. Write in {{lang}}.`},
  storyboard:{input:"storyboardTopic",output:"storyboardOutput",label:"Storyboard",prompt:t=>`Create an actionable storyboard for a 30-second short-form video about "${t}". Use time ranges, visuals, on-screen text, camera/editing direction and voiceover cues. Write in {{lang}}.`},
  ideas:{input:"ideasTopic",output:"ideasOutput",label:"Content Ideas",prompt:t=>`Generate 5 original short-form video concepts for the niche "${t}". For each provide a title, hook angle, one-sentence concept and suggested format. Write in {{lang}}.`},
  desc:{input:"descTopic",output:"descOutput",label:"Description",prompt:t=>`Write an engaging Instagram Reel description for "${t}". Include a strong opening, useful context, a natural CTA and relevant hashtag suggestions. Avoid unsupported algorithm claims. Write in {{lang}}.`},
  keywords:{input:"keywordTopic",output:"keywordOutput",label:"Keywords",prompt:t=>`Generate 30 relevant search keywords and long-tail phrases for a short-form video about "${t}". Prefer specific, useful phrases over generic spam. Return a clean numbered list. Use {{lang}} where natural.`},
  hook:{input:"hookTopic",output:"hookOutput",label:"Hooks",prompt:t=>`Generate 5 distinct scroll-stopping hooks for a short-form video about "${t}". Mix curiosity, surprising fact, direct challenge, story and question formats. Write in {{lang}}.`},
  titles:{input:"titleTopic",output:"titleOutput",label:"Titles",prompt:t=>`Generate 5 clickable but accurate titles for a video about "${t}". Avoid deceptive clickbait. Write in {{lang}}.`}
};

const $ = id => document.getElementById(id);
const lang = () => $("outputLanguage")?.value || "English";

window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("ct_language");
  if(savedLang && $("outputLanguage")) $("outputLanguage").value = savedLang;
  renderProjects();
  renderDashboardProjects();
});

function saveSetting(key,value){
  if(key==="language") localStorage.setItem("ct_language",value);
}

function switchPage(pageId, btn){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const page=$(pageId); if(page) page.classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.page===pageId));
  window.scrollTo({top:0,behavior:"smooth"});
}

function openTool(type){
  const area=$("legacyToolArea");
  const cfg=AI_TOOLS[type];
  if(!cfg) return;
  const title=cfg.label;
  area.classList.remove("hidden");
  area.innerHTML=`
    <div class="page-heading"><span class="eyebrow">AI TOOL</span><h1>${escapeHTML(title)}</h1><p>Generate a polished result, then copy or save it.</p></div>
    <label for="dynamicToolInput">Topic</label>
    <input id="dynamicToolInput" maxlength="500" placeholder="Enter your topic...">
    <button class="btn-primary" id="dynamicToolBtn">Generate</button>
    <div id="dynamicToolOutput" class="output-box" style="margin-top:18px">Your result will appear here...</div>`;
  $("dynamicToolBtn").onclick=()=>generateDynamic(type);
  area.scrollIntoView({behavior:"smooth"});
}

async function generateDynamic(type){
  const cfg=AI_TOOLS[type], topic=$("dynamicToolInput").value.trim(), out=$("dynamicToolOutput"), btn=$("dynamicToolBtn");
  if(!topic){out.innerHTML='<span class="error-text">Enter a topic first.</span>';return}
  btn.disabled=true; btn.textContent="Generating...";
  out.textContent="Connecting to AI...";
  const prompt=cfg.prompt(topic).replaceAll("{{lang}}",lang());
  const result=await fetchFromBackend(prompt,lang());
  btn.disabled=false; btn.textContent="Generate";
  if(!result){out.innerHTML='<span class="error-text">Could not generate content. Please try again.</span>';return}
  out.textContent=result; showToast("Generated successfully");
  saveProject(cfg.label,topic,{result});
}

async function generateAI(type){
  const cfg=AI_TOOLS[type]; if(!cfg) return;
  const input=$(cfg.input), output=$(cfg.output), btn=$(`btn-${type}`);
  const topic=input?.value.trim();
  if(!topic){output.innerHTML='<span class="error-text">Enter a topic first.</span>';return}
  const loader=$(`loader-${type}`), text=$(`text-${type}`);
  btn.disabled=true; if(loader)loader.style.display="inline-block"; if(text)text.style.display="none";
  output.textContent="Connecting to AI...";
  const result=await fetchFromBackend(cfg.prompt(topic).replaceAll("{{lang}}",lang()),lang());
  btn.disabled=false;if(loader)loader.style.display="none";if(text)text.style.display="inline";
  if(!result){output.innerHTML='<span class="error-text">Could not generate content. Please try again.</span>';return}
  output.textContent=result; localStorage.setItem(`cache_${type}`,result); showToast("Generated successfully");
}

async function generateReel(){
  const topic=$("reelTopic").value.trim();
  if(!topic){$("reelStatus").textContent="Enter a topic first.";return}
  const btn=$("btn-reel"); btn.disabled=true; btn.textContent="Building your Reel...";
  $("reelStatus").textContent="Creating hooks, script, visuals, caption and hashtags...";
  const prompt=`You are CreatorToolbox Reel Studio. Build a complete short-form video package.
Topic: ${topic}
Platform: ${$("reelPlatform").value}
Duration: ${$("reelDuration").value}
Style: ${$("reelStyle").value}
Audience: ${$("reelAudience").value || "general audience"}
Language: ${lang()}

Return these exact sections:
HOOK OPTIONS (3)
FINAL SCRIPT
VISUAL STORYBOARD
ON-SCREEN TEXT
CAPTION
CTA
HASHTAGS

Make the content original, concise, practical and suitable for the requested duration. Do not claim guaranteed virality or algorithm results.`;
  const result=await fetchFromBackend(prompt,lang());
  btn.disabled=false;btn.textContent="Generate Complete Reel";
  if(!result){$("reelStatus").textContent="Generation failed. Try again.";return}
  $("reelStatus").textContent="Your content pack is ready.";
  renderResultPack(result);
  saveProject(topic,topic,{result,style:$("reelStyle").value,duration:$("reelDuration").value});
  showToast("Reel saved to My Content");
}

function renderResultPack(text){
  const sections=text.split(/\n(?=[A-Z][A-Z0-9 &-]{2,}:)/);
  $("reelOutput").innerHTML=sections.map((s,i)=>{
    const lines=s.split("\n"), title=(lines.shift()||`Section ${i+1}`).replace(/:$/,"");
    const body=lines.join("\n").trim() || s;
    return `<article class="result-card"><h3>${escapeHTML(title)}</h3><pre>${escapeHTML(body)}</pre><div class="result-actions"><button onclick="copyValue(this)">Copy</button><button onclick="saveSnippet(this)">Save</button></div></article>`;
  }).join("");
}

async function analyzeScript(){
  const text=$("analyzerText").value.trim();
  if(!text){$("analyzerOutput").innerHTML='<div class="result-card"><span class="error-text">Paste a script first.</span></div>';return}
  $("analyzerOutput").innerHTML='<div class="result-card">Analyzing your script...</div>';
  const prompt=`Analyze this short-form video script as a creator coach.
Return ONLY this compact format:
HOOK SCORE: /100
CLARITY SCORE: /100
PACING SCORE: /100
CTA SCORE: /100
OVERALL SCORE: /100
WHAT WORKS:
3 bullets
WHAT HURTS RETENTION:
3 bullets
BEST IMPROVEMENT:
A rewritten opening
SCRIPT:
${text}
Do not claim to know platform algorithms or guarantee performance.`;
  const result=await fetchFromBackend(prompt,lang());
  if(!result){$("analyzerOutput").innerHTML='<div class="result-card"><span class="error-text">Analysis failed. Try again.</span></div>';return}
  const scores=[...result.matchAll(/(?:HOOK|CLARITY|PACING|CTA|OVERALL) SCORE:\s*(\d{1,3})/gi)].map(m=>m[1]);
  $("analyzerOutput").innerHTML=`<div class="result-card"><div class="score-grid">${["Hook","Clarity","Pacing","CTA","Overall"].map((x,i)=>`<div class="score"><strong>${scores[i]??"—"}</strong><span>${x}</span></div>`).join("")}</div></div><div class="result-card"><pre>${escapeHTML(result)}</pre><div class="result-actions"><button onclick="copyValue(this)">Copy Analysis</button></div></div>`;
}

function saveProject(title,topic,data){
  const projects=getProjects();
  projects.unshift({id:crypto.randomUUID?.()||String(Date.now()),title,topic,createdAt:new Date().toISOString(),...data});
  localStorage.setItem("ct_projects",JSON.stringify(projects.slice(0,50)));
  renderProjects();renderDashboardProjects();
}
function getProjects(){try{return JSON.parse(localStorage.getItem("ct_projects")||"[]")}catch{return[]}}
function renderProjects(){
  const el=$("projectsList"); if(!el)return;
  const projects=getProjects();
  el.innerHTML=projects.length?projects.map(projectCard).join(""):`<div class="result-card"><h3>No saved projects yet</h3><p>Generate a Reel or use an AI tool and your work will appear here.</p></div>`;
}
function renderDashboardProjects(){
  const el=$("dashboardProjects");if(!el)return;
  const projects=getProjects().slice(0,3);
  el.innerHTML=projects.length?projects.map(projectCard).join(""):`<div class="result-card"><p>No projects yet. Your next Reel can be the first.</p></div>`;
}
function projectCard(p){
  const date=new Date(p.createdAt).toLocaleDateString();
  return `<article class="project-card"><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.topic||"")} · ${date}</p><div class="project-actions"><button onclick="copyProject('${p.id}')">Copy</button><button onclick="deleteProject('${p.id}')">Delete</button></div></article>`;
}
function copyProject(id){
  const p=getProjects().find(x=>x.id===id);if(!p)return;
  navigator.clipboard.writeText(p.result||JSON.stringify(p,null,2));showToast("Project copied");
}
function deleteProject(id){
  localStorage.setItem("ct_projects",JSON.stringify(getProjects().filter(x=>x.id!==id)));renderProjects();renderDashboardProjects();showToast("Project deleted");
}
function copyValue(btn){
  const card=btn.closest(".result-card"); const text=card.querySelector("pre")?.innerText||card.innerText;
  navigator.clipboard.writeText(text);showToast("Copied");
}
function saveSnippet(btn){const text=btn.closest(".result-card").querySelector("pre")?.innerText||"";saveProject("Saved snippet",text.slice(0,100),{result:text});showToast("Saved");}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}

async function fetchFromBackend(prompt, language){
  try{
    const response=await fetch(BACKEND_URL,{method:"POST",body:JSON.stringify({prompt,lang:language}),headers:{"Content-Type":"text/plain;charset=utf-8"}});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    if(data.success)return String(data.text||"").trim();
    console.error("Backend error",data.error);return null;
  }catch(error){console.error(error);return null}
}

function checkShadowban(){
  const input=$("checkerTopic").value.trim(), out=$("checkerOutput");
  if(!input){out.innerHTML='<span class="error-text">Paste your text first.</span>';return}
  const patterns=["buy now","click link","link in bio","follow for follow","like for like","free followers","sub4sub","comment below to win"];
  const found=patterns.filter(w=>new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i").test(input));
  out.innerHTML=`<div class="${found.length?"warning-header":"safe-text"}">${found.length?"Review suggested":"No obvious spam-style phrases detected"}</div><p>${found.length?`Found ${found.length} phrase(s): ${found.join(", ")}. These are not proof of a reach penalty, but you may want to rephrase them.`:"This simple local check cannot predict platform reach or a shadowban."}</p>`;
}

function formatText(){
  const input=$("inputText")?.value.trim();if(!input){showToast("Enter text first");return}
  const map={'a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷','k':'𝗸','l':'𝗹','m':'𝗺','n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁','u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇','A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝','K':'𝗞','L':'𝗟','M':'𝗠','N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧','U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭','0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵'};
  $("outputText").innerText=[...input].map(c=>map[c]||c).join("");showToast("Formatted");
}
function generateTags(){
  const keyword=$("tagKeyword")?.value.trim().replace(/#/g,"");if(!keyword){showToast("Enter a keyword");return}
  const words=keyword.toLowerCase().split(/\s+/).join("");
  $("tagOutput").innerText=`#${words}\n#${words}tips #${words}ideas #${words}creator\n#contentcreator #reelscreator #shortformvideo #videotips\n#${words}community #creatorcommunity`;
}
function copyText(id){const el=$(id);if(!el)return;navigator.clipboard.writeText(el.innerText);showToast("Copied to clipboard")}
                                                                
