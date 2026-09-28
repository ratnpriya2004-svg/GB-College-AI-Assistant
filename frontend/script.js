/* ==========================================
   GB COLLEGE AI ASSISTANT
   FRONTEND LOGIC
========================================== */
let collegeData = null;

async function loadCollegeData() {

    try {

        const response =
            await fetch("./data/college-info.json");

        if (!response.ok) {
            throw new Error("College data could not be loaded.");
        }

        collegeData = await response.json();

        console.log(
            "✅ College knowledge base loaded successfully."
        );

    } catch (error) {

        console.error(
            "❌ Failed to load college data:",
            error
        );
    }
}

loadCollegeData();



const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const micBtn = document.getElementById("micBtn");
const voiceToggle =
    document.getElementById("voiceToggle");

const stopVoice =
    document.getElementById("stopVoice");


const messages = document.getElementById("messages");
const welcomeScreen = document.getElementById("welcomeScreen");

const typingIndicator =
    document.getElementById("typingIndicator");

const speakingIndicator =
    document.getElementById("speakingIndicator");

const themeToggle =
    document.getElementById("themeToggle");

const clearChat =
    document.getElementById("clearChat");

const newChatBtn =
    document.getElementById("newChatBtn");

const menuBtn =
    document.getElementById("menuBtn");

const closeSidebar =
    document.getElementById("closeSidebar");

const sidebar =
    document.getElementById("sidebar");


/* ==========================================
   THEME
========================================== */

const savedTheme =
    localStorage.getItem("gb-theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeToggle.innerHTML =
        '<i class="fa-solid fa-sun"></i>';
}


themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "gb-theme",
        isDark ? "dark" : "light"
    );

    themeToggle.innerHTML = isDark

        ? '<i class="fa-solid fa-sun"></i>'

        : '<i class="fa-solid fa-moon"></i>';
});


/* ==========================================
   SIDEBAR
========================================== */

menuBtn.addEventListener("click", () => {

    sidebar.classList.add("open");
});


closeSidebar.addEventListener("click", () => {

    sidebar.classList.remove("open");
});


/* ==========================================
   TEXTAREA AUTO RESIZE
========================================== */

messageInput.addEventListener("input", () => {

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            120
        ) + "px";
});


/* ==========================================
   SEND MESSAGE
========================================== */

async function sendMessage(text = null) {

    const userText =
        text !== null
            ? text.trim()
            : messageInput.value.trim();


    if (!userText) return;


    /* Hide welcome screen */

    welcomeScreen.style.display = "none";


    /* Add user message */

    addMessage(
        userText,
        "user"
    );


    /* Clear input */

    messageInput.value = "";

    messageInput.style.height = "auto";


    /* Show typing */

    showTyping();


    try {

        /* =========================
           CALL BACKEND
        ========================= */

        const response =
            await getAIResponse(userText);


        /* Hide typing */

        hideTyping();


        /* Add AI response */

        addMessage(
            response,
            "ai"
        );
        speakAIResponse(response);

    } catch (error) {

        hideTyping();

        addMessage(
            "Sorry, something went wrong. Please try again.",
            "ai"
        );

        console.error(
            "Chat error:",
            error
        );

    }

}


/* ==========================================
   ENTER KEY
========================================== */

messageInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


/* ==========================================
   SEND BUTTON
========================================== */

sendBtn.addEventListener(
    "click",
    () => sendMessage()
);


/* ==========================================
   QUICK QUESTIONS
========================================== */

document
    .querySelectorAll(".quick-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const question =
                    card.dataset.question;

                sendMessage(question);
            }
        );
    });


/* ==========================================
   ADD MESSAGE
========================================== */

