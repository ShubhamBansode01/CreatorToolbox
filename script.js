// --- CENTRAL SECURE BACKEND URL ---
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbwz-JN2H2goR8T7PbagKSnCnvPQd2mVdvHDsvfoQsWDR6uH7WCDdo5oBdGTq1vTOTqFXA/exec";

// Load cached data on startup so users don't lose work on refresh
window.onload = () => {
    const aiTools = ['script', 'reviver', 'promo', 'storyboard', 'ideas', 'desc', 'keywords', 'hook', 'titles'];
    aiTools.forEach(type => {
        const cachedResult = localStorage.getItem(`cache_${type}`);
        if (cachedResult && document.getElementById(`${type}Output`)) {
            document.getElementById(`${type}Output`).innerText = cachedResult;
        }
    });
};

// Page Switcher
function switchPage(pageId, btnElement) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (btnElement) btnElement.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- SECURE BACKEND ROUTING ---
async function fetchFromBackend(prompt, lang) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ prompt: prompt, lang: lang }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });

        const data = await response.json();
        if (data.success) {
            return data.text;
        } else {
            console.error("Backend Error:", data.error);
            return null;
        }
    } catch (error) {
        console.error("Network or Fetch Failed:", error);
        return null;
    }
}

// Trigger AI based on tool type (Fully implemented for all 9 tools)
async function generateAI(type) {
    const btn = document.getElementById(`btn-${type}`);
    const loader = document.getElementById(`loader-${type}`);
    const textSpan = document.getElementById(`text-${type}`);
    const lang = document.getElementById('outputLanguage').value;
    
    let outputDiv, topicInput;

    if (type === 'script') {
        outputDiv = document.getElementById('scriptOutput');
        topicInput = document.getElementById('scriptTopic').value;
    } else if (type === 'reviver') {
        outputDiv = document.getElementById('reviverOutput');
        topicInput = document.getElementById('reviverTopic').value;
    } else if (type === 'promo') {
        outputDiv = document.getElementById('promoOutput');
        topicInput = document.getElementById('promoTopic').value;
    } else if (type === 'storyboard') {
        outputDiv = document.getElementById('storyboardOutput');
        topicInput = document.getElementById('storyboardTopic').value;
    } else if (type === 'ideas') {
        outputDiv = document.getElementById('ideasOutput');
        topicInput = document.getElementById('ideasTopic').value;
    } else if (type === 'desc') {
        outputDiv = document.getElementById('descOutput');
        topicInput = document.getElementById('descTopic').value;
    } else if (type === 'keywords') {
        outputDiv = document.getElementById('keywordOutput');
        topicInput = document.getElementById('keywordTopic').value;
    } else if (type === 'hook') {
        outputDiv = document.getElementById('hookOutput');
        topicInput = document.getElementById('hookTopic').value;
    } else if (type === 'titles') {
        outputDiv = document.getElementById('titleOutput');
        topicInput = document.getElementById('titleTopic').value;
    }

    if (!topicInput || !topicInput.trim()) {
        outputDiv.innerHTML = '<span class="error-text">Please enter a topic first!</span>';
        return;
    }
    
    btn.disabled = true;
    loader.style.display = 'inline-block';
    textSpan.style.display = 'none';
    outputDiv.innerText = "Connecting to AI... Please wait.";

    let prompt = "";
    if (type === 'script') {
        prompt = `You are an expert short-form video scriptwriter. Write a completely ORIGINAL Instagram Reel/YouTube Short script strictly in ${lang} language on this topic: ${topicInput}. Rules: 1. Strong hook. 2. Natural pacing. 3. Short punchy sentences. 4. Practical insight. 5. Conversational tone. 6. No unnecessary emojis/headings. 7. 30 seconds max length. Output ONLY the final script in ${lang}.`;
    } 
    else if (type === 'reviver') {
        prompt = `You are a viral content strategist. A creator uploaded a video about: [${topicInput}] but it flopped and got archived due to low views. Generate a completely fresh angle, a much more aggressive and curiosity-inducing hook, and a new clickable title so they can re-edit and re-upload it successfully. Write the output clearly in ${lang}.`;
    }
    else if (type === 'promo') {
        prompt = `You are a digital marketing expert. A creator wants to promote: [${topicInput}]. Generate 3 persuasive, non-spammy 'Call to Action' (CTA) templates they can pin in their comments or say at the end of their Reel to drive direct clicks and sales without sounding desperate. Write in ${lang}.`;
    }
    else if (type === 'storyboard') {
        prompt = `You are an expert video editor. Generate a visual second-by-second storyboard and shot-list for a 30-second short-form video about: [${topicInput}]. Tell the creator exactly when to add zoom-ins, text overlays, visual effects, and beat-syncs to maximize audience retention. Keep it actionable. Write in ${lang}.`;
    }
    else if (type === 'ideas') {
        prompt = `You are a social media strategist. Generate 5 unique, highly-engaging video ideas for a creator in this niche: ${topicInput}. For each idea, provide a catchy title and a 1-sentence explanation of the concept. Number them 1 to 5. Write the entire output in ${lang}.`;
    }
    else if (type === 'desc') {
        prompt = `You are an expert Instagram growth manager. Write a full, highly-engaging, algorithm-friendly Instagram Reel description for a video about: ${topicInput}. Make sure it strictly adheres to Instagram community guidelines. Format it cleanly with line breaks. Include a strong hook, value body, Call-To-Action, and hashtag space. Write the description in ${lang}.`;
    }
    else if (type === 'keywords') {
        prompt = `You are an SEO expert. Generate a list of exactly 30 highly searched keywords and long-tail key phrases for a Short video about: ${topicInput}. Format the output as a simple comma-separated list. No bullet points. Generate the keywords in ${lang} or English where appropriate.`;
    }
    else if (type === 'hook') {
        prompt = `You are a social media expert. Write a viral, 2-sentence psychological hook for a short-form video about: ${topicInput}. Make it highly engaging to stop people from scrolling. Write the hook in ${lang}.`;
    } 
    else if (type === 'titles') {
        prompt = `You are a YouTube algorithm expert. Write 5 highly clickable, high-CTR titles for a video about: ${topicInput}. Number them 1 to 5. Make them dramatic and compelling, but not clickbait. Write the titles in ${lang}.`;
    }

    const aiResponse = await fetchFromBackend(prompt, lang);

    btn.disabled = false;
    loader.style.display = 'none';
    textSpan.style.display = 'inline-block';
    
    if (!aiResponse) {
        outputDiv.innerHTML = `<span class="error-text">⚠️ Oops! Something went wrong while generating. Please try again.</span>`;
    } else {
        const cleanResponse = aiResponse.trim();
        outputDiv.innerText = cleanResponse;
        localStorage.setItem(`cache_${type}`, cleanResponse);
    }
}

