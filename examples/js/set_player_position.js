function sitOnChair(seat_num, video_elem, player_avatar, blue_color) {
	const userPositions = userPositionGroups[max_seats];
	const posArr = userPositions[seat_num];
	const sizeWH = userVideoSizes[max_seats];		
	const player_avatar_obj = player_avatar.object3D;
	
	player_avatar.setAttribute('width', sizeWH);
	player_avatar.setAttribute('height', sizeWH);
	player_avatar.setAttribute('material', 'src', '#' + video_elem.id);
	if (blue_color) {
		player_avatar.setAttribute('material', 'color', '0 0.03 0.99');
		console.error(player_avatar)
	}

	player_avatar.setAttribute('material', 'shader', 'chromakey');
	player_avatar.setAttribute('material', 'alphaTest', '0.5');
	// delay to prevent show background of user video
	setTimeout(()=> {
		player_avatar.setAttribute('visible', true);
	}, 2000);

	const avatart_material = player_avatar_obj.children[0].material;
	avatart_material.needsUpdate = true;
	avatart_material.metalness = 0.7;
	avatart_material.lights = true;
	player_avatar_obj.children[0].castShadow = true;
	player_avatar_obj.position.set(posArr.x, posArr.y, posArr.z);
}

async function set_player_position() {
	const player_avatar = document.querySelector("#player_video_avatar");
	const video_player = await waitForElm('.agora_video_player');

	sitOnChair(user_seat, video_player, player_avatar);
}

function set_assistant_position() {
	if (avatar_seat && avatar_seat != user_seat) {
		const engagedUser = document.querySelector(`.screenPlane[seat='${avatar_seat}'][visible='true']`);
		// if avatar_seat place is already taken, hide user localy
		if (engagedUser) {
			engagedUser.setAttribute("visible", "false");
		}
		const assistant_avatar = document.querySelector("#assistant_video_avatar");
		const assistant_video_player = document.querySelector('#wall-avatar');

		sitOnChair(avatar_seat, assistant_video_player, assistant_avatar, true);		
	}	
}
