/*
Author: Matteo Gaddi, Net System Team
version 1.1
*/

// some scripts
function getFormData($form){
	var unindexed_array = $form.serializeArray();
	var indexed_array = {};

	$.map(unindexed_array, function(n, i){
		indexed_array[n['name']] = n['value'];
	});

	return indexed_array;
}

function printCrossword(printContainer) {
	var DocumentContainer = document.getElementById(printContainer).innerHTML;
	//var WindowObject = window.open('', "PrintWindow", "width=600,height=300,top=200,left=200,toolbars=no,scrollbars=no,status=no,resizable=no");
	var WindowObject = window.open('', "PrintWindow");
	WindowObject.document.writeln(DocumentContainer);
	WindowObject.document.close();
	WindowObject.focus();
	WindowObject.print();
	WindowObject.close();
}

//DEPRECATO in favore dello store Vuex
//aggiorna il numero nell'icona carrello
function updateCartNotify(showtoast = true){
	var userId = Cookies.get('SiteUserId');
	if(userId == undefined){
		//gest cart - items in cart cookie
		var cartStr = Cookies.get('SiteCart');
		if (cartStr != undefined) {
			var cartObj = JSON.parse(cartStr);
			var count = 0;
			$.each(cartObj, function( key, value ) {
				count = count+parseInt(value.QTA);
			});
			var badge = $('.cart-icon .notify');
			badge.text(count);
			if(showtoast) showToast(count+' articoli nel carrello');
		}
	} else {
		//registered user cart
		var data =  {
			action: "process",
			processid: "web_ajax_getcart"
		}
		$.ajax({
			//type: frm.attr('method')
			type: "POST",
			//url: frm.attr('action'),
			//data: JSON.stringify(data),
			data: data,
			success: function (data) {
				dataObj = JSON.parse(data);
				if(dataObj.success) {
					console.log(dataObj);
					var badge = $('.cart-icon .notify');
					//var count = parseInt(badge.text());
					badge.text(dataObj.cartQty);
					if(showtoast) showToast(dataObj.cartQty+' articoli nel carrello');
					if(openOffCanvasOnCartAdd) {
						//mmenuapi.open();
						openOffCanvasOnCartAdd = false;
					}
				} else {
					console.log(dataObj);
					alert('Something Was Wrong');
				}
				console.log('returned:', dataObj);
			},
			error: function (data) {
				console.log('An error occurred.', data);
			},
		});
	}
}

//DEPRECATO in favore del Componente in VueJs
//aggiorna contenuto dell'offcanvas Carrello
function updateCartOffcanvas(){
	console.log( "Started opening");
	const panel = document.querySelector( "#offcanvas_el" );
	const listview = panel.querySelector( ".list-group" );
	listview.innerHTML = '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>';
	
	var data =  {
		action: "process",
		processid: "web_ajax_getcart"
	}
	var userId = Cookies.get('SiteUserId');
	if(userId == undefined){
		//gest cart - items in cart cookie, get items details from db
		var cartStr = Cookies.get('SiteCart');
		if (cartStr != undefined)
			data.SiteCart = JSON.parse(cartStr);
	}
	$.ajax({
		//type: frm.attr('method')
		type: "POST",
		//url: frm.attr('action'),
		//data: JSON.stringify(data),
		data: data,
		success: function (data) {
			dataObj = JSON.parse(data);
			if(dataObj.success) {
				console.log(dataObj);
				listview.innerHTML = '';
				$.each(dataObj.cartItems, function( key, value ) {
					let listitem = document.createElement( "li" );
					listitem.classList.add('list-group-item');
					//listitem.innerHTML = '<p class="mm-listitem__text"><img src="'+value.IMMAGINE+'" height="50" /> '+value.DESCRIZIONE+' <span>Qtà: '+parseInt(value.QTA)+'</span></p>';
					listitem.innerHTML = '<table class="table"><tbody><tr><td><img src="'+value.IMMAGINE+'" height="50" /></td><td class="col-sm-3">'+value.DESCRIZIONE+'</td><td>Qtà: '+parseInt(value.QTA)+'</td></tr></tbody></table>';
					listview.append( listitem );
				});
			} else {
				console.log(dataObj);
				alert('Something Was Wrong');
			}
			console.log('returned:', dataObj);
		},
		error: function (data) {
			console.log('An error occurred.', data);
		},
	});
}