// --- SHADOWBAN & GUIDELINE CHECKER LOGIC ---
function checkShadowban() {
    const input = document.getElementById('checkerTopic').value;
    const outputDiv = document.getElementById('checkerOutput');
    
    if (!input.trim()) {
        outputDiv.innerHTML = '<span class="error-text">Please paste a caption or script first.</span>';
        return;
    }

    const spamWords = [
        "buy now", "click link", "link in bio", "giveaway", "free followers", 
        "sub4sub", "follow for follow", "like for like", "comment below to win",
        "share this", "purchase", "discount", "sale", "venmo", "cashapp", "paypal",
        "crypto", "bitcoin", "investment", "guaranteed", "earn money", "make money fast"
    ];

    let cleanHTML = input.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
    let foundSpam = 0;

    spamWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(cleanHTML)) {
            foundSpam++;
            cleanHTML = cleanHTML.replace(regex, match => `<span class="flagged-word">${match}</span>`);
        }
    });

    if (foundSpam > 0) {
        outputDiv.innerHTML = `
            <div class="warning-header">⚠️️ Found ${foundSpam} potential spam/engagement-bait words!</div>
            <p style="font-size: 0.9rem; margin-bottom: 10px;">The algorithm may restrict reach for the highlighted terms below. Try rephrasing them.</p>
            ${cleanHTML.replace(/\n/g, "<br>")}
        `;
    } else {
        outputDiv.innerHTML = `
            <div class="safe-text">✅ Looks Safe!</div>
            <p style="font-size: 0.9rem; margin-top: 5px;">No major engagement-bait or spam trigger words detected in your text.</p>
        `;
    }
}

// --- NON-AI UTILITY TOOLS ---
function formatText() {
    const input = document.getElementById('inputText').value;
    if (!input.trim()) return alert("Please enter text first.");
    const boldMap = { 'a':'𝗮', 'b':'𝗯', 'c':'𝗰', 'd':'𝗱', 'e':'𝗲', 'f':'𝗳', 'g':'𝗴', 'h':'𝗵', 'i':'𝗶', 'j':'𝗷', 'k':'𝗸', 'l':'𝗹', 'm':'𝗺', 'n':'𝗻', 'o':'𝗼', 'p':'𝗽', 'q':'𝗾', 'r':'𝗿', 's':'𝘀', 't':'𝘁', 'u':'𝘂', 'v':'𝘃', 'w':'𝘄', 'x':'𝘅', 'y':'𝘆', 'z':'𝘇', 'A':'𝗔', 'B':'𝗕', 'C':'𝗖', 'D':'𝗗', 'E':'𝗘', 'F':'𝗙', 'G':'𝗚', 'H':'𝗛', 'I':'𝗜', 'J':'𝗝', 'K':'𝗞', 'L':'𝗟', 'M':'𝗠', 'N':'𝗡', 'O':'𝗢', 'P':'𝗣', 'Q':'𝗤', 'R':'𝗥', 'S':'𝗦', 'T':'𝗧', 'U':'𝗨', 'V':'𝗩', 'W':'𝗪', 'X':'𝗫', 'Y':'𝗬', 'Z':'𝗭', '0':'𝟬', '1':'𝟭', '2':'𝟮', '3':'𝟯', '4':'𝟰', '5':'𝟱', '6':'𝟲', '7':'𝗳', '8':'𝟴', '9':'𝟵' };
    let formatted = '';
    for (let i = 0; i < input.length; i++) formatted += boldMap[input[i]] || input[i];
    document.getElementById('outputText').innerText = formatted + "\n\n.\n.\n.";
}

function generateTags() {
    let keyword = document.getElementById('tagKeyword').value.trim().replace(/#/g, '');
    if(!keyword) return alert("Enter a main keyword.");
    const kw = keyword.replace(/\s+/g, '');
    document.getElementById('tagOutput').innerText = `.#${kw} #${kw}tips #${kw}ideas #${kw}viral \n#viral #explorepage #trending #fyp #foryou #contentcreator #growth`;
}

function copyText(elementId) {
    const element = document.getElementById(elementId);
    let textToCopy = element.innerText;
    
    if (elementId === 'checkerOutput' && textToCopy.includes('⚠️')) {
         alert("Please fix the highlighted words before copying!");
         return;
    }
    
    if (textToCopy.includes("appear here") || textToCopy.includes("Enter a") || textToCopy.includes("Oops!")) return alert("Generate valid text first!");
    
    navigator.clipboard.writeText(textToCopy).then(() => alert("Copied to clipboard!")).catch(() => alert("Could not copy."));
}
