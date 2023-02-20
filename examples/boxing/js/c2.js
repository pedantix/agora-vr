window.addEventListener('load',function()
{
	const aframeModel = document.querySelector("#chloe");
	var playing = false;
	const playButton = document.getElementById("play");

    aframeModel.emit("ryskplay");
    playing = true;

    /*
	playButton.addEventListener("click",() => 
	{
		if (playing)
		{
			playButton.innerHTML = "Enter";
			aframeModel.emit("ryskpause");
			playing = false;
		}else
		{
			playButton.style.display = "none";
			aframeModel.emit("ryskplay");
			playing = true;
		}
	});

    aframeModel.emit("ryskplay");
    playing = true;
    */
});
