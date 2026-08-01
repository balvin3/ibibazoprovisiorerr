let current = 0;
const questions = document.querySelectorAll(".question");
let totalTime = 20 * 60; // Iminota 20 y'ikizamini
let timer;

// ================= START INITIALIZATION =================
document.addEventListener("DOMContentLoaded", function() {
    createPalette();
    showQuestion();
    startTimer();
    setupRadioListeners();
});

// ================= SHOW QUESTION =================
function showQuestion() {
    questions.forEach(function(q) {
        q.classList.remove("active");
    });

    if (questions[current]) {
        questions[current].classList.add("active");
    }

    // Guhindura umubare w'ikibazo kigezweho
    const counterEl = document.getElementById("counter");
    if (counterEl) {
        counterEl.innerHTML = `Ikibazo ${current + 1} / ${questions.length}`;
    }

    // Gucunga utubuto tw'icyerekezo
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const finishBtn = document.getElementById("finishBtn");

    if (prevBtn) prevBtn.style.display = (current === 0) ? "none" : "block";
    if (nextBtn) nextBtn.style.display = (current === questions.length - 1) ? "none" : "block";
    if (finishBtn) finishBtn.style.display = (current === questions.length - 1) ? "block" : "none";

    updatePalette();
    updateProgress();
}

// ================= NEXT QUESTION =================
function nextQuestion() {
    let answer = questions[current].querySelector("input[type=radio]:checked");

    if (!answer) {
        alert("Banza uhitemo igisubizo cy'iki kibazo.");
        return;
    }

    if (current < questions.length - 1) {
        current++;
        showQuestion();
    }
}

// ================= PREVIOUS QUESTION =================
function previousQuestion() {
    if (current > 0) {
        current--;
        showQuestion();
    }
}

// ================= FINISH QUIZ =================
function finishQuiz() {
    clearInterval(timer);
    let score = 0;
    let reviewList = [];

    questions.forEach(function(q) {
        let answer = q.querySelector("input[type=radio]:checked");
        
        // Gufata amakuru y'ibibazo n'ibisubizo kugira ngo review page ibibone
        let qText = q.querySelector("h2") ? q.querySelector("h2").innerText : "";
        let imgTag = q.querySelector("img");
        let imgSrc = imgTag ? imgTag.getAttribute("src") : "";
        
        let labels = q.querySelectorAll(".option-label");
        let ans1 = labels[0] ? labels[0].innerText : "";
        let ans2 = labels[1] ? labels[1].innerText : "";
        let ans3 = labels[2] ? labels[2].innerText : "";
        let ans4 = labels[3] ? labels[3].innerText : "";
        
        // Gushaka dataset.correct kuva kuri radio button yaba yatoranyijwe cyangwa iyindi iyo ari yo yose muri iyo question
        let targetRadio = q.querySelector("input[type=radio]");
        let correctVal = targetRadio ? targetRadio.dataset.correct : "";

        if (answer) {
            if (answer.value === answer.dataset.correct) {
                score++;
            }
        }

        reviewList.push({
            question: qText,
            image: imgSrc,
            answer1: ans1,
            answer2: ans2,
            answer3: ans3,
            answer4: ans4,
            correct: correctVal
        });
    });

    // Kubika amanota n'ibisubizo muri localStorage
    localStorage.setItem("provisoire_score", score);
    localStorage.setItem("provisoire_total", questions.length);
    localStorage.setItem("provisoire_last_review", JSON.stringify(reviewList));

    // Kwerekeza kuri paji y'amanota ya static
    window.location.href = "result.html";
}

// ================= TIMER CONFIGURATION =================
function startTimer() {
    const timerBox = document.getElementById("timer");
    if (!timerBox) return;

    timer = setInterval(function() {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;

        if (seconds < 10) seconds = "0" + seconds;
        if (minutes < 10) minutes = "0" + minutes;

        timerBox.innerHTML = `⏱️ Igihe gisigaye: ${minutes}:${seconds}`;
        totalTime--;

        if (totalTime < 0) {
            clearInterval(timer);
            alert("Igihe cyo gukora ikizamini kirangiye!");
            finishQuiz();
        }
    }, 1000);
}

// ================= CREATE QUESTION PALETTE =================
function createPalette() {
    const palette = document.getElementById("palette");
    if (!palette) return;
    
    palette.innerHTML = "";

    for (let i = 0; i < questions.length; i++) {
        let btn = document.createElement("button");
        btn.innerHTML = i + 1;
        btn.className = "notAnswered";
        btn.type = "button";

        btn.onclick = function() {
            current = i;
            showQuestion();
        };

        palette.appendChild(btn);
    }
}

// ================= UPDATE PALETTE STATUS =================
function updatePalette() {
    const buttons = document.querySelectorAll("#palette button");
    if (buttons.length === 0) return;

    questions.forEach(function(q, index) {
        let checked = q.querySelector("input[type=radio]:checked");

        if (buttons[index]) {
            if (checked) {
                buttons[index].className = "answered";
            } else {
                buttons[index].className = "notAnswered";
            }
        }
    });

    if (buttons[current]) {
        buttons[current].classList.add("current");
    }
}

// ================= UPDATE PROGRESS BAR =================
function updateProgress() {
    let answered = 0;

    questions.forEach(function(q) {
        if (q.querySelector("input[type=radio]:checked")) {
            answered++;
        }
    });

    let percent = (answered / questions.length) * 100;
    
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");

    if (progressBar) progressBar.style.width = percent + "%";
    if (progressText) progressText.innerHTML = `${answered} / ${questions.length} Byasubijwe`;
}

// ================= AUTOMATED LISTENERS FOR RADIO BUTTONS =================
function setupRadioListeners() {
    const radios = document.querySelectorAll("input[type=radio]");
    radios.forEach(function(radio) {
        radio.addEventListener("change", function() {
            updatePalette();
            updateProgress();
        });
    });
}
