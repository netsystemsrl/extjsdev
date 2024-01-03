/*!
 * NS WareHouse 3D Manager
 * Copyright (C) 2018 Net system
 * http://net-system.it
 *
 * various scripts file 
 */

var listaGruppoM = [];
 
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
	
	callERPWharehouseStruct();
	
	$('#select-maga').change(function () {
		showProgressBar();
		var maga  = $(this).val();
		callERPWharehouseStructPerMaga(maga);
	});
	
	
	$('#move').click(function () {
		draw3DPath();
	});
	
});
//console.log("outside ready");

function callERPWharehouseStruct(){
	$.ajax({
	  method: "POST",
	  url: "https://netsystem.geqo.it/includes/io/DataRead.php?format=JSON&dbname=netsystem&username=admin&password=258&layoutid=90358",
	  //data: { name: "John", location: "Boston" }
	})
	.done(function( jsonObj ) {
		//alert( "Data Saved: " + jsonObj );
		if (jsonObj.success) {
			//createRackFromJson(jsonObj.data);
			var magaCount = 0;
			var magaInizio;
			
			//TROVA MAGAZZINI (GROUP BY GRUPPOM)
			for(var i = 0; i < jsonObj.data.length; i++) {
				if (!listaGruppoM[jsonObj.data[i]['GRUPPOM']]) {
					listaGruppoM[jsonObj.data[i]['GRUPPOM']] = jsonObj.data[i]['GRUPPOM'];
					if(magaCount == 0) {
						magaInizio = jsonObj.data[i]['GRUPPOM'];
						$('#select-maga').append('<option value=' + jsonObj.data[i]['GRUPPOM'] + ' selected>' + jsonObj.data[i]['GRUPPOM'] + '</option>');
					} else {
						$('#select-maga').append('<option value=' + jsonObj.data[i]['GRUPPOM'] + '>' + jsonObj.data[i]['GRUPPOM'] + '</option>');
					}
					magaCount++;
				}
			}
			
			//CREA STRUTTURA
			callERPWharehouseStructPerMaga(magaInizio);
			hideProgressBar();
		} else {
			console.log("Ajax Success False: " + jsonObj.message);
			console.log(jsonObj);
			alert("Ajax Success False: " + jsonObj.message);
			createRack();
			hideProgressBar();
		}
	});
}

function callERPWharehouseStructPerMaga(maga){
	$.ajax({
		method: "POST",
		url: "https://netsystem.geqo.it/includes/io/DataRead.php?format=JSON&dbname=default&username=admin&password=1234&layoutid=90357&datawhere=GRUPPOM='"+maga+"'",
		//data: { name: "John", location: "Boston" }
	})
	.done(function(jsonObj) {
		//alert( "Data Saved: " + jsonObj );
		if (jsonObj.success) {
			scene.remove(dots);
			createRackFromJson(jsonObj.data);			
		} else {
			console.log("Ajax Success False: " + jsonObj.message);
			console.log(jsonObj);
			alert("Ajax Success False: " + jsonObj.message);
			createRack();
		}
	});
}

