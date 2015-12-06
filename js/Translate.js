window.Translate = (function() {
  var url = 'https://mymemory.translated.net/api/get?langpair=ja|en&q=';

  var Translate = function(result, options) {
    if (options && options.url) url = options.url;

    return fetch(url + result).then(function(response) {
      return response.json();
    }).then(function(data) {
      return data.responseData.translatedText;
    });
  };

  return Translate;
}());
