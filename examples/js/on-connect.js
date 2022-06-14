function onConnect(){
	console.log('On connected to NAF -', new Date());
}


document.addEventListener("DOMContentLoaded", function(){

	var userSeats = {};

	function sitOnChair(avatarObj3D,id) {
		var posArr=userPositions.pop();
		if (posArr) {
			userSeats[id]=posArr;		
			avatarObj3D.position.x = posArr[0];
			avatarObj3D.position.z = posArr[1];
			avatarObj3D.position.y = posArr[2];
		} else {
			console.error("there is no chairs for new user");
		}
	}

	function getOffChair(id) {
		userPositions.push(userSeats[id]);
		delete userSeats[id];
	}

	document.body.addEventListener('entityCreated', function (evt) {
	    let createdElem = evt.detail.el;
	    if (createdElem.className == 'avatar' && createdElem.id) {
		var id=createdElem.firstUpdateData.networkId;
	    	sitOnChair(createdElem.object3D,id);
	    }	    
	});

	document.body.addEventListener('entityRemoved', function(evt) {
	    var id=evt.detail.networkId;
	    if (id && userSeats[id]) {
	    	getOffChair(id);
	    }	
    });
});

