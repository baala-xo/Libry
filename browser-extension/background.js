// Background service worker for Libry extension

const chrome = window.chrome // Declare the chrome variable

chrome.runtime.onInstalled.addListener(() => {
  console.log("Libry extension installed successfully")

  // Create context menu item
  chrome.contextMenus.create({
    id: "saveLinkToLibrary",
    title: "Save to Libry",
    contexts: ["page", "link"],
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveLinkToLibrary") {
    // Open the popup when context menu is clicked
    chrome.action.openPopup()
  }
})

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveCurrentPage") {
    // This could be used for keyboard shortcuts or other triggers
    chrome.action.openPopup()
  }
})
