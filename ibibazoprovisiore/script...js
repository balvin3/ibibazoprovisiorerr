let current = 0;
let totalTime = 20 * 60; // Iminota 20 y'ikizamini
let timer;
let questions = [];

// ================= START INITIALIZATION =================
document.addEventListener("DOMContentLoaded", function() {
    // Fata ibibazo byose biri muri paji (byoherejwe na Flask binyuze kuri Jinja)
    questions = document.querySelectorAll(".question");

    if (questions.length > 0) {
        createPalette();
        showQuestion();
        startTimer();
        setupRadioListeners();
    } else {
        console.warn("Nta bibazo bibonetse kuri iyi paji.");
    }
});

// ================= SHOW QUESTION =================
function showQuestion() {
    if (questions.length === 0) return;

    questions.forEach(function(q) {
        q.classList.remove("active");
        q.style.display = "none"; // Guhisha ibibazo byose
    });

    // Kwerekana ikibazo kigezweho gusa
    questions[current].classList.add("active");
    questions[current].style.display = "block";

    // Guhindura umubare w'ikibazo kigezweho
    const counter = document.getElementById("counter");
    if (counter) {
        counter.innerHTML = `Ikibazo ${current + 1} / ${questions.length}`;
    }

    // Gucunga utubuto tw'icyerekezo (Previous, Next, Finish)
    let prevBtn = document.getElementById("prevBtn");
    let nextBtn = document.getElementById("nextBtn");
    let finishBtn = document.getElementById("finishBtn");

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

    questions.forEach(function(q) {
        let answer = q.querySelector("input[type=radio]:checked");
        if (answer) {
            // Kugenzura niba igisubizo cyatowe gihuye n'icyo muri Database (data-correct)
            if (answer.value === answer.dataset.correct) {
                score++;
            }
        }
    });

    // Kohereza amanota kuri Flask Backend ukoresheje AJAX (Fetch API)
    fetch('/save_result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score: score })
    })
    .then(response => response.json())
    .then(data => {
        if (data.saved) {
            // Kwerekeza kuri paji y'amanota (result.html)
            window.location.href = "/result";
        } else {
            alert("Habaye ikibazo mu kubika amanota, ariko urahita ujyanwa ku ntsinzi.");
            window.location.href = "/result";
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        window.location.href = "/result";
    });
}

// ================= TIMER CONFIGURATION =================
function startTimer() {
    const timerBox = document.getElementById("timer");

    timer = setInterval(function() {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;

        if (seconds < 10) seconds = "0" + seconds;
        if (minutes < 10) minutes = "0" + minutes;

        if (timerBox) {
            timerBox.innerHTML = `⏱️ Igihe gisigaye: ${minutes}:${seconds}`;
        }
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
        btn.type = "button"; // Birinda ko form yokoherezwa mu buryo butunguranye

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

    // Gushyira ibara ryihariye ku kibazo umukoresha ariho ubu
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