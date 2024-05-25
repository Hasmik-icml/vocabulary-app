document.addEventListener('DOMContentLoaded', () => {
    const wordsList = document.getElementById('words-list');
    const checkResults = document.getElementById('check-results');
    const showWordsButton = document.getElementById('show-words');
    const newWordsButton = document.getElementById('new-word');
    const newWordInput = document.getElementById('newWordInput');
    const translateInput = document.getElementById('translateInput');
    const resetButton = document.getElementById('reset');
    console.log(showWordsButton)

    async function fetchWords() {
        const response = await fetch('/api/words');
        const words = await response.json();
        console.log(words)
        wordsList.innerHTML = words.map(word => `
            <div>
                <span>${word}</span>
                <input type="text" data-word="${word}" placeholder="Translate">
                <button class="check-word">Check</button>
            </div>
        `).join('');
    }

    async function createNewWords() {
        console.log(12111);
        const newWord = newWordInput.value;
        const translation = translateInput.value;

        if (newWord.trim() === "" || translation.trim() === "") {
            alert("Please enter both a word and its translation.");
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/create-new-words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newWord, translation: translation })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log(result);

            // Clear the input fields
            newWordInput.value = "";
            translateInput.value = "";
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }

    }

    newWordsButton.addEventListener('click', createNewWords);
    showWordsButton.addEventListener('click', fetchWords);

    wordsList.addEventListener('click', async (event) => {
        if (event.target.classList.contains('check-word')) {
            const div = event.target.closest('div');
            const word = div.querySelector('span').innerText;
            const translation = div.querySelector('input').value;
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word, translation })
            });
            const result = await response.json();
            checkResults.innerHTML = `
                <p>${result.word} - ${result.translation}: ${result.correct ? 'Correct' : 'Incorrect'}</p>
            `;
        }
    });

    resetButton.addEventListener('click', () => {
        wordsList.innerHTML = '';
        checkResults.innerHTML = '';
    });

    // Initial fetch of words
    fetchWords();
});
