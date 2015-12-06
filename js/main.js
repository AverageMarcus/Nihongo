(function() {
  /* Set up Speech API */
  var recognition = new webkitSpeechRecognition();
  var synth = window.speechSynthesis;
  var utterance = new SpeechSynthesisUtterance();
  utterance.lang = 'ja-JP';
  recognition.lang = 'ja-JP';

  /* DOM elements */
  var progressText = document.querySelector('#progress div');
  var progressBar = document.querySelector('#progress progress');
  var phraseContainer = document.querySelector('#phrase h1');
  var resultContainer = document.getElementById('result');
  var resultActionContainer = document.getElementById('resultAction');
  var speakButton = document.getElementById('speakButton');
  var nextButton = document.getElementById('nextButton');
  var playbackButton = document.getElementById('playbackButton');
  var kanaButton = document.getElementById('kanaButton');

  /* Question Progress */
  var translations;
  var currentTranslation;
  var totalTranslations;
  var currentPosition = 0;

  function fetchTranslations() {
    fetch('translations.json').then(function(response) {
      return response.json();
    }).then(function(data) {
      translations = data;
      totalTranslations = translations.length;
      nextTranslation();
    });
  }

  function initQuestion() {
    phraseContainer.setAttribute('class', '');
    phraseContainer.innerText = '';
    resultContainer.setAttribute('class', '');
    resultContainer.innerText = '';
    resultActionContainer.setAttribute('class', '');
  }

  function nextTranslation() {
    initQuestion();
    if (translations && translations.length) {

      progressText.innerText = ++currentPosition + ' / ' + totalTranslations;
      progressBar.setAttribute('max', totalTranslations);
      progressBar.setAttribute('value', currentPosition);

      currentTranslation = translations.splice(Math.floor(Math.random() * translations.length), 1)[0];
      phraseContainer.innerText = currentTranslation.english;
      if (typeof currentTranslation.formal !== 'undefined') {
        var formalClass = currentTranslation.formal ? 'formal' : 'informal';
        phraseContainer.parentNode.setAttribute('class', formalClass);
      } else {
        phraseContainer.parentNode.setAttribute('class', '');
      }
    } else {
      alert('All done! Well done!');
    }
  }

  playbackButton.onclick = function() {
    utterance.text = currentTranslation.kana;
    synth.speak(utterance);
  };

  kanaButton.onclick = function() {
    if (phraseContainer.innerText === currentTranslation.english) {
      phraseContainer.innerText = currentTranslation.kana;
    } else {
      phraseContainer.innerText = currentTranslation.english;
    }
  };

  speakButton.onclick = function() {
    if (speakButton.getAttribute('class') === 'recording') {
      speakButton.setAttribute('class', '');
      recognition.stop();
    } else {
      speakButton.setAttribute('class', 'recording');
      recognition.start();
    }

    resultContainer.setAttribute('class', '');
    resultContainer.innerText = '';
  };

  recognition.onresult = function(event) {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      var result = event.results[i][0].transcript;
      if (event.results[i].isFinal) {

        resultContainer.innerText = result;

        utterance.text = result;
        synth.speak(utterance);

        var translate = new Translate(result);
        translate.then(function(translated) {
          var correct = (translated.toLowerCase() === currentTranslation.english.toLowerCase() || result === currentTranslation.kana);
          var resultClass = correct ? 'success' : 'failure';
          resultContainer.innerText += ' - ' + translated;
          resultContainer.setAttribute('class', resultClass);
          resultActionContainer.setAttribute('class', resultClass);
        });
      }
    }
  };

  recognition.onerror = recognition.onend = function() {
    speakButton.setAttribute('class', '');
  };

  nextButton.onclick = nextTranslation;

  fetchTranslations();
}());
