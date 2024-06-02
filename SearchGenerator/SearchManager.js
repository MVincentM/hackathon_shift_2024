class SearchManager {

    static Instance;

    words;
    selectedWords;

    currentSearch = '';
    currentSearchElements = [];

    selectedWordEls = [];
    operatorElements = [];

    searchItems = [];

    constructor(words, selectedWords) {
        SearchManager.Instance = this;

        this.words = words;
        this.selectedWords = selectedWords[0];

        const els = document.getElementsByClassName('word');

        for (let el of els) {
            el.addEventListener('click', (ev) => {
                this.onClickWord(ev.target)
            });
        }

        this.generateSearch();
    }

    onClickWord(el) {
        const word = el.innerHTML;

        console.log(word);
        if (this.isSelected(word)) {
            //this.selectedWords.splice(this.selectedWords.indexOf(word), 1);
            this.onClickSelectedWord(el);
        } else {
            this.operatorElements.push(`<div class='operator'>OR</div>`);
            this.selectedWords.push(word);
        }

        this.regenerateSearch();
    }

    isSelected(word) {
        return this.selectedWords.some(w => w == word);
    }

    generateSearch2() {
        for (let i = 0; i < this.selectedWords.length; i++) {

            this.currentSearch += this.selectedWords[0] + i < this.selectedWords.length ? ' OR ' : '';
            this.currentSearchElements.push(`<div class='selected-word'>${this.selectedWords[i]}</div>`);

            if (i < this.selectedWords.length - 1) {
                this.currentSearchElements.push(`<div class='operator'>OR</div>`);
            }
        }

        this.currentSearchElements.forEach(el => {
            this.currentSearch += el;
        });
        

        console.log(this.currentSearch);
        document.getElementById('generated-search').innerHTML = this.currentSearch;

        // Add events
        this.addEvents();
    }

    generateSearch() {
        for (let i = 0; i < this.selectedWords.length; i++) {
            this.searchItems.push(new SearchItem('word', this.selectedWords[i])); // Add word

            if (i === this.selectedWords.length - 1) {
                break;
            }

            this.searchItems.push(new SearchItem('operator', 'OR')); // Add operator
        }

        for (let item of this.searchItems) {
            this.currentSearch += item.toHTMLElement();
        }

        console.log(this.searchItems);
        console.log(this.currentSearch);
        console.log(document.getElementById('generated-search'));

        document.getElementById('generated-search').innerHTML = this.currentSearch.toString();

        // Add events
        this.addEvents();
    }

    regenerateSearch() {
        this.currentSearchElements = [];
        this.currentSearch = '';

        //

        console.log(this.operatorElements);
        for (let i = 0; i < this.selectedWords.length; i++) {
            this.currentSearchElements.push(`<div class='selected-word'>${this.selectedWords[i]}</div>`); // Add word

            if (this.operatorElements[i]) {
                this.currentSearchElements.push(this.operatorElements[i]); // Add operator
            }
            
        }

        this.currentSearchElements.forEach(el => {
            this.currentSearch += el;
        });

        document.getElementById('generated-search').innerHTML = this.currentSearch;

        // Add events
        this.addEvents();
    }

    addEvents() {
        this.selectedWordEls = document.getElementsByClassName('selected-word');

        for (let el of this.selectedWordEls) {
            el.addEventListener('click', (ev) => {
                this.onClickSelectedWord(ev.target)
            });

        }

        //this.getCurrentOperators();
        const operatorEls = document.getElementsByClassName('operator');

        this.operatorElements = [] // Clear

        for (let el of operatorEls) {
            el.addEventListener('click', (ev) => {
                this.onClickOperator(ev.target)
            });

            this.operatorElements.push(el.outerHTML);
        }
    }

    onClickOperator(el) {
        console.log(el);
        const current = el.innerHTML;

        switch(current) {
            case 'OR' : el.innerHTML = 'AND'; break;
            case 'AND' : el.innerHTML = 'NOT'; break;
            case 'NOT' : el.innerHTML = 'OR'; break;
            default: el.innerHTML = 'OR';
        }
    }

    onClickSelectedWord(el) {
        const word = el.innerHTML;

        if (!this.isSelected(word)) {
            return;
        }

        this.getCurrentOperators();

        const index = this.selectedWords.indexOf(word);

        // If last
        if (index === this.selectedWords.length - 1) {
            console.log('IS LAST');
            this.operatorElements.splice(index - 1, 2);
        } else if (index === 0) {
            console.log('IS FIRST');
            this.operatorElements.splice(index, 2);
        } else {
            this.operatorElements.splice(index - 1, 1);
        }

        this.selectedWords.splice(index, 1);
        
        
        this.regenerateSearch();
    }

    getCurrentOperators() {
        const operatorEls = document.getElementsByClassName('operator');

        this.operatorElements = [] // Clear

        for (let el of operatorEls) {
            el.addEventListener('click', (ev) => {
                this.onClickOperator(ev.target)
            });

            this.operatorElements.push(el.outerHTML);
        }
    }
}