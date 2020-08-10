$(function() {
  let flashMessage = '';

  function updateFlashMessage(message) {
    if (!message) {
      message = '';
    }
    $('#flash-message').text(message);
  }
  
  $form = $('#login-form');
  $signup = $('#signup-button');

  $form.submit(function(event) {
    event.preventDefault();
    let json = serializeFormToJson($form.get(0));
    let method = $form.attr('method');
    let url = $form.attr('action');

    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('load', function() {
      switch(xhr.status) {
        case 200:
          window.location.replace('/');
          break;
        case 401:
          updateFlashMessage('Username or password are invalid.');
          break;
      }
    });
    xhr.send(JSON.stringify(json));
  });

  $signup.click(function(event) {
    event.preventDefault();
    let json = serializeFormToJson($form.get(0));
    let method = 'post';
    let url = '/api/createUser';

    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('load', function() {
      switch(xhr.status) {
        case 200:
          window.location.replace('/');
          break;
      }
    });
    xhr.send(JSON.stringify(json));
  });
});

function serializeFormToJson(form) {
  let formData = new FormData(form);
  let serializedData = {};
  for (let [key, value] of formData.entries()) {
    serializedData[key] = value;
  }
  return serializedData;
}