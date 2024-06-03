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

  generateDropdown(words, key, isSelected) {

    let html = `            
    <div class="dropdown-words mt-2">
      <h3 class="text-xs text-gray-400 capitalize">${key}</h3>
      <ul class="mt-1 flex gap-1 flex-wrap items-center">
    `

    for (let word of words) {
      console.log(word)
      html += `        
      <li class="word px-2 p-1 text-xs word-unselected rounded-md" data-word="${word}">${word}</li>
      `;
    }

    html += "</ul>";

    document.getElementById("words-container").innerHTML += html;
  }
}
