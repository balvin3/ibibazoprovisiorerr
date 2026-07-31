let current = 0;
let totalTime = 20 * 60; // Iminota 20 y'ikizamini
let timer;
let questions = [];

// ================= START INITIALIZATION =================
document.addEventListener("DOMContentLoaded", function() {
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
        q.style.display = "none";
    });

    questions[current].classList.add("active");
    questions[current].style.display = "block";

    const counter = document.getElementById("counter");
    if (counter) {
        counter.innerHTML = `Ikibazo ${current + 1} / ${questions.length}`;
    }

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

// ================= FINISH QUIZ (STATIC / LOCALSTORAGE) =================
function finishQuiz() {
    clearInterval(timer);
    let score = 0;
    let reviewData = [];

    questions.forEach(function(q, index) {
        let answer = q.querySelector("input[type=radio]:checked");
        
        // Fata umutwe w'ikibazo neza
        let titleEl = q.querySelector(".question-title") || q.querySelector("h3") || q.querySelector("p");
        let questionTitle = titleEl ? titleEl.innerText : `Ikibazo ${index + 1}`;
        
        let selectedValue = answer ? answer.value : null;
        
        // Shakisha inyandiko y'igisubizo umukoresha yahisemo (Label text) kugira ngo byandikwe neza kuri Result
        let userAnsweringText = null;
        let actualCorrectText = null;

        let allRadios = q.querySelectorAll("input[type=radio]");
        let actualCorrect = null;

        allRadios.forEach(function(r) {
            // Reba aho label cyangwa text y'igisubizo iri hafi y'uyu radio button
            let labelEl = q.querySelector(`label[for='${r.id}']`) || r.parentElement;
            let labelText = labelEl ? labelEl.innerText.trim() : r.value;

            if (r.checked) {
                userAnsweringText = labelText;
            }

            if (r.dataset.correct === "true" || r.hasAttribute("data-correct") || r.dataset.correct === "1") {
                actualCorrect = r.value;
                actualCorrectText = labelText;
            }
        });

        // Niba data-correct itabonetse kuri dataset, shyiraho uburyo bwo kuyisesengura niba ihari
        if (!actualCorrect) {
            allRadios.forEach(function(r) {
                if (r.dataset.correct) {
                    actualCorrect = r.dataset.correct;
                    let labelEl = q.querySelector(`label[for='${r.id}']`) || r.parentElement;
                    actualCorrectText = labelEl ? labelEl.innerText.trim() : r.value;
                }
            });
        }

        let isCorrect = false;
        if (answer && selectedValue === actualCorrect) {
            score++;
            isCorrect = true;
        }

        reviewData.push({
            questionNumber: index + 1,
            questionText: questionTitle,
            userAnswer: userAnsweringText ? userAnsweringText : (selectedValue ? selectedValue : 'Nta gisubizo watanze'),
            correctAnswer: actualCorrectText ? actualCorrectText : (actualCorrect ? actualCorrect : 'Nta cyatanzwe'),
            isCorrect: isCorrect
        });
    });

    localStorage.setItem('quiz_score', score);
    localStorage.setItem('quiz_total', questions.length);
    localStorage.setItem('current_quiz_questions', JSON.stringify(reviewData));

    window.location.href = "./result.html";
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
