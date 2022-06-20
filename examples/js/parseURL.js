function parseURL() {
	// get seat num parameter from URL
	const paramsString = document.location.search;
	const searchParams = new URLSearchParams(paramsString);	
	const url_avatar_seat = searchParams.get("avatar_seat");
	
	if (searchParams.get("max_seats")) {
		max_seats = parseInt(searchParams.get("max_seats"));
	}

	const seatNums = Object.keys(userPositionGroups[max_seats]);
	
	if (seatNums.length && seatNums.includes(searchParams.get("seat"))){
		user_seat = searchParams.get("seat");
		addControls();
	}
	if (searchParams.get("room")) {
		room = searchParams.get("room");
	}
	if (searchParams.get("appid")) {
		appid = searchParams.get("appid");
	}

	if (url_avatar_seat && seatNums.includes(url_avatar_seat)) {
		avatar_seat = parseInt(url_avatar_seat);
	}	
}
