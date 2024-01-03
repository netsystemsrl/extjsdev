/*!
 * NS WareHouse 3D Manager
 * Copyright (C) 2018 Net system
 * http://net-system.it
 *
 * various scripts file 
 */

//jquery 3 document ready trigger
$(function(){
	//console.log("ready");
	$.each(volumeNames, function(key, value) {  
		$('#nome-volume').append('<option value=' + value + '>' + value + '</option>');
	});
	
	$('#dosomething').click(function () {
		//alert('ci sono');
		//var values = $('#posiziona').serialize();
		var volume = scene.getObjectByName( $('#nome-volume')[0].value, true );
		if(volume != undefined) {
			box = scene.getObjectByName( 'box', true );
			box.position.set( volume.position.x, volume.position.y, volume.position.z );
		} else {
			alert('posizione non trovata');
		}
	});
	
	$('#move').click(function () {
		draw3DPath();
	})	
});
//console.log("outside ready");
