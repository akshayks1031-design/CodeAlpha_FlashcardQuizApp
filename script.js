const STORAGE_KEY = "flashlearn_cards_v1";

const sampleCards = [
  {
    question: "What does HTML stand for?",
    answer: "HyperText Markup Language. It defines the structure and content of web pages.",
    hint: "Think about the language used to structure a web page."
  },
  {
    question: "What is CSS used for?",
    answer: "Cascading Style Sheets. CSS controls how a web page looks, including colors, spacing, and layout.",
    hint: "Think about visual design rather than page structure."
  },
  {
    question: "What does JavaScript add to a website?",
    answer: "JavaScript adds interactivity and behavior, such as responding to clicks and updating content.",
    hint: "Think about what happens after a user clicks a button."
  },
  {
    question: "What is a variable in programming?",
    answer: "A named place to store a value that a program can use or change.",
    hint: "It gives a value a name so the program can refer to it."
  },
  {
    question: "What is local storage in a web browser?",
    answer: "A browser feature that stores small amounts of data on the user's device between sessions.",
    hint: "The data stays in the browser, even after the page is refreshed."
  }
];

let cards = loadCards();
let currentIndex = 0;
let showingAnswer = false;
let editingId = null;

const cardText = document.getElementById("cardText");
const cardHint = document.getElementById("cardHint");
const cardLabel = document.getElementById("cardLabel");
const cardNumber = document.getElementById("cardNumber");
const cardCount = document.getElementById("cardCount");
const progressFill = document.getElementById("progressFill");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const cardList = document.getElementById("cardList");
const totalCards = document.getElementById("totalCards");
const emptyState = document.getElementById("emptyState");
const cardForm = document.getElementById("cardForm");
const formHeading = document.getElementById("formHeading");
const questionInput = document.getElementById("questionInput");
const answerInput = document.getElementById("answerInput");
const formError = document.getElementById("formError");

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadCards() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.warn("Could not read saved flashcards:", error);
  }
  return sampleCards.map((card) => ({ ...card, id: createId() }));
}

function saveCards() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    document.getElementById("savedStatus").innerHTML =
      '<span class="status-dot"></span> Saved in this browser';
  } catch (error) {
    document.getElementById("savedStatus").textContent = "Could not save";
    console.warn("Could not save flashcards:", error);
  }
}

function renderStudyCard() {
  const hasCards = cards.length > 0;
  document.getElementById("flashcard").hidden = !hasCards;
  document.querySelector(".study-actions").hidden = !hasCards;
  document.querySelector(".progress-track").hidden = !hasCards;

  if (!hasCards) {
    cardText.textContent = "Your study set is empty.";
    cardHint.textContent = "Add a card below to start learning.";
    cardCount.textContent = "0 cards";
    cardNumber.textContent = "NO CARDS";
    cardLabel.textContent = "READY WHEN YOU ARE";
    progressFill.style.width = "0%";
    previousBtn.disabled = true;
    nextBtn.disabled = true;
    showAnswerBtn.disabled = true;
    return;
  }

  currentIndex = Math.max(0, Math.min(currentIndex, cards.length - 1));
  const card = cards[currentIndex];
  cardText.textContent = showingAnswer ? card.answer : card.question;
  cardHint.textContent = showingAnswer ? "Answer revealed — take a moment to remember it." : (card.hint || "Try to answer before revealing the card.");
  cardLabel.textContent = showingAnswer ? "ANSWER" : "QUESTION";
  cardNumber.textContent = `CARD ${String(currentIndex + 1).padStart(2, "0")}`;
  cardCount.textContent = `${currentIndex + 1} / ${cards.length}`;
  progressFill.style.width = `${((currentIndex + 1) / cards.length) * 100}%`;
  previousBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === cards.length - 1;
  showAnswerBtn.disabled = false;
  showAnswerBtn.innerHTML = showingAnswer ? 'Show question <span aria-hidden="true">↗</span>' : 'Show answer <span aria-hidden="true">↗</span>';
}

