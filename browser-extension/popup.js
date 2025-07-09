// Configuration - Update this when you deploy your app
const API_BASE = "http://localhost:3000" // Change to your deployed URL in production

document.addEventListener("DOMContentLoaded", async () => {
  const loginPrompt = document.getElementById("loginPrompt")
  const saveForm = document.getElementById("saveForm")
  const loginButton = document.getElementById("loginButton")
  const linkForm = document.getElementById("linkForm")
  const messageDiv = document.getElementById("message")
  const saveButton = document.getElementById("saveButton")
  const cancelButton = document.getElementById("cancelButton")
  const buttonText = document.getElementById("buttonText")
  const buttonIcon = document.getElementById("buttonIcon")
  const statusBar = document.getElementById("statusBar")

  // Declare chrome variable
  const chrome = window.chrome

  let currentTab = null

  // Initialize the popup
  await initializePopup()

  // Event Listeners
  loginButton.addEventListener("click", handleLogin)
  linkForm.addEventListener("submit", handleFormSubmit)
  cancelButton.addEventListener("click", () => window.close())

  // Functions
  async function initializePopup() {
    try {
      // Get current tab info
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      currentTab = tab

      // Pre-fill form with current page data
      document.getElementById("url").value = tab.url
      document.getElementById("title").value = tab.title
      document.getElementById("urlPreview").textContent = tab.url

      // Check authentication and load libraries
      await checkAuthAndLoadLibraries()
    } catch (error) {
      console.error("Error initializing popup:", error)
      showMessage("Error accessing current tab", "error")
      setStatus("offline", "Connection failed")
    }
  }

  async function checkAuthAndLoadLibraries() {
    try {
      setStatus("checking", "Checking authentication...")
      showMessage("Connecting to Link Library...", "info")

      const response = await fetch(`${API_BASE}/api/extension`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("Auth check response:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Auth check data:", data)

        if (data.libraries && data.libraries.length > 0) {
          populateLibraries(data.libraries)
          saveForm.style.display = "block"
          loginPrompt.style.display = "none"
          setStatus("online", "Connected & Ready")
          clearMessage()
        } else {
          showMessage("No libraries found. Please create a library first.", "error")
          loginPrompt.style.display = "block"
          saveForm.style.display = "none"
          setStatus("offline", "No libraries found")
        }
      } else {
        console.log("Auth check failed:", response.status)
        loginPrompt.style.display = "block"
        saveForm.style.display = "none"
        setStatus("offline", "Please sign in")
        clearMessage()
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      showMessage("Connection error. Please check if the app is running.", "error")
      loginPrompt.style.display = "block"
      saveForm.style.display = "none"
      setStatus("offline", "Connection failed")
    }
  }

  function handleLogin() {
    chrome.tabs.create({ url: `${API_BASE}/login` })
    window.close()
  }

  async function handleFormSubmit(e) {
    e.preventDefault()

    const title = document.getElementById("title").value.trim()
    const url = document.getElementById("url").value.trim()
    const libraryId = document.getElementById("library").value
    const description = document.getElementById("description").value.trim()
    const tagsInput = document.getElementById("tags").value.trim()

    if (!title || !url || !libraryId) {
      showMessage("Please fill in all required fields", "error")
      return
    }

    // Show loading state
    setLoadingState(true)
    setStatus("checking", "Saving link...")

    try {
      const tags = tagsInput
        ? tagsInput
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag.length > 0)
        : []

      const requestBody = {
        title,
        url,
        libraryId,
        description: description || null,
        tags: tags.length > 0 ? tags : null,
      }

      console.log("Sending request:", requestBody)

      const response = await fetch(`${API_BASE}/api/extension`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      })

      const responseData = await response.json()
      console.log("Response:", responseData)

      if (response.ok) {
        showMessage("✅ Link saved successfully!", "success")
        setStatus("online", "Link saved!")

        // Reset form
        document.getElementById("description").value = ""
        document.getElementById("tags").value = ""

        // Close popup after success
        setTimeout(() => {
          window.close()
        }, 2000)
      } else {
        throw new Error(responseData.error || `Server error: ${response.status}`)
      }
    } catch (error) {
      console.error("Error saving link:", error)
      showMessage(`❌ Failed to save: ${error.message}`, "error")
      setStatus("offline", "Save failed")
    } finally {
      setLoadingState(false)
    }
  }

  function populateLibraries(libraries) {
    const select = document.getElementById("library")

    // Clear existing options except the first one
    select.innerHTML = '<option value="">Choose a library...</option>'

    libraries.forEach((library) => {
      const option = document.createElement("option")
      option.value = library.id
      option.textContent = `${library.name}${library.is_public ? " (Public)" : " (Private)"}`
      select.appendChild(option)
    })
  }

  function showMessage(text, type) {
    messageDiv.textContent = text
    messageDiv.className = `message ${type}`
    messageDiv.style.display = "block"
  }

  function clearMessage() {
    messageDiv.style.display = "none"
    messageDiv.textContent = ""
    messageDiv.className = "message"
  }

  function setLoadingState(loading) {
    saveButton.disabled = loading

    if (loading) {
      buttonIcon.innerHTML = '<div class="loading"></div>'
      buttonText.textContent = "Saving..."
    } else {
      buttonIcon.textContent = "💾"
      buttonText.textContent = "Save Link"
    }
  }

  function setStatus(status, text) {
    statusBar.className = `status-bar ${status}`

    const statusText = statusBar.querySelector("span")
    if (statusText) {
      statusText.textContent = text
    }

    // Update icon based on status
    const existingIcon = statusBar.querySelector(".loading, .icon")
    if (existingIcon) {
      existingIcon.remove()
    }

    let icon
    if (status === "online") {
      icon = document.createElement("span")
      icon.textContent = "✅"
      icon.className = "icon"
    } else if (status === "offline") {
      icon = document.createElement("span")
      icon.textContent = "❌"
      icon.className = "icon"
    } else if (status === "checking") {
      icon = document.createElement("div")
      icon.className = "loading"
    }

    if (icon) {
      statusBar.insertBefore(icon, statusBar.firstChild)
    }
  }
})
