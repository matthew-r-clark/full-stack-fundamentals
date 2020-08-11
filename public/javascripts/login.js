$(function() {
  function updateFlashMessage(message) {
    if (!message) {
      message = '';
    }
    $('#flash-message').text(message);
  }
  
  $loginForm = $('#login-form');
  $createForm = $('#create-form');
  $('.focus-field').focus();

  $loginForm.submit(function(event) {
    event.preventDefault();
    let json = serializeFormToJson($loginForm.get(0));
    let method = $loginForm.attr('method');
    let url = $loginForm.attr('action');

    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('load', function() {
      switch(xhr.status) {
        case 200:
          window.location.reload();
          break;
        case 401:
          updateFlashMessage(xhr.response);
          break;
        case 404:
          updateFlashMessage(xhr.response);
          break;
      }
    });
    xhr.send(JSON.stringify(json));
  });

  $createForm.submit(function(event) {
    event.preventDefault();
    let json = serializeFormToJson($createForm.get(0));
    let method = $createForm.attr('method');
    let url = $createForm.attr('action');

    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('load', function() {
      switch(xhr.status) {
        case 200:
          window.location.reload();
          break;
        case 400:
          updateFlashMessage(xhr.response);
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