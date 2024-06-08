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


    // Render words fetched from db
    async function fetchWords() {
        const switchLanguage = switchButton.innerText.split('⇄')[0].trim();
        console.log(switchLanguage)
        const response = await fetch('/api/words');
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
            console.log(3333, element);
            element.addEventListener('click', (event) => {
                console.log("click");
                const word = event.target.getAttribute('data-word');
                console.log("word", word)
                speakWord(word);
            });
        });
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

        console.log(checkListObject);
        const response = await fetch('/api/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ checkListObject, translateTo }),
        });

        const result = await response.json();
        result.forEach(element => {
            const wordElement = document.getElementById(element.id);
            console.log("11", wordElement);
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
