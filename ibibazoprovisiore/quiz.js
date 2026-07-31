let current = 0;
let questions = [];
let totalTime = 20 * 60; // Iminota 20 y'ikizamini
let timer;

// ================= START INITIALIZATION =================
document.addEventListener("DOMContentLoaded", function() {
    loadQuizQuestions();
});

// Gukurura ibibazo muri localStorage cyangwa se ibiba biri muri paji
function loadQuizQuestions() {
    // Reba niba hari ibibazo byashyizweho na admin muri localStorage
    let storedQuestions = JSON.parse(localStorage.getItem("quizQuestions")) || JSON.parse(localStorage.getItem("adminQuestions"));
    
    const container = document.getElementById("quizContainer") || document.body;

    if (storedQuestions && storedQuestions.length > 0) {
        // Niba bihari muri localStorage, tubibyaze HTML muri dynamic
        let htmlContent = "";
        storedQuestions.forEach((q, index) => {
            let imageTag = "";
            if (q.image && q.image !== "None" && q.image.trim() !== "") {
                let imgSrc = q.image.startsWith("http") || q.image.startsWith("data:") 
                    ? q.image 
                    : `https://res.cloudinary.com/du7r7iqwf/image/upload/${q.image}`;
                imageTag = `<img src="${imgSrc}" class="question-img" alt="Ifoto y'ikibazo" style="max-width:200px; display:block; margin:10px 0;">`;
            }

            htmlContent += `
                <div class="question" data-index="${index}" style="display: none;">
                    <h3>Ikibazo ${index + 1}: ${q.question}</h3>
                    ${imageTag}
                    <div class="options-group">
                        <label><input type="radio" name="q_${index}" value="1" data-correct="${q.correct}"> A. ${q.answer1}</label><br>
                        <label><input type="radio" name="q_${index}" value="2" data-correct="${q.correct}"> B. ${q.answer2}</label><br>
                        ${q.answer3 ? `<label><input type="radio" name="q_${index}" value="3" data-correct="${q.correct}"> C. ${q.answer3}</label><br>` : ''}
                        ${q.answer4 ? `<label><input type="radio" name="q_${index}" value="4" data-correct="${q.correct}"> D. ${q.answer4}</label>` : ''}
                    </div>
                </div>
            `;
        });
        
        // Injiza ibibazo muri container (ukeneye kuba ufite <div id="quizContainer"></div> muri quiz.html yawe)
        let quizBox = document.getElementById("quizContainer");
        if (quizBox) {
            quizBox.innerHTML = htmlContent;
        }
    }

    // Fata ibibazo byose bihari kuri paji
    window.questionsList = document.querySelectorAll(".question");
    
    if (window.questionsList.length > 0) {
        createPalette();
        showQuestion();
        startTimer();
        setupRadioListeners();
    } else {
        alert("Nta bibazo bibonetse muri Quiz! Banza wongeremo ibibazo kuri Dashboard.");
    }
}

// ================= SHOW QUESTION =================
function showQuestion() {
    const questions = document.querySelectorAll(".question");
    if (questions.length === 0) return;

    questions.forEach(function(q) {
        q.style.display = "none";
    });

    questions[current].style.display = "block";

    // Guhindura umubare w'ikibazo kigezweho
    const counter = document.getElementById("counter");
    if (counter) {
        counter.innerHTML = `Ikibazo ${current + 1} / ${questions.length}`;
    }

    // Gucunga utubuto tw'icyerekezo
    let prevBtn = document.getElementById("prevBtn");
    let nextBtn = document.getElementById("nextBtn");
    let finishBtn = document.getElementById("finishBtn");

    if (prevBtn) prevBtn.style.display = (current === 0) ? "none" : "inline-block";
    if (nextBtn) nextBtn.style.display = (current === questions.length - 1) ? "none" : "inline-block";
    if (finishBtn) finishBtn.style.display = (current === questions.length - 1) ? "inline-block" : "none";

    updatePalette();
    updateProgress();
}

// ================= NEXT QUESTION =================
function nextQuestion() {
    const questions = document.querySelectorAll(".question");
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
    const questions = document.querySelectorAll(".question");
    let reviewData = [];

    questions.forEach(function(q, index) {
        let answer = q.querySelector("input[type=radio]:checked");
        let correctVal = q.querySelector("input[type=radio]").dataset.correct;
        let questionText = q.querySelector("h3").innerText;
        let imgEl = q.querySelector("img");
        let imgSrc = imgEl ? imgEl.src : "";

        if (answer) {
            if (answer.value === correctVal) {
                score++;
            }
        }

        // Kubika amakuru yo gukorera review nyuma
        reviewData.push({
            question: questionText,
            image: imgSrc,
            correct: correctVal
        });
    });

    localStorage.setItem("score", score);
    localStorage.setItem("totalQuestions", questions.length);
    localStorage.setItem("reviewData", JSON.stringify(reviewData));

    // Kwerekeza kuri paji y'amanota (result.html)
    window.location.href = "result.html";
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
    const questions = document.querySelectorAll(".question");
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
    const questions = document.querySelectorAll(".question");
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
    const questions = document.querySelectorAll(".question");
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