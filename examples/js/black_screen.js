function showTextOnBlackScreen() {
    const enterText = document.createElement("h1");
    enterText.innerText = "Click to Enter";
    enterText.classList.add('enterText');
    const loader = document.querySelector('.loader');
    loader.style.display = 'none';
    document.body.appendChild(enterText);
}

function enterScene() {
    window.removeEventListener('click', enterScene);
    const scene = document.querySelector('a-scene');
    const videoEl = document.getElementById("BackScreen");
    const enterVRButt = document.querySelector(".a-enter-vr");
    const guiControls = document.querySelector(".close-bottom");
    const enterText = document.querySelector(".enterText");
    scene.style.display = "block";
    if (guiControls) {
        guiControls.style.display = 'block';
    }    
    enterVRButt.style.display = 'block';
    var video = videoEl.components.material.material.map.image;
    if (!video) { return; }
    enterText.parentNode.removeChild(enterText);    
    video.play();
    
    // connect to network scene and start loading networked objects
    scene.emit('connect');
    try { 
        if (typeof startCall === 'function') {
            startCall(); 
        }
    } catch (e) { 
        console.error(e)
    }
}