function addMessage(
    text,
    sender
) {

    const message =
        document.createElement("div");

    message.className =
        `message ${sender}`;


    const avatar =
        document.createElement("div");

    avatar.className =
        `message-avatar ${
            sender === "ai"
                ? "ai-avatar"
                : "user-avatar"
        }`;


    avatar.innerHTML =
        sender === "ai"

            ? '<i class="fa-solid fa-robot"></i>'

            : '<i class="fa-solid fa-user"></i>';


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";

    bubble.textContent = text;


    const time =
        document.createElement("div");

    time.className =
        "message-time";

    time.textContent =
        getCurrentTime();


    content.appendChild(bubble);

    content.appendChild(time);


    /* AI actions */

    if (sender === "ai") {

        const actions =
            document.createElement("div");

        actions.className =
            "message-actions";


        const copyBtn =
            document.createElement("button");

        copyBtn.className =
            "message-action";

        copyBtn.innerHTML =
            '<i class="fa-regular fa-copy"></i>';


        copyBtn.title =
            "Copy response";


        copyBtn.addEventListener(
            "click",
            () => {

                navigator.clipboard.writeText(text);

                copyBtn.innerHTML =
                    '<i class="fa-solid fa-check"></i>';

                setTimeout(() => {

                    copyBtn.innerHTML =
                        '<i class="fa-regular fa-copy"></i>';

                }, 1500);
            }
        );


        actions.appendChild(copyBtn);

        content.appendChild(actions);
    }


    message.appendChild(avatar);

    message.appendChild(content);


    messages.appendChild(message);


    scrollToBottom();
}


/* ==========================================
   TIME
========================================== */

function getCurrentTime() {

    return new Date().toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* ==========================================
   TYPING
========================================== */

function showTyping() {

    typingIndicator.style.display =
        "flex";

    scrollToBottom();
}


function hideTyping() {

    typingIndicator.style.display =
        "none";
}


/* ==========================================
   SCROLL
========================================== */

function scrollToBottom() {

    const chatArea =
        document.getElementById("chatArea");

    setTimeout(() => {

        chatArea.scrollTo({

            top: chatArea.scrollHeight,

            behavior: "smooth"

        });

    }, 50);
}


/* ==========================================
   CLEAR CHAT
========================================== */

function resetChat() {

    messages.innerHTML = "";

    welcomeScreen.style.display =
        "block";

    hideTyping();
}


clearChat.addEventListener(
    "click",
    resetChat
);


newChatBtn.addEventListener(
    "click",
    () => {

        resetChat();

        sidebar.classList.remove("open");
    }
);

/* ==========================================
   AI RESPONSE
========================================== */

async function getAIResponse(userMessage) {

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: userMessage
            })

        });


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data = await response.json();


        if (!data.success) {

            throw new Error(
                data.error || "AI response failed."
            );

        }


        return data.reply;

    } catch (error) {

        console.error(
            "❌ AI Chat Error:",
            error
        );

        throw error;
    }
}
/* ==========================================
   COLLEGE KNOWLEDGE BASE RESPONSE
========================================== */

