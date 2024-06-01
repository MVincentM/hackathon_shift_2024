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

    let html = `            
    <div class="dropdown-words mt-2">
      <h3 class="text-xs text-gray-400 capitalize">${key}</h3>
      <ul class="mt-1 flex gap-1 flex-wrap">
    `

    for (let word of words) {
      html += `        
      <li class="px-2 p-1 text-xs word-unselected rounded-md" data-word="${word}">${word}</li>
      `;
    }

    html += "</ul>";

    document.getElementById("words-container").innerHTML += html;
  }
}
