AFRAME.registerComponent('play-on-window-click', {
  init: function () {
    this.onClick = this.onClick.bind(this);
  },
  play: function () {
    window.addEventListener('click', this.onClick);
  },
  pause: function () {
    window.removeEventListener('click', this.onClick);
  },
  onClick: function (evt) {
    var video = this.el.components.material.material.map.image;
    var actorVideo = document.getElementById("actorVideo");
    var platform = document.getElementById("platform");
    var actor = document.getElementById("actor");

    if (!video || !actorVideo) { return; }
    platform.setAttribute("visible", true);
    actor.setAttribute("visible", true);
    video.play();
    actorVideo.play();
  }
});