function getCollegeAnswer(message) {

    if (!collegeData) {

        return `
Please wait a moment. I'm still loading
the G.B. College information. 😊
        `.trim();
    }


    const q =
        message.toLowerCase();


    /* =========================
       BCA
    ========================= */

    if (
        q.includes("bca") ||
        q.includes("computer application")
    ) {

        return `
🎓 Yes! G.B. College, Naugachia offers
Bachelor of Computer Applications (BCA).

BCA is offered under the Vocational courses.

The other vocational course listed is
Industrial Fish & Fishery (IFF).
        `.trim();
    }


    /* =========================
       COURSES
    ========================= */

   if (
    q.includes("course") ||
    q.includes("courses") ||
    q.includes("stream") ||
    q.includes("kaun kaun se course") ||
    q.includes("kon kon se course") ||
    q.includes("kaun se course") ||
    q.includes("konsa course") ||
    q.includes("koun sa course")
) {

        const science =
            collegeData.courses.science.join("\n• ");

        const arts =
            collegeData.courses.arts.join("\n• ");

        const vocational =
            collegeData.courses.vocational.join("\n• ");


        return `
📚 G.B. College offers courses in
Science, Arts and Vocational streams.

🔬 Science:
• ${science}

🎨 Arts:
• ${arts}

💻 Vocational:
• ${vocational}
        `.trim();
    }


    /* =========================
       LIBRARY
    ========================= */

    if (
    q.includes("library") ||
    q.includes("books") ||
    q.includes("library facilities") ||
    q.includes("library me") ||
    q.includes("library mein") ||
    q.includes("library ki facility") ||
    q.includes("library facilities kya hai")
) {

        return `
📖 G.B. College Library

${collegeData.library.description}

Library resources include:

• ${collegeData.library.resources.join("\n• ")}

Facilities include:

• ${collegeData.library.facilities.join("\n• ")}
        `.trim();
    }


    /* =========================
       VISION
    ========================= */

    if (q.includes("vision")) {

        return `
🎯 Vision of G.B. College:

${collegeData.vision}
        `.trim();
    }


    /* =========================
       MISSION
    ========================= */

    if (q.includes("mission")) {

        return `
🚀 Mission of G.B. College:

${collegeData.mission}
        `.trim();
    }


    /* =========================
       VALUES
    ========================= */

    if (
        q.includes("value") ||
        q.includes("values")
    ) {

        return `
💎 G.B. College Values:

• ${collegeData.values.join("\n• ")}
        `.trim();
    }


    /* =========================
       CONTACT
    ========================= */

    if (
        q.includes("contact") ||
        q.includes("email") ||
        q.includes("phone") ||
        q.includes("address") ||
        q.includes("location")
    ) {

        return `
📞 G.B. College Contact Information

📍 ${collegeData.contact.address}

📧 ${collegeData.contact.email}

☎️ ${collegeData.contact.phone}
        `.trim();
    }


    /* =========================
       ABOUT / HISTORY
    ========================= */

    if (
        q.includes("about college") ||
        q.includes("about gb") ||
        q.includes("history") ||
        q.includes("who are you")
    ) {

        return `
🏫 ${collegeData.college.name}

${collegeData.about.description}

📜 History:

${collegeData.about.history}
        `.trim();
    }


    /* =========================
       ACHIEVEMENTS
    ========================= */

    if (
        q.includes("achievement") ||
        q.includes("achievements")
    ) {

        return `
🏆 Some achievements of G.B. College:

• ${collegeData.achievements.join("\n• ")}
        `.trim();
    }


    /* =========================
       FACILITIES
    ========================= */

    if (
        q.includes("facility") ||
        q.includes("facilities")
    ) {

        return `
🏛️ G.B. College Facilities:

• ${collegeData.facilities.join("\n• ")}
        `.trim();
    }


    /* =========================
       STUDENT SUPPORT
    ========================= */

    if (
        q.includes("student support") ||
        q.includes("support") ||
        q.includes("hostel") ||
        q.includes("ncc") ||
        q.includes("nss")
    ) {

        return `
🎓 Student Support at G.B. College:

• ${collegeData.student_support.join("\n• ")}
        `.trim();
    }


    return null;
}
/* ==========================================
   DEMO RESPONSE
========================================== */