$.toastDefaults = {

  // top-left, top-right, bottom-left, bottom-right, top-center, and bottom-center
  position: 'bottom-center',

  // is dismissable?
  dismissible: true,

  // is stackable?
  stackable: true,

  // pause delay on hover
  pauseDelayOnHover: true,

  // additional CSS Classes
  style: {
    toast: '',
    info: '',
    success: '',
    warning: '',
    error: '',
  }
  
};

function showToast(msg, type = 'info', delay = 5000, container = 'snack'){
	
	//aspetta la fine dell'ultima ajax call
	if ($.active > 1) {
		return;
	}
	
	if (container == 'toast') {
		var today = new Date();
		var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

		$.toast({
		  title: 'Notice!',
		  subtitle: time,
		  content: msg,
		  type: type,
		  delay: delay,
		  dismissible: true,
		  /*
		  img: {
			src: 'image.png',
			class: 'rounded',
			title: '<a href="https://www.jqueryscript.net/tags.php?/Thumbnail/">Thumbnail</a> Title',
			alt: 'Alternative'
		  }
		  */
		});
	} else {
		$.snack(type, msg, delay);
	}
}

function addToCart(record, reload = false){
	var userId = Cookies.get('SiteUserId');

	//add to vuex cart store
	//let itemId = record.CT_ARTICOLI
	//let itemCode = record.CODICE || false
	//let itemQty = parseInt(record.QTA)
	
	let item = {
		itemId: record.CT_ARTICOLI,
		itemCode: record.CODICE || false,
		itemQty: parseInt(record.QTA),
		reload: reload
	}
	
	$.each(record, function( key, value ) {
	  item [key] = value;
	});

	//cartStore.commit('addToCart', {itemId, itemQty, itemCode, reload})
	cartStore.commit('addToCart', item)
	
	//location.reload()
}

function checkoutB2B(records, reload = false){
	var userId = Cookies.get('SiteUserId');

	$('.loader').removeClass('d-none');

	//send to server web_actionscheckout
	/*
	var data = {
		action: "sequence",
		actionbefore: {
			action: "write",
			layoutid: "web_page_checkout",
		},
		actionafter: {
			action: "process",
			processid: "web_actionscheckout",
			layoutid: "web_page_checkout",
			postaction: "add"
		},
		//cart: cartStore.state.items
	};
	*/
	
	var data =  {
		action: "process",
		processid: "web_ajax_checkout_b2b"
	}
	
	data.records = []
	$.each(records, function( key, record ) {
		//alert( key + ": " + value );
		data.records.push(record)
	});

	$.ajax({
		//type: frm.attr('method')
		type: "POST",
		//url: frm.attr('action'),
		//data: JSON.stringify(data),
		data: data,
		success: function (data) {
			dataObj = JSON.parse(data);
			if(dataObj.success) {
				console.log(dataObj);
				showToast('Ordine Confermato!', 'success');
				if(reload) {
					//location.reload();
				} else {
					//updateCartNotify();
				}
			} else {
				console.log(dataObj);
				alert('Something Was Wrong');
			}
			console.log('returned:', dataObj);
		},
		error: function (data) {
			console.log('An error occurred.', data);
		}
	})
	.done(() => {
		$('.loader').addClass('d-none');
	});
}

function getOrders(){
	boby = {
		action: "process",
		processid: "web_ajax_getOrders",
		onlylast: true
	}

	return $.ajax({
		//type: frm.attr('method')
		type: "POST",
		//url: frm.attr('action'),
		//data: JSON.stringify(data),
		data: boby,
		success: function (res) {
			dataObj = JSON.parse(res);
			if(dataObj.success) {
				//console.log(dataObj)
				if(dataObj.msg) {
					alert(dataObj.msg)
				}
			} else {
				console.log(dataObj)
				alert('Something Was Wrong')
			}
			console.log('returned:', dataObj)
		},
		error: function (res) {
			console.log('An error occurred.', res)
		},
	});	
}

