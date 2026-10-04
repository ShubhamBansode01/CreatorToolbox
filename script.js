// --- 1. PRIMARY BACKEND (GOOGLE GEMINI) ---
const GOOGLE_BACKEND_URL = "https://script.google.com/macros/s/AKfycby-vB9M6XkxTwdEs-rQSQRCaklkjvnsJoajX2wYrTBKPpsxU6zI18Qmw1e2pKcZ55Uluw/exec";

// --- 2. BACKUP BACKEND (HUGGING FACE ROUTER API) ---
// Vercel securely injects this environment variable during deployment
const HF_API_KEY = process.env.HUGGING_FACE_TOKEN; 

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

// --- AUTO-FALLBACK ROUTING ENGINE ---
async function fetchFromBackend(prompt) {
    // STEP 1: Try Primary Google Backend First
    const googleController = new AbortController();
    const googleTimeoutId = setTimeout(() => googleController.abort(), 12000); 

    try {
        console.log("Attempting Primary Google API...");
        const googleResponse = await fetch(GOOGLE_BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ prompt: prompt }),
            redirect: 'follow',
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            signal: googleController.signal 
        });

        clearTimeout(googleTimeoutId); 
        const data = await googleResponse.json();
        
        if (data.success) {
            return data.text; 
        } else {
            throw new Error("Google API failed or quota exceeded.");
        }
    } catch (error) {
        console.warn("Primary API failed. Switching to Hugging Face Backup...");
        
        // STEP 2: Primary Failed. Trigger Hugging Face Backup
        const hfController = new AbortController();
        const hfTimeoutId = setTimeout(() => hfController.abort(), 20000);
        
        try {
            const hfResponse = await fetch("https://router.huggingface.co/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "meta-llama/Llama-3.1-8B-Instruct", 
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 800,
                    temperature: 0.7
                }),
                signal: hfController.signal
            });

            clearTimeout(hfTimeoutId);
            const hfData = await hfResponse.json();

            if (hfData.error) {
                console.error("Hugging Face API Error:", hfData.error);
                return null;
            }

            console.log("Successfully generated using Backup API!");
            return hfData.choices[0].message.content.trim();

        } catch (backupError) {
            console.error("Both Primary and Backup APIs failed.", backupError.message);
            return null; 
        }
    }
}

// ... [Keep all your generateAI, checkShadowban, and utility functions exactly the same below this] ...
