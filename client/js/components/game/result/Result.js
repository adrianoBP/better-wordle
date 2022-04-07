class Result {
  constructor(gameElement) {
    // Main container
    this.boardElement = document.createElement('div');
    this.boardElement.id = 'result-component';
    this.boardElement.style.display = 'none';

    // Result text
    this.resultElement = document.createElement('div');
    this.resultElement.id = 'result-text';

    // Button containing the word
    this.wordElement = document.createElement('div');
    this.wordElement.id = 'result-word';
    this.wordElement.classList.add('shadow');

    this.wordElement.addEventListener('click', () => {
      window.open(`https://google.com/search?q=${this.wordElement.textContent}+meaning`);
    });

    this.boardElement.appendChild(this.resultElement);
    this.boardElement.appendChild(this.wordElement);
    gameElement.appendChild(this.boardElement);
  }

  show(word, gameWon) {
    if (gameWon) {
      this.resultElement.textContent = 'You won!';
    } else {
      this.resultElement.textContent = 'You lost!';
    }

    this.wordElement.textContent = word;
    this.boardElement.style.display = 'block';
  }

  hide() {
    this.boardElement.style.display = 'none';
  }
}

export default Result;