function generateDemoResponse(question) {

    const q =
        question.toLowerCase();


   if (
    q.includes("bca") ||
    q.includes("computer application") ||
    q.includes("bca hai") ||
    q.includes("bca h") ||
    q.includes("bca milta") ||
    q.includes("computer ka course") ||
    q.includes("computer wala course") ||
    q.includes("computer course")
) {

        return `
G.B. College, Naugachia offers courses in Science, Arts and Vocational streams.

Science:
• B.Sc. Botany
• B.Sc. Chemistry
• B.Sc. Mathematics
• B.Sc. Physics
• B.Sc. Zoology

Arts:
• B.A. Economics
• B.A. Political Science
• B.A. English
• B.A. Hindi
• B.A. History
• B.A. Philosophy
• B.A. Urdu

Vocational:
• BCA
• IFF

Once Gemini API is connected, I’ll be able to answer more naturally in English, Hindi and Hinglish.
        `.trim();
    }


    if (
        q.includes("library")
    ) {

        return `
G.B. College has a library designed to support academic learning, research and personal development.

The available information mentions textbooks, reference books, journals, magazines, newspapers and e-resources along with digital access and reading facilities.
        `.trim();
    }


    if (
        q.includes("about") ||
        q.includes("college")
    ) {

        return `
G.B. College, Naugachia is a constituent unit of T.M. Bhagalpur University, Bhagalpur.

The college focuses on academic education, research, skill development and holistic student development. It offers programs across Arts, Science and Vocational areas.

I can also tell you about its courses, departments, library and other available information.
        `.trim();
    }


    if (
        q.includes("admission") ||
        q.includes("apply")
    ) {

        return `
I can help you with admission-related information available in the college data.

For current admission dates, eligibility and official instructions, we will later connect the chatbot with verified/current college information so that important dates are not guessed.
        `.trim();
    }


    return `
👋 I understand your question!

Right now I'm running in Demo Mode, so I can answer only the information we've added to my local college knowledge base.

🤖 In the next phase, we'll connect me with Gemini API. Then I'll be able to understand and answer a much wider range of questions in English, Hindi and Hinglish.
    `.trim();
}
/* ==========================================
   🎤 VOICE INPUT
========================================== */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {

    const recognition =
        new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    // Hindi + English/Hinglish friendly
    recognition.lang = "en-IN";


    micBtn.addEventListener("click", () => {

        try {

            recognition.start();

            micBtn.classList.add("listening");

            micBtn.innerHTML =
                '<i class="fa-solid fa-microphone-lines"></i>';

            micBtn.title = "Listening...";

        } catch (error) {

            console.log(
                "Microphone is already active."
            );
        }
    });


    recognition.onresult = (event) => {

        const transcript =
            event.results[0][0].transcript;

        console.log(
            "🎤 User said:",
            transcript
        );


        messageInput.value =
            transcript;


        // Resize textarea
        messageInput.style.height = "auto";

        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                120
            ) + "px";


        // Automatically send message
        sendMessage(transcript);
    };


    recognition.onend = () => {

        micBtn.classList.remove(
            "listening"
        );

        micBtn.innerHTML =
            '<i class="fa-solid fa-microphone"></i>';

        micBtn.title = "Speak";
    };


    recognition.onerror = (event) => {

        console.error(
            "🎤 Speech recognition error:",
            event.error
        );

        micBtn.classList.remove(
            "listening"
        );

        micBtn.innerHTML =
            '<i class="fa-solid fa-microphone"></i>';

        micBtn.title = "Speak";
    };


} else {

    console.warn(
        "Speech Recognition is not supported in this browser."
    );

    micBtn.disabled = true;

    micBtn.title =
        "Voice input is not supported in this browser.";
}


/* ==========================================
   🔊 VOICE CONTROLS
========================================== */

let voiceEnabled = true;
let voicePaused = false;


/* ==========================================
   🔊 VOICE ON / OFF = PAUSE / RESUME
========================================== */

voiceToggle.addEventListener("click", () => {

    /* =========================
       AI IS CURRENTLY SPEAKING
    ========================= */

    if (window.speechSynthesis.speaking) {

        if (!window.speechSynthesis.paused) {

            // Pause voice
            window.speechSynthesis.pause();

            voicePaused = true;

            voiceToggle.innerHTML =
                '<i class="fa-solid fa-volume-xmark"></i>';

            voiceToggle.title =
                "Resume Voice";

            console.log("⏸️ AI voice paused.");

        } else {

            // Resume voice
            window.speechSynthesis.resume();

            voicePaused = false;

            voiceToggle.innerHTML =
                '<i class="fa-solid fa-volume-high"></i>';

            voiceToggle.title =
                "Pause Voice";

            console.log("▶️ AI voice resumed.");
        }

        return;
    }


    /* =========================
       NO SPEECH CURRENTLY
    ========================= */

    voiceEnabled = !voiceEnabled;


    if (!voiceEnabled) {

        voiceToggle.innerHTML =
            '<i class="fa-solid fa-volume-xmark"></i>';

        voiceToggle.title =
            "Turn Voice On";

    } else {

        voiceToggle.innerHTML =
            '<i class="fa-solid fa-volume-high"></i>';

        voiceToggle.title =
            "Turn Voice Off";
    }

});


/* ==========================================
   ⏹️ STOP CURRENT SPEECH
========================================== */