//DEPRECATA con l'itroduzione di VueJs
function addToCart_old(record, reload = false){
	var userId = Cookies.get('SiteUserId');

	if(userId == undefined){
		//gest cart - add items to cart cookie
		var cartStr = Cookies.get('SiteCart');
		if (Array.isArray(record)) {
			//è tutto il carrelo dalla pag Carrelo in Vue
			var cart = JSON.parse(JSON.stringify(record)) //create an un-bind copy
			$.each(cart, function( key, value ) {
				delete cart[key].IMMAGINE;
				cart[key].CT_ARTICOLI = value.ID
			});
		} else if (cartStr != undefined) {
			//carrello già presente, increnta qtà se articolo già presente
			var cart = JSON.parse(cartStr);
			var finded = false;
			$.each(cart, function( key, value ) {
				if (value.CT_ARTICOLI == record.CT_ARTICOLI){
					cart[key].QTA = parseInt(cart[key].QTA)+parseInt(record.QTA);
					finded = true;
				}
			});
			if (!finded) 
				cart.push(record);
		} else {
			//carrello vuoto inserisco il nuovo oggetto
			var cart = [];
			cart.push(record);
		}
		
		Cookies.set('SiteCart', JSON.stringify(cart));
		updateCartNotify();
	} else {
		//registered user - add items to cart in db
		var data = {
			action: "sequence",
			actionbefore: {
				action: "write",
				layoutid: "web_page_articolo",
				//CT_ARTICOLI: "1",
				//QTA: "1",
				//VALORERIGA: "113"
			},
			actionafter: {
				action: "process",
				processid: "web_actionscarrello",
				layoutid: "web_page_articolo",
				postaction: "add"
			},
		};
		//console.log(record);
		//return false;
		
		$.each(record, function( key, value ) {
		  //alert( key + ": " + value );
		  data.actionbefore[key] = value;
		});
			
		$.ajax({
			//type: frm.attr('method')
			type: "POST",
			//url: frm.attr('action'),
			//data: JSON.stringify(data),
			data: data,
			success: function (data) {
				dataObj = JSON.parse(data);
				if(dataObj.success) {
					console.log(dataObj);
					if(reload) {
						location.reload();
					} else {
						updateCartNotify();
					}
				} else {
					console.log(dataObj);
					alert('Something Was Wrong');
				}
				console.log('returned:', dataObj);
			},
			error: function (data) {
				console.log('An error occurred.', data);
			},
		});
	}
}

//getCart opzione 1 - esegue la funzione passata
/* Esempio di Utilizzo
	$.fn.getCart(function(cartItems){
	  console.log(cartItems);
	});
*/
$.fn.getCart = function(handleData = null) {
	var data =  {
		action: "process",
		processid: "web_ajax_getcart"
	}
	var userId = Cookies.get('SiteUserId');
	if(userId == undefined){
		//gest cart - items in cart cookie, get items details from db
		var cartStr = Cookies.get('SiteCart');
		if (cartStr != undefined)
			data.SiteCart = JSON.parse(cartStr);
	}
	$.ajax({
		//type: frm.attr('method')
		type: "POST",
		//url: frm.attr('action'),
		//data: JSON.stringify(data),
		data: data,
		success: function (data) {
			dataObj = JSON.parse(data);
			if(dataObj.success) {
				//console.log(dataObj);
				handleData(dataObj.cartItems); 
			} else {
				console.log(dataObj);
				alert('Something Was Wrong');
			}
			//console.log('returned:', dataObj);
		},
		error: function (data) {
			console.log('An error occurred.', data);
		},
	});
};

//getCart opzione 2 - ritorna l'intera chiamata ajax
/* esempio di utilizzo
	var cartItems = $.fn.getCartAjaxCall();
	cartItems.then(function (data) {
		console.log(data);
	});
	
*/
$.fn.getCartAjaxCall = function() {
	var data =  {
		action: "process",
		processid: "web_ajax_getcart"
	}
	var userId = Cookies.get('SiteUserId');
	if(userId == undefined){
		//gest cart - items in cart cookie, get items details from db
		var cartStr = Cookies.get('SiteCart');
		if (cartStr != undefined)
			data.SiteCart = JSON.parse(cartStr);
	}
	return $.ajax({
		//type: frm.attr('method')
		type: "POST",
		//url: frm.attr('action'),
		//data: JSON.stringify(data),
		data: data,
		success: function (data) {
			dataObj = JSON.parse(data);
			if(dataObj.success) {
				//console.log(dataObj);
			} else {
				console.log(dataObj);
				alert('Something Was Wrong');
			}
			console.log('returned:', dataObj);
		},
		error: function (data) {
			console.log('An error occurred.', data);
		},
	});
};

