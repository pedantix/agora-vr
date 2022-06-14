function onConnect(evt){
	console.error('On connected to NAF -', new Date());
	console.error('clientConnected event. clientId =', evt.detail);

	document.body.addEventListener('clientConnected', function (evt) {
		const clientID = evt.detail.clientId;
		console.error('clientConnected event. clientID = ', clientID );
	});	

	function checkSeatNumEngaged(newSeatNum){
    	return document.querySelector(`.screenPlane[seat='${newSeatNum}'][visible='true']`);		
	}

	document.body.addEventListener('entityCreated', function (evt) {
    	const createdElem = evt.detail.el;
    	// show another user video if user's element has seat attribute 
    	// and it's different from this user seat

    	// if there is no screenPlane with same seat number
    	const newSeatNum = createdElem.getAttribute('seat');
    	if (createdElem.className == 'screenPlane' && 
    		newSeatNum &&
    		user_seat !== newSeatNum &&
    		avatar_seat != newSeatNum &&
    		!checkSeatNumEngaged(newSeatNum) &&
    		newSeatNum <= max_seats
    		) {
    		createdElem.setAttribute('visible', true);
    	}
    });

	if (user_seat) {
		startProcessVideo();
	}		
	//if there is assistant
	set_assistant_position();
}
