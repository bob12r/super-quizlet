// Example flashcard set
let cards = [
  { front: "What is the capital of France?", back: "Paris" },
  { front: "What is 2 + 2?", back: "4" },
  { front: "What is the largest planet?", back: "Jupiter" }
];

let current = 0;
let flipped = false;

function renderCard() {
  const app = document.getElementById('app');
  const card = cards[current];
  app.innerHTML = `
    <div class="flashcard" onclick="flipCard()">
      ${flipped ? card.back : card.front}
    </div>
    <div class="controls">
      <button onclick="prevCard()" ${current === 0 ? "disabled" : ""}>Previous</button>
      <button onclick="nextCard()" ${current === cards.length - 1 ? "disabled" : ""}>Next</button>
    </div>
    <div class="card-count">Card ${current + 1} of ${cards.length}</div>
    <div style="margin-top:20px;">
      <button onclick="showAddCardForm()">Add Card</button>
    </div>
    <div id="addCardForm"></div>
  `;
}

window.flipCard = function() {
  flipped = !flipped;
  renderCard();
};

window.prevCard = function() {
  if (current > 0) { current--; flipped = false; renderCard(); }
};

window.nextCard = function() {
  if (current < cards.length - 1) { current++; flipped = false; renderCard(); }
};

window.showAddCardForm = function() {
  document.getElementById('addCardForm').innerHTML = `
    <form onsubmit="addCard(event)">
      <input type="text" placeholder="Front" id="frontInput" required style="width:45%" />
      <input type="text" placeholder="Back" id="backInput" required style="width:45%" />
      <button type="submit">Add</button>
    </form>
  `;
};

window.addCard = function(e) {
  e.preventDefault();
  const front = document.getElementById('frontInput').value;
  const back = document.getElementById('backInput').value;
  cards.push({ front, back });
  current = cards.length - 1;
  flipped = false;
  document.getElementById('addCardForm').innerHTML = '';
  renderCard();
};

renderCard();