async function syncroCartOnServer(reload = false){
	var data = {
		action: "sequence",
		actionbefore: {
			action: "write",
			layoutid: "web_page_articolo",
		},
		actionafter: {
			action: "process",
			processid: "web_actionscarrello",
			layoutid: "web_page_articolo",
			postaction: "syncro"
		},
		cart: cartStore.state.items
	};
	
	const result = await $.ajax({
		//type: frm.attr('method')
		type: "POST",
		//url: frm.attr('action'),
		//data: JSON.stringify(data),
		data: data,
		success: function (data) {
			dataObj = JSON.parse(data);
			if(dataObj.success) {
				console.log(dataObj);
				//updateCartNotify();
				if(reload)
					location.reload();
			} else {
				alert('Something Was Wrong');
			}
			console.log('returned:', dataObj);
		},
		error: function (data) {
			console.log('An error occurred.', data);
		},
	})
	return result;
}

//OffCanvas Menu using Boostrap Menu Kit
(function( func ) {
    $.fn.addClass = function() { // replace the existing function on $.fn
        func.apply( this, arguments ); // invoke the original function
        this.trigger('classChanged'); // trigger the custom event
        return this; // retain jQuery chainability
    }
})($.fn.addClass); // pass the original function as an argument

(function( func ) {
    $.fn.removeClass = function() {
        func.apply( this, arguments );
        this.trigger('classChanged');
        return this;
    }
})($.fn.removeClass);
$(".offcanvas").on("classChanged", function () {
	var $this = $(this);
	if($this.hasClass("show")){
		console.log("OffCanvas Showed");
		//updateCartOffcanvas();
	}
});

//OffCanvas Menu using MMenu
/*
Mmenu.configs.offCanvas.page.selector = "#main-content";

var mmenu;
var mmenuapi;
document.addEventListener(
	"DOMContentLoaded", () => {
		mmenu = new Mmenu( "#offcanvas-menu", {
			extensions: ["position-right", "position-front","shadow-page","shadow-panels"],
			drag: false,
			offCanvas:{
				blockUI: true
			},
			navbar:	{
				add: false,
				title: 'Carrello',
				titleLink: 'parent'
			},
			navbars: [
				{
					position: 'top',
					content: [
						'<a class="btn btn-primary" href="'+baseurl+'Carrello">Carrello</a>',
					],
				},
				{
					position: 'bottom',
					content: [
						'<a class="btn btn-primary" href="'+baseurl+'Carrello">Modifica il Carrello</a>',
						'<a class="btn btn-primary" href="'+baseurl+'Checkout">CheckOut</a>',
					],
				}
			],
			hooks: {
				"open:start": () => {
					console.log( "Started opening");
					const panel = document.querySelector( "#offcanvas-menu-list" );
					const listview = panel.querySelector( ".mm-listview" );
					listview.innerHTML = '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>';
					var data =  {
						action: "process",
						processid: "web_ajax_getcart"
					}
					$.ajax({
						//type: frm.attr('method')
						type: "POST",
						//url: frm.attr('action'),
						//data: JSON.stringify(data),
						data: data,
						success: function (data) {
							dataObj = JSON.parse(data);
							if(dataObj.success) {
								console.log(dataObj);
								listview.innerHTML = '';
								$.each(dataObj.cartItems, function( key, value ) {
									let listitem = document.createElement( "li" );
									listitem.classList.add('mm-listitem');
									//listitem.innerHTML = '<p class="mm-listitem__text"><img src="'+value.IMMAGINE+'" height="50" /> '+value.DESCRIZIONE+' <span>Qtà: '+parseInt(value.QTA)+'</span></p>';
									listitem.innerHTML = '<table class="table"><tbody><tr><td><img src="'+value.IMMAGINE+'" height="50" /></td><td class="col-sm-3">'+value.DESCRIZIONE+'</td><td>Qtà: '+parseInt(value.QTA)+'</td></tr></tbody></table>';
									listview.append( listitem );
								});
								mmenuapi.initListview( listview );
							} else {
								console.log(dataObj);
								alert('Something Was Wrong');
							}
							console.log('returned:', dataObj);
						},
						error: function (data) {
							console.log('An error occurred.', data);
						},
					});
				}
			}
			
		});
		mmenuapi = mmenu.API;

		mmenuapi.bind( "openPanel:start",
			( panel ) => {
				console.log( "Started opening panel: " + panel.id );
			}
		);

	}
);
*/