function renderCardList() {
  cardList.replaceChildren();
  emptyState.hidden = cards.length !== 0;
  totalCards.textContent = `${cards.length} ${cards.length === 1 ? "card" : "cards"} in your study set`;

  cards.forEach((card, index) => {
    const row = document.createElement("div");
    row.className = "card-row";

    const number = document.createElement("span");
    number.className = "card-index";
    number.textContent = String(index + 1).padStart(2, "0");

    const textWrap = document.createElement("div");
    textWrap.className = "card-row-text";
    const question = document.createElement("strong");
    question.textContent = card.question;
    const answer = document.createElement("span");
    answer.textContent = card.answer;
    textWrap.append(question, answer);

    const actions = document.createElement("div");
    actions.className = "card-row-actions";

    const editButton = document.createElement("button");
    editButton.className = "small-button";
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", `Edit card ${index + 1}`);
    editButton.addEventListener("click", () => openEditForm(card.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "small-button delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete card ${index + 1}`);
    deleteButton.addEventListener("click", () => deleteCard(card.id));

    actions.append(editButton, deleteButton);
    row.append(number, textWrap, actions);
    cardList.append(row);
  });
}

function renderAll() {
  renderStudyCard();
  renderCardList();
}

function openAddForm() {
  editingId = null;
  formHeading.textContent = "Add a flashcard";
  document.getElementById("saveCardBtn").textContent = "Save card";
  questionInput.value = "";
  answerInput.value = "";
  formError.textContent = "";
  cardForm.hidden = false;
  questionInput.focus();
  cardForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function openEditForm(id) {
  const card = cards.find((item) => item.id === id);
  if (!card) return;
  editingId = id;
  formHeading.textContent = "Edit flashcard";
  document.getElementById("saveCardBtn").textContent = "Update card";
  questionInput.value = card.question;
  answerInput.value = card.answer;
  formError.textContent = "";
  cardForm.hidden = false;
  questionInput.focus();
  cardForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closeForm() {
  cardForm.hidden = true;
  cardForm.reset();
  formError.textContent = "";
  editingId = null;
}

function deleteCard(id) {
  const card = cards.find((item) => item.id === id);
  if (!card) return;
  if (!window.confirm(`Delete this flashcard?\n\n"${card.question}"`)) return;

  const removedIndex = cards.findIndex((item) => item.id === id);
  cards = cards.filter((item) => item.id !== id);
  if (removedIndex < currentIndex) currentIndex -= 1;
  if (currentIndex >= cards.length) currentIndex = Math.max(0, cards.length - 1);
  showingAnswer = false;
  if (editingId === id) closeForm();
  saveCards();
  renderAll();
}

previousBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    showingAnswer = false;
    renderStudyCard();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < cards.length - 1) {
    currentIndex += 1;
    showingAnswer = false;
    renderStudyCard();
  }
});

showAnswerBtn.addEventListener("click", () => {
  if (!cards.length) return;
  showingAnswer = !showingAnswer;
  renderStudyCard();
});

document.getElementById("addCardBtn").addEventListener("click", openAddForm);
document.getElementById("cancelFormBtn").addEventListener("click", closeForm);
document.getElementById("cancelFormTextBtn").addEventListener("click", closeForm);

cardForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (!question || !answer) {
    formError.textContent = "Please enter both a question and an answer.";
    return;
  }

  if (editingId) {
    const card = cards.find((item) => item.id === editingId);
    if (card) {
      card.question = question;
      card.answer = answer;
      card.hint = "Try to answer before revealing the card.";
      currentIndex = cards.findIndex((item) => item.id === editingId);
    }
  } else {
    cards.push({ id: createId(), question, answer, hint: "Try to answer before revealing the card." });
    currentIndex = cards.length - 1;
  }

  showingAnswer = false;
  saveCards();
  renderAll();
  closeForm();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  const confirmed = window.confirm("Restore the original sample cards? Your current cards will be replaced.");
  if (!confirmed) return;
  cards = sampleCards.map((card) => ({ ...card, id: createId() }));
  currentIndex = 0;
  showingAnswer = false;
  closeForm();
  saveCards();
  renderAll();
});

renderAll();
