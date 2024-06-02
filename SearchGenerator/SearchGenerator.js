class SearchGenerator {
  constructor(arrayData) {
    this.arrayData = arrayData;
  }

  generateHTML() {
    const generator = this;
    const datas = this.arrayData;

    const words = [];
    const selectedWords = [];

    document.getElementById("words-container").innerHTML = ''; // Clean

    Object.keys(datas).forEach(function (key) {
      if (key !== 'search_base' && datas[key] instanceof Array) {
        generator.generateDropdown(datas[key], key);

        words.push(datas[key]);
      } else if (key === 'search_base') {
        selectedWords.push(datas[key]);
      }
    });

    new SearchManager(words, selectedWords);
  }

  generateDropdown(words, key) {
    let html = `<div class="dropdown-words"><b>${key}</b>`;

    for (let word of words) {
      html += `<div class="word" data-word="${word}">${word}</div>`;
    }

    html += "</div>";

    document.getElementById("words-container").innerHTML += html;
  }
}
