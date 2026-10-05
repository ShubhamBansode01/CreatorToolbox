const generateBtn = document.getElementById("generateBtn");
const promptInput = document.getElementById("prompt");
const toolSelect = document.getElementById("tool");

const resultBox = document.getElementById("result");
const statusBox = document.getElementById("status");
const providerBox = document.getElementById("provider");


generateBtn.addEventListener("click", generateContent);


async function generateContent() {

  const prompt = promptInput.value.trim();
  const tool = toolSelect.value;


  // Validate prompt
  if (!prompt) {
    statusBox.textContent = "Please enter a prompt.";
    promptInput.focus();
    return;
  }


  // Loading state
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";

  statusBox.textContent = "Generating your content...";
  providerBox.textContent = "";

  resultBox.textContent = "";


  try {

    // Send request to Vercel serverless API
    const response = await fetch("/api/generate", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        prompt: prompt,
        tool: tool
      })

    });


    // Convert response to JSON
    const data = await response.json();


    // Handle API error
    if (!response.ok) {
      throw new Error(
        data.error || "Failed to generate content."
      );
    }


    // Display result
    if (data.result) {
      resultBox.textContent = data.result;
    } else {
      resultBox.textContent = "No result received.";
    }


    // Show which AI generated the response
    if (data.provider === "gemini") {

      providerBox.textContent = "Gemini";

    } else if (data.provider === "huggingface") {

      providerBox.textContent = "Hugging Face";

    } else {

      providerBox.textContent = "";

    }


    statusBox.textContent = "Generation complete.";


  } catch (error) {

    console.error("Generation error:", error);


    statusBox.textContent = "Generation failed.";

    resultBox.textContent =
      error.message || "Something went wrong.";


    providerBox.textContent = "";


  } finally {

    // Reset button
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate";

  }

}
