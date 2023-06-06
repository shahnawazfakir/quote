// Get references to the DOM elements
const quoteText = document.querySelector(".Quote");
const authorName = document.querySelector(".author .name");
const quoteBtn = document.querySelector("button");
const copyBtn = document.querySelector(".copy");
const differentQuoteBtn = document.querySelector(".more-quotes");
const shareBtn = document.querySelector(".share");
const searchBtn = document.querySelector(".search-btn");
const searchContainer = document.querySelector(".search-container");
const searchInput = document.querySelector(".search-input");

// Toggle search container visibility when search button is clicked
searchBtn.addEventListener("click", () => {
    searchContainer.classList.toggle("show");
});

// Fetch and display quotes by a specific author
function searchQuotesByAuthor(authorSlug) {
    fetch(`https://api.quotable.io/random?author=${encodeURIComponent(authorSlug)}`)
        .then((res) => {
            if (!res.ok) {
                quoteText.innerText = "No quotes found for the author.";
                authorName.innerText = "Author Unknown";
            }
            return res.json();
        })
        .then((result) => {
            if (result.length > 0) {
                quoteText.innerText = result.content;
                authorName.innerText = result.author;
            }
            else {
                // Handle the case when no quotes are found for the author
            }
        })
        .catch((error) => {
            console.error("Failed to fetch quote: ", error);
        });
}

// Trigger searchQuotesByAuthor function when Enter key is pressed in the search input
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const authorSlug = searchInput.value.trim();
        if (authorSlug !== "") {
            searchQuotesByAuthor(authorSlug);
        }
        searchContainer.classList.remove("show");
        searchInput.value = "";
    }
});

// Fetch a random quote and display it
function randomQuote() {
    fetch("https://api.quotable.io/random")
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to fetch quote");
            }
            return res.json();
        })
        .then((result) => {
            quoteText.innerText = result.content;
            authorName.innerText = result.author;
            localStorage.setItem("Quote", quoteText.innerText);
            localStorage.setItem("Author", authorName.innerText);
            const currentTimestamp = Date.now();
            localStorage.setItem("lastQuoteUpdate", currentTimestamp);
        })
        .catch((error) => {
            console.error("Failed to fetch quote: ", error);
        });
}

// Check if the quote needs to be updated
function checkAndUpdateQuote() {
    const lastQuoteUpdate = localStorage.getItem("lastQuoteUpdate");
    if (!lastQuoteUpdate) {
        // First time loading, set the quote immediately
        randomQuote();
    }
    const currentTimestamp = Date.now();
    const timeSinceLastUpdate = currentTimestamp - lastQuoteUpdate;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (timeSinceLastUpdate >= twentyFourHours) {
        randomQuote();
        init();
    }
    // Use the stored quote if 24 hours have not passed
    quoteText.innerText = localStorage.getItem("Quote");
    authorName.innerText = localStorage.getItem("Author");
}


// Share the current quote using the Web Share API
function webShare(text, url) {
    return new Promise((resolve, reject) => {
        if (navigator.share && navigator.canShare && navigator.canShare({ text, url })) {
            navigator
                .share({ text, url })
                .then(resolve)
                .catch(reject);
        } else {
            reject(new Error("Web Share API is not supported or data cannot be shared."));
        }
    });
}

// Fetch a different quote by the same author
function fetchDifferentQuoteByAuthor(author) {
    fetch(`https://api.quotable.io/random?author=${encodeURIComponent(author)}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to fetch quote");
            }
            return res.json();
        })
        .then((result) => {
            quoteText.innerText = result.content;
            authorName.innerText = result.author;
        })
        .catch((error) => {
            console.error("Failed to fetch quote: ", error);
        });
}

// Hide the search button on mobile devices
function hideSearchButtonOnMobile() {
    if (window.innerWidth <= 600) {
        searchBtn.style.display = "none";
    }
}

// Check if the device is in horizontal mode on Android and iPhone
function checkHorizontalMode() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiPhone = /iPhone/i.test(navigator.userAgent);
    if ((isAndroid || isiPhone) && window.innerHeight < window.innerWidth) {
        footer.style.display = "none";
    } else {
        footer.style.display = "block";
    }
}

// refresh page when device orientation changes
if (window.DeviceOrientationEvent) {
    window.addEventListener('orientationchange', function () { location.reload(); }, false);
}

// Initialize the application
function init() {
    // Add event listeners to buttons
    quoteBtn.addEventListener("click", randomQuote);

    // Copy the quote text to the clipboard
    copyBtn.addEventListener("click", () => {
        navigator.clipboard
            .writeText(quoteText.innerText)
            .then(() => {
                alert("Copied!");
            })
            .catch((error) => {
                console.error("Failed to copy text: ", error);
            });
    });

    // Share the current quote using the Web Share API
    shareBtn.addEventListener("click", () => {
        const quote = quoteText.innerText;
        const author = authorName.innerText;
        const shareText = `Quote: ${quote}\nAuthor: ${author}`;
        webShare(shareText, window.location.href)
            .then(() => {
                console.log("Shared successfully");
            })
            .catch((error) => {
                console.error("Error sharing with Web Share API:", error);
            });
    });

    // Fetch a different quote by the same author
    differentQuoteBtn.addEventListener("click", () => {
        const author = authorName.innerText.trim();
        const slicedAuthor = author.replace(/[^a-zA-Z ]/g, "").trim();
        fetchDifferentQuoteByAuthor(slicedAuthor);
    });

    // Open a Google search for the author's name
    authorName.addEventListener("click", () => {
        const author = authorName.innerText.trim();
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(author)}`;
        window.open(searchUrl, "_blank");
    });

    checkHorizontalMode()
}

// Call checkHorizontalMode on window load and orientation change
window.addEventListener("load", checkHorizontalMode);

// Add event listeners for window load and resize events
window.addEventListener("load", hideSearchButtonOnMobile);
window.addEventListener("resize", hideSearchButtonOnMobile);

// Call the init function after the page finishes loading
window.addEventListener("load", init);

// Call the checkAndUpdateQuote function once when the page loads
window.addEventListener("load", checkAndUpdateQuote);

// Refresh the quote every 24 hours
setInterval(checkAndUpdateQuote, 24 * 60 * 60 * 1000);