function dom_loaded() {
	const playerCameraEl = document.querySelector('#player');
	playerCameraEl.setAttribute('camera', 'active', 'true');
	toggleVideoStreaming(scene);
	showTextOnBlackScreen();

	const displayNameInput = document.querySelector("#displayNameInput");

	displayNameInput.focus();

	let username_cookie = getCookie('stage');

	if (username_cookie !== null) {
		displayNameInput.value = username_cookie;
	} else {
		displayNameInput.value = 'user-' + Math.round(Math.random() * 10000);
	}
	

	document.getElementById('displayNameInputSubmit').addEventListener('click', function() {
		enterScene();
		document.getElementById('displayNameInputContainer').classList.remove('show');
	});
}



window.addEventListener('DOMContentLoaded', (event) => {
	parseURL();
	addControls();
	const scene = document.querySelector('a-scene');
	setPlayerSeatAttr();
	scene.addEventListener('loaded',dom_loaded);
	
	if (scene.hasLoaded) {
		dom_loaded();
	}	

	const renderer = scene.renderer;
});

function setCookie(name,value) {
  localStorage.setItem(name, value);
}
function getCookie(name) {
  return localStorage.getItem(name);
}
function eraseCookie(name) {   
  localStorage.removeItem(name);
}