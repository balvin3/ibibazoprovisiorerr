document.addEventListener("DOMContentLoaded", function() {
    loadQuestions();
    updateStats();

    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const questionText = document.querySelector('textarea[name="question"]').value;
            const ans1 = document.querySelector('input[name="answer1"]').value;
            const ans2 = document.querySelector('input[name="answer2"]').value;
            const ans3 = document.querySelector('input[name="answer3"]').value;
            const ans4 = document.querySelector('input[name="answer4"]').value;
            const correct = document.querySelector('select[name="correct"]').value;
            
            const imageInput = document.querySelector('input[name="image"]');
            let imageUrl = "";
            
            if (imageInput && imageInput.files && imageInput.files[0]) {
                imageUrl = URL.createObjectURL(imageInput.files[0]);
            }

            const newQuestion = {
                id: Date.now(),
                question: questionText,
                image: imageUrl,
                answer1: ans1,
                answer2: ans2,
                answer3: ans3,
                answer4: ans4,
                correct: correct
            };

            let questions = JSON.parse(localStorage.getItem("provisoire_questions")) || [];
            questions.unshift(newQuestion);
            localStorage.setItem("provisoire_questions", JSON.stringify(questions));

            alert("Ikibazo cyongerewe neza!");
            form.reset();
            loadQuestions();
            updateStats();
        });
    }
});

function loadQuestions() {
    const container = document.querySelector(".questions-list");
    if (!container) return;

    let questions = JSON.parse(localStorage.getItem("provisoire_questions")) || [];
    
    if (questions.length === 0) {
        container.innerHTML = "<p>Nta bibazo birimo muri system.</p>";
        return;
    }

    container.innerHTML = "";
    questions.forEach((q, index) => {
        const item = document.createElement("div");
        item.className = "question-item";
        item.innerHTML = `
            <h3><strong>${index + 1}.</strong> ${q.question}</h3>
            ${q.image ? `<img src="${q.image}" class="question-img" alt="Question Image">` : ''}
            <div class="options-grid">
                <div>A. ${q.answer1}</div>
                <div>B. ${q.answer2}</div>
                ${q.answer3 ? `<div>C. ${q.answer3}</div>` : ''}
                ${q.answer4 ? `<div>D. ${q.answer4}</div>` : ''}
            </div>
            <span class="correct-ans">✅ Icy'ukuri: ${q.correct === '1' ? 'A' : q.correct === '2' ? 'B' : q.correct === '3' ? 'C' : 'D'}</span>
            <div class="action-btns">
                <button onclick="deleteQuestion(${q.id})" class="delete">🗑 Siba</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function deleteQuestion(id) {
    if (confirm("Ese urashaka gusiba iki kibazo koko?")) {
        let questions = JSON.parse(localStorage.getItem("provisoire_questions")) || [];
        questions = questions.filter(q => q.id !== id);
        localStorage.setItem("provisoire_questions", JSON.stringify(questions));
        loadQuestions();
        updateStats();
    }
}

function updateStats() {
    let questions = JSON.parse(localStorage.getItem("provisoire_questions")) || [];
    const countSpan = document.getElementById("total-questions-count");
    if (countSpan) {
        countSpan.innerText = questions.length;
    }
}
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