// jquery ready start
$(document).ready(function() {
	
	//updateCartNotify(false);
	
	//Set VueJs
	userStore.dispatch('setUserFromLocalStorage')
	cartStore.dispatch('checkCart')
	
	//bootstrap-input-spinner
	$(".input-spinner input[type='number']").inputSpinner();

	if (!!window.debug) {
		console.log(geqoCalls);
		$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
			if (originalOptions.type == 'POST') {
				//ADD DATA TO ALL AJAX POST
				/*
				originalOptions.data = $.extend(
					originalOptions.data,
					{
						debug: true
					}
				);
				*/
				//originalOptions.data.debug = "true";
				/*
				originalOptions.data.concat([
					{name: "debug", value: "true"}
				]);
				*/
			}
		});
	}

	//ACTIONS SUGLI ELEMENTI DEL DOM
    //Prevent closing from click inside dropdown
    $(document).on('click', '.dropdown-menu', function (e) {
      e.stopPropagation();
    });
	
	// Bootstrap tooltip
	if($('[data-toggle="tooltip"]').length>0) {  // check if element exists
		$('[data-toggle="tooltip"]').tooltip()
	} // end if

	/*
	$( "a" ).click(function( event ) {
	  //alert( "Handler for .submit() called." );
	  event.preventDefault();
	  $.ajax({
		  method: "POST",
		  url: "index.php",
		  data: { action:"process", processid: $(this).data('href') }
		})
		.done(function( response ) {
			//alert( "Data Saved: " + response );
			responseObj = JSON.parse(response);
			//alert( "Data Saved: " + responseObj );
			window.location='?layoutid='+responseObj.ctid;
		});
	});
	*/

	$('form.login').submit(function (e) {
		e.stopPropagation();
		e.preventDefault();
		//alert('login submited');
		
		var form = $(this);
		//var url = form.attr('action');

		var redirectUrl = false
		if(form.find("input[name='redirect_url']").length){
			var redirectUrl = form.find("input[name='redirect_url']").val()
		}

		//var formData = form.serialize();
		var formData = form.serializeArray();

		formData = formData.concat([
			//{name: "user_id", value: window.username},
			//{name: "layoutid", value: '30088'},
			{name: "action", value: "login"}
		]);

		let syncIcon = $(this).find('.fa-sync')
		syncIcon.removeClass('d-none')						 
		$.ajax({
			//type: frm.attr('method')
			type: "POST",
			//url: frm.attr('action'),
			data: formData,
			success: async function (data) {
				syncIcon.addClass('d-none');
				dataObj = JSON.parse(data);
				if(dataObj.success) {
					//update Vuex User Store
					userStore.commit('login',dataObj)
					/*
					Cookies.set('RegistrationId', dataObj.RegistrationId);
					Cookies.set('SiteUserId', dataObj.UserId);
					Cookies.set('SiteUserName', dataObj.UserName);
					Cookies.set('SiteUserPsw', dataObj.UserName);
					*/
					$(this).parent().dropdown('toggle');
					if(redirectUrl) {
						location = window.baseurl+redirectUrl
					} else if(window.location.pathname.indexOf("Login") != -1) {
						location = window.baseurl;
					} else {
						location.reload();
					}
				} else {
					alert('Bad Login');
				}
				console.log('returned:');
				console.log(dataObj);
			},
            error: function (data) {
				syncIcon.addClass('d-none');
                console.log('An error occurred.');
                console.log(data);
            },
		});
    });
	
	$('a.logout').click(function (e) {
		e.stopPropagation();
		e.preventDefault();
		
		$.ajax({
			//type: frm.attr('method')
			type: "POST",
			//url: frm.attr('action'),
			data: {action: "logout"},
			success: function (data) {
				dataObj = JSON.parse(data);
				if(dataObj.success) {
					//update Vuex User Store
					userStore.commit('logout')
					
					/*
					Cookies.remove('RegistrationId');
					Cookies.remove('SiteUserId');
					Cookies.remove('SiteUserName');
					Cookies.remove('SiteUserLogin')
					Cookies.remove('SiteUserPsw')
					*/
					
					//location.reload();
					location = window.baseurl;
				} else {
					alert('Bad Logout');
				}
				console.log('returned:');
				console.log(dataObj);
			},
            error: function (data) {
                console.log('An error occurred.');
                console.log(data);
            },
		});
	});
	
	//Search in list
	$( ".input-search" ).keyup(function() {
		//alert( "Handler for .keyup() called." );
		// Declare variables 
		var input, filter, table, tr, td, i;
		//input = document.getElementById(this.id);
		//filter = input.value.toUpperCase();
		filter = this.value.toUpperCase();
		//table = document.getElementById($(this).data("tableId"));
		list = $(this).parents('.filter-group').find('.list-menu li');
		//console.log(list);
		
		//tr = table.getElementsByTagName("tr");

		// Loop through all list element, and hide those who don't match the search query
		for (i = 0; i < list.length; i++) {
			//td = list[i].getElementsByTagName("a")[0];
			text = $(list[i]).text();
			//console.log(text);
			if (text) {
				if (text.toUpperCase().indexOf(filter) > -1) {
					list[i].style.display = "";
				} else {
					list[i].style.display = "none";
				}
			}
		}
	});
	
	/*Clear Search Input
	$('.has-clear input[type="text"]').on('input propertychange', function() {
	  var $this = $(this);
	  var visible = Boolean($this.val());
	  $this.siblings('.form-control-clear').toggleClass('hidden', !visible);
	}).trigger('propertychange');

	$('.form-control-clear').click(function() {
		$(this).siblings('input[type="text"]').val('').trigger('propertychange').focus();
		$('#cercapersone-row').keyup();
	});
	*/
	
	//CARRELLO
	//$('.add-to-cart').click(function(e) {
	$('form#add-to-cart, form.add-to-cart').submit(function(e) {
		e.stopPropagation();
		e.preventDefault();
		//alert( "Handler for .click() called on add-to-cart." );
		
		var form = $(this);
		//var url = form.attr('action');
		
		//var formData = form.serialize();
		//var formData = form.serializeArray();
		var formData = getFormData(form);

		addToCart(formData, form.hasClass('reload'));
		
	});
	
	$('.cart-qty').on("input", function (event) {
		//console.log('cart-qty', $(this).val());
		
		var data = {
			action: "sequence",
			actionbefore: {
				action: "write",
				layoutid: "web_page_articolo",
				IDMOVIMENTO: $(this).data("movid"),
				QTA: $(this).val()
			},
			actionafter: {
				action: "process",
				processid: "web_actionscarrello",
				layoutid: "web_page_articolo",
				postaction: "update"
			},
		};
		
		$.ajax({
			//type: frm.attr('method')
			type: "POST",
			//url: frm.attr('action'),
			//data: JSON.stringify(data),
			data: data,
			success: function (data) {
				dataObj = JSON.parse(data);
				if(dataObj.success) {
					console.log(dataObj);
					updateCartNotify();
					//location.reload();
				} else {
					alert('Something Was Wrong');
				}
				console.log('returned:', dataObj);
			},
            error: function (data) {
                console.log('An error occurred.', data);
            },
		});
	});
	
	$('.cart-remove').click(function(e) {
		e.stopPropagation();
		e.preventDefault();
		
		var data = {
			action: "sequence",
			actionbefore: {
				action: "write",
				layoutid: "web_page_articolo",
				IDMOVIMENTO: $(this).data("movid")
			},
			actionafter: {
				action: "process",
				processid: "web_actionscarrello",
				layoutid: "web_page_articolo",
				postaction: "remove"
			},
		};
		
		$.ajax({
			//type: frm.attr('method')
			type: "POST",
			//url: frm.attr('action'),
			//data: JSON.stringify(data),
			data: data,
			success: function (data) {
				dataObj = JSON.parse(data);
				if(dataObj.success) {
					console.log(dataObj);
					location.reload();
				} else {
					alert('Something Was Wrong');
				}
				console.log('returned:', dataObj);
			},
            error: function (data) {
                console.log('An error occurred.', data);
            },
		});
	});
	
	$('.form-send-mail').submit(function(e) {
		e.stopPropagation()
		e.preventDefault()
		
		var form = $(this);
		var formData = getFormData(form);
		//console.log(formData);
		var data = {
			action: "sequence",
			actionbefore: {
				action: "write",
				layoutid: "web_page_contatti"
			},
			actionafter: {
				action: "process",
				processid: "web_ajax_sendmail",
				layoutid: "web_page_contatti"
			},
		};
		$.each(formData, function( key, value ) {
		//alert( key + ": " + value );
		  data.actionbefore[key] = value;
		});
		$.ajax({
			//type: frm.attr('method')
			type: "POST",
			//url: frm.attr('action'),
			//data: JSON.stringify(data),
			data: data,
			success: function (data) {
				dataObj = JSON.parse(data);
				if(dataObj.success) {
					console.log(dataObj);
				} else {
					console.log(dataObj);
					alert('Something Was Wrong');
				}
				console.log('returned:', dataObj);
			},
			error: function (data) {
				console.log('An error occurred.', data);
			},
		});
	});
}); 
// jquery end

