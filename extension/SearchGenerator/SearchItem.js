class SearchItem {
    id;
    type; // ''word' or 'operator'
    value;

    constructor(type, value) {

        this.id = crypto.randomUUID();
        this.type = type;
        this.value = value;

    }

    toHTMLElement() {
        return `<div id='${this.id}' class=' px-2 p-1 text-xs rounded-md ${this.type === 'word' ? 'selected-word search-word' : 'operator'}'>${this.value}</div>`;
    }
}