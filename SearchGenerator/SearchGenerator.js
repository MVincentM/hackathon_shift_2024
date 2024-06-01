class SearchGenerator {
  constructor(arrayData) {
    this.arrayData = arrayData;
  }

  generateHTML() {
    const generator = this;
    const datas = this.arrayData;
    Object.keys(datas).forEach(function (key, index, value) {
      console.log(key);
      console.log(index);
      console.log(value);

      if (key !== "search_base" && datas[key] instanceof Array) {
        generator.generateDropdown(datas[key], key);
        for (let d of datas[key]) {
          console.log(d);
        }
      }
    });

    new SearchManager();
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
