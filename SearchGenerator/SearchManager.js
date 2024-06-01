class SearchManager {

    static Instance;

    words;
    selectedWords;

    constructor(words) {
        SearchManager.Instance = this;

        this.words = words

        const els = document.getElementsByClassName('word');

        for (let el of els) {
            console.log(el);
            el.addEventListener('click', (ev) => {
                console.log(ev.target.innerHTML);
            });
        }
    }

    onClickWork(word) {
        if (this.isSelected(word)) {
            console.log('AVANT', this.selectedWords);
            this.selectedWords.splice(this.selectedWords.indexOf(word), 1);

            console.log('APRES', this.selectedWords);
        }
    }

    isSelected(word) {
        return this.selectedWords.some(w => w === word);
    }
}