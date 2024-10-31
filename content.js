'use strict';

const app = {};

app.getLastElementByClass = function(className) {
    const elements = document.getElementsByClassName(className);
    return elements.length > 0 ? elements[elements.length - 1] : null;
};

app.getLastDefinitionByChatGpt = function() {
    return this.getLastElementByClass(this.CHAT_GPT_LAST_CONVERSATION_CLASS_NAME);
};

app.parseLastDefinition = function(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const term = doc.querySelector(this.CHAT_GPT_TERM_SELECTOR).nextSibling.textContent.trim();
    const ipa = doc.querySelector(this.CHAT_GPT_IPA_SELECTOR).nextSibling.textContent.trim();
    const definitionPhraseText = doc.querySelector(this.CHAT_GPT_PHRASE_DEFINITION_SELECTOR).nextSibling.textContent.trim();

    const phraseMatch = definitionPhraseText.match(/In the phrase "(.*?)"/);
    const definitionMatch = definitionPhraseText.match(/the term "(.*?)"(.+)/);

    return {
        phrase: phraseMatch ? phraseMatch[1] : '',
        term: term,
        ipa: ipa,
        definition: definitionMatch ? 'the term ' + definitionMatch[2].trim() : ''
    };
};

app.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(function() {
        console.log('Text copied to clipboard', text);
    }).catch(function(error) {
        alert('Error copying text: ', error);
    });
};

app.getElementTextByStyle = function() {
    const elements = document.querySelectorAll(this.PRIME_SUBTITLE_TERM_SELECTOR);
    if (elements.length == 0) {
        return alert("Não foi possível obter legenda ativa.");
    }
    return elements[0].innerText || elements[0].textContent || "Elemento encontrado, mas sem texto.";
};

app.copyDefinitionToClipboard = function(event) {
    const lastDefinition = this.getLastDefinitionByChatGpt();
    const definition = lastDefinition ? this.parseLastDefinition(lastDefinition.innerHTML) : {};

    if (event.ctrlKey && event.altKey && event.key === 'x') {
        event.preventDefault();
        return this.copyToClipboard(definition.phrase);
    }

    if (event.ctrlKey && event.altKey && event.key === 'c') {
        event.preventDefault();
        return this.copyToClipboard(`${definition.term.toLowerCase()} ${definition.ipa}\n${definition.definition}`);
    }
};

app.copyPhraseToClipboard = function(event) {
    if (event.ctrlKey && event.altKey && event.key === 'x') {
        const elementText = this.getElementTextByStyle();
        return this.copyToClipboard(elementText);
    }
};

app.handleKeyDown = function(event) {
    if (window.location.href.includes('primevideo')) {
        return this.copyPhraseToClipboard(event);
    }
    
    if (window.location.href.includes('chatgpt')) {
        return this.copyDefinitionToClipboard(event);
    }
};

app.start = function() {
    document.addEventListener('keydown', this.handleKeyDown.bind(app));
};

Object.defineProperties(app, {
    'CHAT_GPT_LAST_CONVERSATION_CLASS_NAME': {
        value: 'group/conversation-turn',
        writable: false,
    },
    'CHAT_GPT_TERM_SELECTOR': {
        value: 'p strong',
        writable: false,
    },
    'CHAT_GPT_IPA_SELECTOR': {
        value: 'p strong + br + strong',
        writable: false,
    },
    'CHAT_GPT_PHRASE_DEFINITION_SELECTOR': {
        value: 'p strong + br + strong + br + strong',
        writable: false,
    },
    'PRIME_SUBTITLE_TERM_SELECTOR': {
        value: '[style="background-color: rgb(102, 102, 102);"]',
        writable: false,
    },
});

app.start();