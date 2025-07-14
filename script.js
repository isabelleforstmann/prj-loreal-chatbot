// URL of the Cloudflare Worker for API requests
const workerurl = "https://loreal-defender.isabelleforstmann.workers.dev";

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "How can I help you today? ";

// Store chat history as an array of messages
let messages = [{ role: "system", content: "You are a helpful assistant." }];

/* Simple function to convert basic markdown to HTML */
function renderMarkdown(text) {
  // Convert **bold** to <strong>
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Convert *italic* to <em>
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // Convert [text](url) to <a href="url">text</a>
  text = text.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank">$1</a>'
  );
  // Convert line breaks
  text = text.replace(/\n/g, "<br>");
  return text;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const userMessage = userInput.value;

  // Add user message to chat history
  messages.push({ role: "user", content: userMessage });

  // Show user message in chat window
  chatWindow.innerHTML += `<div class="msg user">${userMessage}</div>`;

  // Clear input box
  userInput.value = "";

  // Show loading message
  chatWindow.innerHTML += `<div class="msg ai">Thinking...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Call OpenAI API using fetch
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`, // Use API key from secrets.js
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use the gpt-4o model
        messages: messages,
        max_tokens: 300,
      }),
    });

    // Parse the response as JSON
    const data = await response.json();

    // Get the assistant's reply
    const aiMessage =
      data.choices && data.choices[0] && data.choices[0].message.content
        ? data.choices[0].message.content.trim()
        : "Sorry, I couldn't get a response.";

    // Add assistant message to chat history
    messages.push({ role: "assistant", content: aiMessage });

    // Remove the loading message and show the AI's reply
    const msgs = chatWindow.querySelectorAll(".msg.ai");
    if (msgs.length > 0) {
      msgs[msgs.length - 1].remove();
    }
    // Render markdown before displaying
    chatWindow.innerHTML += `<div class="msg ai">${renderMarkdown(
      aiMessage
    )}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    // Show error message
    chatWindow.innerHTML += `<div class="msg ai">Error: ${error.message}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

/*
  Users can send a message by:
  - Pressing Enter while typing in the input box
  - Clicking the submit button (type="submit")
  Both actions trigger the form's submit event below.
*/
