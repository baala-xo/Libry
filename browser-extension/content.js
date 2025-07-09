// Content script for additional page interaction (optional)
// This could be used for features like:
// - Highlighting links that are already saved
// - Quick save buttons on pages
// - Bulk link collection

console.log("Libry content script loaded")

// Declare the chrome variable
const chrome = window.chrome

// Example: Add a floating save button (optional)
function addQuickSaveButton() {
  const button = document.createElement("div")
  button.innerHTML = "📚"
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: #0070f3;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10000;
    font-size: 18px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `

  button.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      action: "saveLink",
      url: window.location.href,
      title: document.title,
    })
  })

  document.body.appendChild(button)
}

// Uncomment to enable quick save button
// addQuickSaveButton();