stopVoice.addEventListener("click", () => {

    window.speechSynthesis.cancel();

    voicePaused = false;

    hideSpeakingIndicator();

    voiceToggle.innerHTML =
        '<i class="fa-solid fa-volume-high"></i>';

    voiceToggle.title =
        "Pause Voice";

    console.log("⏹️ AI voice completely stopped.");

});


/* ==========================================
   🤖 SPEAKING INDICATOR
========================================== */

function showSpeakingIndicator() {

    speakingIndicator.style.display =
        "flex";
}


function hideSpeakingIndicator() {

    speakingIndicator.style.display =
        "none";
}


/* ==========================================
   🔊 AI VOICE RESPONSE
========================================== */

let currentSpeech = null;

function speakAIResponse(text) {

    if (!voiceEnabled) {
        return;
    }

    // Stop previous speech
    window.speechSynthesis.cancel();

    // Remove emojis and formatting
    const cleanText = text
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
        .replace(/[*#•]/g, "")
        .replace(/\n+/g, ". ")
        .trim();

    currentSpeech =
        new SpeechSynthesisUtterance(cleanText);

    /*
       Find suitable Indian English voice
    */

    const voices =
        window.speechSynthesis.getVoices();

    const indianVoice =
        voices.find(voice =>
            voice.lang === "en-IN" &&
            /female|zira|heera|priya|raveena/i.test(voice.name)
        ) ||
        voices.find(voice =>
            voice.lang === "en-IN"
        ) ||
        voices.find(voice =>
            voice.lang.startsWith("en-IN")
        );

    if (indianVoice) {

        currentSpeech.voice =
            indianVoice;

        console.log(
            "🎙️ Selected voice:",
            indianVoice.name,
            indianVoice.lang
        );
    }

    currentSpeech.lang = "en-IN";

    // 🔊 Slightly faster and natural
    currentSpeech.rate = 1.20;

    // 👩 Slightly higher pitch
    currentSpeech.pitch = 1.05;

    currentSpeech.volume = 1;

    /* =========================
       SPEECH START
    ========================= */

    currentSpeech.onstart = () => {

        console.log(
            "🔊 AI started speaking..."
        );

        showSpeakingIndicator();
    };


    /* =========================
       SPEECH END
    ========================= */

    currentSpeech.onend = () => {

        console.log(
            "🔊 AI finished speaking."
        );

        hideSpeakingIndicator();

        currentSpeech = null;
    };


    /* =========================
       SPEECH ERROR
    ========================= */

    currentSpeech.onerror = (error) => {

        console.error(
            "🔊 Speech error:",
            error
        );

        hideSpeakingIndicator();

        currentSpeech = null;
    };


    /* =========================
       START SPEECH
    ========================= */

    window.speechSynthesis.speak(
        currentSpeech
    );
}

/* ==========================================
   SIDEBAR NAVIGATION
========================================== */

const navItems =
    document.querySelectorAll(".nav-item");

const coursesNav =
    document.getElementById("coursesNav");

const admissionNav =
    document.getElementById("admissionNav");

const libraryNav =
    document.getElementById("libraryNav");


/* =========================
   ACTIVE NAVIGATION
========================= */

function setActiveNav(button) {

    navItems.forEach(item => {

        item.classList.remove("active");

    });

    button.classList.add("active");
}


/* =========================
   AI ASSISTANT
========================= */

navItems[0].addEventListener("click", () => {

    setActiveNav(navItems[0]);

    messageInput.focus();

});


/* =========================
   COURSES
========================= */

coursesNav.addEventListener("click", () => {

    setActiveNav(coursesNav);

    sendMessage(
        "G.B. College me kaun kaun se courses available hain?"
    );

});


/* =========================
   ADMISSIONS
========================= */

admissionNav.addEventListener("click", () => {

    setActiveNav(admissionNav);

    sendMessage(
        "G.B. College me admission ke baare me batao."
    );

});


/* =========================
   LIBRARY
========================= */

libraryNav.addEventListener("click", () => {

    setActiveNav(libraryNav);

    sendMessage(
        "G.B. College library ke baare me batao."
    );

});

