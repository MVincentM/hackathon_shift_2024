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
        return `<div id='${this.id}' class='${this.type === 'word' ? 'selected-word' : 'operator'}'>${this.value}</div>`;
    }
}