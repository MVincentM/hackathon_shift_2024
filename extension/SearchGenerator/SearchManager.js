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

        console.log(document.getElementById('copy-clipboard'));

        document.getElementById('copy-clipboard').addEventListener('click', () => {
            this.copyToClipboard();
        })
    }

    onClickWord(el) {
        const word = el.innerHTML;

        console.log(word);
        if (this.isSelected(word)) {
            // Search
            const id = this.searchItems.find(i => i.value === word).id;

            const searchEl = document.getElementById(id);
            console.log(searchEl);
            this.onClickSelectedWord(searchEl);
        } else {
            this.searchItems.push(new SearchItem('operator', 'OR'));
            this.searchItems.push(new SearchItem('word', word));
        }

        this.regenerateSearch();
    }

    isSelected(word) {
        return (this.searchItems.some(i => i.value === word));
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
        // Set CSS class
        for(let word of this.selectedWords) {
            const el = document.querySelector(`[data-word="${word}"]`);

            if(el == null)
                continue;

            el.classList.remove('word-unselected');
            el.classList.add('word-selected');
        }

        for (let i = 0; i < this.selectedWords.length; i++) {
            // If the LLM returns in search_base terms that does not exist in other filters
            const el = document.querySelector(`[data-word="${this.selectedWords[i]}"]`);
            if(el == null)
                continue;

            this.searchItems.push(new SearchItem('word', this.selectedWords[i])); // Add word

            if (i === this.selectedWords.length - 1) {
                break;
            }

            this.searchItems.push(new SearchItem('operator', 'OR')); // Add operator
        }

        for (let item of this.searchItems) {
            this.currentSearch += item.toHTMLElement();
        }

        document.getElementById('generated-search').innerHTML = this.currentSearch;

        // Set CSS class
        for(let word of this.selectedWords) {
            const el = document.querySelector(`[data-word="${word}"]`);
            console.log((el));

            if(el == null)
                continue;

            el.classList.remove('word-unselected');
            el.classList.add('word-selected');
        }

        // Add events
        this.addEvents();
    }

    regenerateSearch2() {
        this.currentSearchElements = [];
        this.currentSearch = '';


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

    regenerateSearch() {
        console.log(this.searchItems);
        //this.currentSearchElements = [];
        this.currentSearch = '';

        const wordElements = document.getElementsByClassName('word');

        for(let el of wordElements) {
            const elWord = el.getAttribute(`data-word`);

            console.log(elWord);
            if (this.isSelected(elWord)) {
                el.classList.remove('word-unselected');
                el.classList.add('word-selected');
            } else {
                el.classList.add('word-unselected');
                el.classList.remove('word-selected');
            }

            console.log(el.classList);
        }

        for (let item of this.searchItems) {
            this.currentSearch += item.toHTMLElement();
        }

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
        console.log(el.id);
        const current = el.innerHTML;

        const id = el.id;

        const item = this.searchItems.find(i => i.id === id);

        switch(current) {
            case 'OR' : el.innerHTML = 'AND'; item.value = 'AND'; break;
            case 'AND' : el.innerHTML = 'NOT'; item.value = 'NOT'; break;
            case 'NOT' : el.innerHTML = 'OR';  item.value = 'OR'; break;
            default: el.innerHTML = 'OR'; item.value = 'OR';
        }
    }

    onClickSelectedWord2(el) {
        console.log(el.id);
        const word = el.innerHTML;
        const id = el.id;

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

    onClickSelectedWord(el) {
        console.log(el.id);
        const word = el.innerHTML;
        const id = el.id;

        if (!this.isSelected(word)) {
            return;
        }

        //this.getCurrentOperators();

        console.log('BEFORE', this.searchItems);
        const index = this.searchItems.indexOf(this.searchItems.find(i => i.id === id));

        if (index === this.searchItems.length - 1) {
            this.searchItems.splice(index - 1, 2);
        } else if (index === 0) {
            this.searchItems.splice(index, 2);
        } else {
            this.searchItems.splice(index - 1, 2);
        }

        console.log('AFTER', this.searchItems);

        // If last
        /*if (index === this.selectedWords.length - 1) {
            console.log('IS LAST');
            this.operatorElements.splice(index - 1, 2);
        } else if (index === 0) {
            console.log('IS FIRST');
            this.operatorElements.splice(index, 2);
        } else {
            this.operatorElements.splice(index - 1, 1);
        }

        this.selectedWords.splice(index, 1);*/
        
        
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

    copyToClipboard() {
        let search = '';

        for (let item of this.searchItems) {
            search += item.value + ' ';
        }


        navigator.clipboard.writeText(search);
    }
}