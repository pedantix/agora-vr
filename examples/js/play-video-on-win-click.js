AFRAME.registerComponent('play-on-window-click', {
  init: function () {
    this.onClick = this.onClick.bind(this);
    this.canvas = document.getElementById("blackCanvas");
    const ctx = this.canvas.getContext("2d");
  ctx.font = "50px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Click to enter", canvas.width/2, canvas.height/2);
  },
  play: function () {
    window.addEventListener('click', this.onClick);
  },
  pause: function () {
    window.removeEventListener('click', this.onClick);
  },
  onClick: function (evt) {
    const videoEl = document.getElementById("BackScreen");
    var video = videoEl.components.material.material.map.image;
    if (!video) { return; }
    this.canvas.parentNode.removeChild(this.canvas);    
    video.play();
  }
});