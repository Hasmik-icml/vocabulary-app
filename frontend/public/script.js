document.addEventListener('DOMContentLoaded', () => {
    const wordsList = document.getElementById('words-list');
    const checkResults = document.getElementById('check-word');
    const refreshWordsButton = document.getElementById('refresh-words');
    const resetButton = document.getElementById('reset');
    const switchButton = document.getElementById('switch-language');
    const newWordsButton = document.getElementById('new-word');
    const newWordInput = document.getElementById('newWordInput');
    const translateInput = document.getElementById('translateInput');
    const transcriptionInput = document.getElementById("transcriptionInput");

    const apiUrl = 'http://localhost:3000';
    console.log("apiUrl", apiUrl);

    // Render words fetched from db
    async function fetchWords() {
        const switchLanguage = switchButton.innerText.split('⇄')[0].trim();
        const response = await fetch(`http://localhost:3000/api/words`);
        const randomWords = await response.json();
        wordsList.innerHTML = randomWords.map(word => `
            <div>
                <span id=${word.id}>${switchLanguage === 'English' ? word.english : word.armenian}</span>
                <input id=${word.id} type="text" class="translate" data-word="${switchLanguage === 'English' ? word.english : word.armenian}" placeholder="Translate">
                <span class="speak-icon" data-word="${word.english}">🔊</span>
                <span class="transcription">${word.transcription}</span>
            </div>
        `).join('');

        document.querySelectorAll('.speak-icon').forEach(element => {
            element.addEventListener('click', (event) => {
                const word = event.target.getAttribute('data-word');
                speakWord(word);
            });
        });
    }

    async function createNewWords() {
        const newWord = newWordInput.value;
        const translation = String(translateInput.value).split(',').map(item => item.trim());
        const transcription = transcriptionInput.value;

        console.log("translation", translation)
        if (newWord.trim() === "" || !translation.length) {
            alert("Please enter both a word and its translation.");
            return;
        }
        try {
            console.log("Before fetch call", { newWord, translation, transcription });

            const response = await fetch(`http://localhost:3000/api/create-new-words`, {
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

            // Clear the input fields
            newWordInput.value = "";
            translateInput.value = "";
            transcriptionInput.value = "";
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }

    }

    function speakWord(word) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        synth.speak(utterance);
    }

    newWordsButton.addEventListener('click', createNewWords);
    refreshWordsButton.addEventListener('click', fetchWords);

    checkResults.addEventListener('click', async (event) => {
        const translateTo = switchButton.innerText.split('⇄')[1].trim();
        const wordList = wordsList.querySelectorAll("span");
        const translationList = wordsList.querySelectorAll("input");
        const checkListObject = {};

        for (let i = 0; i < translationList.length; i++) {
            const translation = translationList[i].value;
            const wordId = translationList[i].id;

            checkListObject[wordId] = { translation };
        }

        // console.log(checkListObject);
        const response = await fetch(`http://localhost:3000/api/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ checkListObject, translateTo }),
        });
        
        const result = await response.json();
        result.forEach(element => {
            const wordElement = document.getElementById(element.id);
            wordElement.innerHTML = wordElement.innerHTML.replace(" &#x2713;", "").replace(" &#x2715;", "");

            if (element.match) {
                wordElement.innerHTML += " &#x2713;";
                wordElement.classList.add("correct");
            } else {
                wordElement.innerHTML += " &#x2715;";
                wordElement.classList.add("incorrect");
            }
        });
        console.log("result", result);

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
