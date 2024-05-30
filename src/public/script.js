document.addEventListener('DOMContentLoaded', () => {
    const wordsList = document.getElementById('words-list');
    const checkResults = document.getElementById('check-results');
    const refreshWordsButton = document.getElementById('refresh-words');
    const resetButton = document.getElementById('reset');
    const switchButton = document.getElementById('switch-language');
    const newWordsButton = document.getElementById('new-word');
    const newWordInput = document.getElementById('newWordInput');
    const translateInput = document.getElementById('translateInput');
    const transcriptionInput = document.getElementById("transcriptionInput");
    

    // Render words fetched from db
    async function fetchWords() {
        const switchLanguage = switchButton.innerText.split('⇄')[0].trim();
        console.log(switchLanguage)
        const response = await fetch('/api/words');
        const randomWords = await response.json();
        wordsList.innerHTML = randomWords.map(word => `

            <div>
                <span>${switchLanguage === 'English' ? word.english : word.armenian}</span>
                <input type="text" class="translate" data-word="${switchLanguage === 'English' ? word.english : word.armenian}" placeholder="Translate">
            </div>
        `).join('');
    }

    async function createNewWords() {
        const newWord = newWordInput.value;
        const translation = String(translateInput.value).split(',');
        const transcription = transcriptionInput.value;
        console.log("transcription", transcription);

        if (newWord.trim() === "" || !translation.length) {
            alert("Please enter both a word and its translation.");
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/create-new-words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newWord, translation, transcription })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log(result);

            // Clear the input fields
            newWordInput.value = "";
            translateInput.value = "";
            transcriptionInput.value = "";
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }

    }

    newWordsButton.addEventListener('click', createNewWords);
    refreshWordsButton.addEventListener('click', fetchWords);

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
        const translateList = document.getElementsByClassName("translate");
        for (let i = 0; i < translateList.length; i++) {
            translateList[i].value = "";
          }
    });

    switchButton.addEventListener('click', (e) => {
        const buttonText = (e.target.innerHTML).split('⇄');
        const switchLanguage = `${buttonText[1].trim()} ⇄ ${buttonText[0].trim()}`
        switchButton.innerText = switchLanguage;
        fetchWords();
    })

    // Initial fetch of words
    fetchWords();
});
