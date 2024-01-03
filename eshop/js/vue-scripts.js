//https://next.vuex.vuejs.org/guide/#the-simplest-store
//https://github.com/vuejs/vuex/blob/dev/examples/shopping-cart/store/modules/cart.js
//http://www.voerro.com/en/tutorials/r/simple-persistent-shopping-cart-implementation-with-vuejs-2-and-vuex-in-laravel-5/2

/*
let cartStore = {
    state: {
        cart: [],
        siteCartCount: 0,
    },

    mutations: {
        addToCart(state, item) {
            console.log(item.title);
        }
    }
};
*/

// Create a new store instance.
const userStore = Vuex.createStore({
	state () {
		return {
			user : {}
		}
	},
	getters: {
		getUser: state => {
		  return state.user
		}
	},
	mutations: {
		login(state, user) {
			state.user = user
			window.localStorage.setItem('siteLogin', JSON.stringify(state.user))
			Cookies.set('RegistrationId', user.RegistrationId)
			Cookies.set('SiteUserId', user.UserId)
			Cookies.set('SiteUserName', user.UserName)
			Cookies.set('SiteUserLogin', user.UserLogin)
			Cookies.set('SiteUserPsw', user.UserPsw)
			/*
			if(Object.keys(cartStore.state.siteCartItems).length > 0)
				syncroCartOnServer()
			*/
		},
		logout(state) {
			state.user = {}
			window.localStorage.removeItem('siteLogin')
			cartStore.commit('resetCart')
			Cookies.remove('RegistrationId')
			Cookies.remove('SiteUserId')
			Cookies.remove('SiteUserName')
			Cookies.remove('SiteUserLogin')
			Cookies.remove('SiteUserPsw')
		},
		setUser(state, user){
			state.user = user
		}
	},
	actions: {
		setUserFromLocalStorage (context) {
			const urlParams = new URLSearchParams( window.location.search);
			if(urlParams.get('resetUser')){
				//clear user cache
				context.commit('logout')
			} else {
				let user = window.localStorage.getItem('siteLogin')
				context.commit('setUser', user)
			}
		}
	}
})

// Create a new store instance.
const cartStore = Vuex.createStore({
	state () {
		return {
			siteCartItems: ("siteCartItems" in localStorage) ? JSON.parse(window.localStorage.getItem('siteCartItems')) : [{}], // shape: [{ id, data, quantity }]
			siteCartCount: ("siteCartCount" in localStorage) ? parseInt(window.localStorage.getItem('siteCartCount')) : 0,
			siteCartNumReg: ("siteCartNumReg" in localStorage) ? parseInt(window.localStorage.getItem('siteCartNumReg')) : null
		}
	},
	getters: {
		totalPreIva: state => {
			if(state.siteCartItems.length > 0) {
				return state.siteCartItems.map(item => parseFloat(item.VALORELISTINO)*parseInt(item.QTA)).reduce((total, amount) => total + amount);
			} else {
				return 0;
			}
		},
		totalIva: state => {
			if(state.siteCartItems.length > 0) {
				return state.siteCartItems.map(item => parseFloat(item.VALORERIGAIVA)*parseInt(item.QTA)).reduce((total, amount) => total + amount);
			} else {
				return 0;
			}
		},
		total: state => {
			if(state.siteCartItems.length > 0) {
				return state.siteCartItems.map(item => parseFloat(item.VALORELISTINO)*parseInt(item.QTA)+parseFloat(item.VALORERIGAIVA)*parseInt(item.QTA)).reduce((total, amount) => total + amount);
			} else {
				return 0;
			}
		},
		siteCartCount: state => {
		  return state.siteCartCount
		},
		siteCartNumReg: state => {
		  return state.siteCartNumReg
		}
	},
	mutations: {
		async addToCart(state, item) {
            //console.log(item);
			if(typeof item === 'object' && item !== null){
				var itemId = item.itemId
				var itemCode = item.itemCode
				var itemQty = item.itemQty
				let reload =  item.reload 
			} else {
				var itemId = item
				var itemQty = 1
			}
			if(itemId == undefined) return false
			
			let reload =  item.reload || false
			
			var data = {
				action: "sequence",
				actionbefore: {
					action: "write",
					layoutid: "web_page_carrello",
					NUMREG: (state.siteCartNumReg) ? state.siteCartNumReg : null,
					CT_ARTICOLI: item.itemId,
					QTA: item.itemQty,
					CODICE: (item.itemCode) ? item.itemCode : null,
					//VALORERIGA: "113"
				},
				actionafter: {
					action: "process",
					processid: "web_actionscarrello",
					layoutid: "web_page_carrello",
					postaction: "add",
					numreg: state.siteCartNumReg
				},
			};
			//console.log(item);
			//return false;
			
			$.each(item, function( key, value ) {
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
						if(dataObj.NUMREG) {
							state.siteCartNumReg = dataObj.NUMREG
							window.localStorage.setItem('siteCartNumReg', dataObj.NUMREG)
						}
						cartStore.commit('checkCart')
						if(reload) {
							location.reload();
						} else {
							updateCartNotify();
							showToast(state.siteCartCount+' articoli nel carrello');
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
		},
		async addToCart_OLD(state, item) {
            //console.log(item);
			if(typeof item === 'object' && item !== null){
				var itemId = item.itemId
				var itemCode = item.itemCode
				var itemQty = item.itemQty
			} else {
				var itemId = item
				var itemQty = 1
			}
			
			if(itemId == undefined) return false
			
			let found = state.siteCartItems.find(product => product.id == itemId && product.code == itemCode)

			if (found) {
				//found.quantity ++;
				//found.quantity = parseInt(found.quantity) + itemQty
				//found.totalPrice = found.quantity * found.price;
				this.commit('incrementItemQuantity', found, itemQty)
				this.commit('saveCart')
			} else {
				/*
				axios
					.get(baseurl, {
						data: {
							action: "process",
							processid: "web_ajax_getProduct",
							mg: "mio"
						}
					})
					.then(response => {console.log(response)})
					.catch(error => console.log(error))
				*/
				
				var data = {
					action: "process",
					processid: "web_ajax_getProduct",
					itemId: itemId,
					itemCode: itemCode
					//debug: true
				}
				
				await $.ajax({
					//type: frm.attr('method')
					type: "POST",
					//url: frm.attr('action'),
					//data: JSON.stringify(data),
					data: data,
					success: function (data) {
						dataObj = JSON.parse(data);
						//console.log('returned:', dataObj);
						if(dataObj.success) {
							state.siteCartItems.push({
								id: itemId,
								code: itemCode,
								data: dataObj.articolo,
								quantity: itemQty,
								price: dataObj.articolo.LISTINOVENDITA
							})
							cartStore.commit('saveCart', item.reload)
						} else {
							console.log('addToCart - An error occurred.', dataObj.message)
							showToast('Errore - '+ dataObj.message, 'error');
						}
					},
					error: function (data) {
						console.log('addToCart - An error occurred.', data)
						showToast('Errore - '+ data, 'error');
					}
				}).done(function(){
					//cartStore.commit('saveCart')
				});

				//commit('incrementItemQuantity', cartItem)
				//cartItem = state.siteCartItems.find(product => product.id === item)
				//cartItem.quantity++
				//this.$set(item, 'quantity', itemQty);
				//this.$set(item, 'totalPrice', item.price);
			}
			
			//MOVED TO cartStore.saveCart
			//state.siteCartCount++;
			//state.siteCartCount += itemQty;
			
			showToast(state.siteCartCount+' articoli nel carrello');
        },
		pushProductToCart (state, { id }) {
			state.siteCartItems.push({
			  id,
			  quantity: 1
			})
		},
		updateCount(state){
			//state.siteCartCount = state.siteCartItems.map(item => item.quantity).reduce((total, count) => parseInt(total) + parseInt(count), 0);
			state.siteCartCount = state.siteCartItems.map(item => parseInt(item.QTA)).reduce((total, count) => parseInt(total) + parseInt(count), 0);
		},
		incrementItemQuantity (state, { id }, qty = 1) {
			const cartItem = state.siteCartItems.find(item => item.id === id)
			cartItem.quantity = parseInt(cartItem.quantity) + qty
		},
		async updateRemoteCart(state){
			var reload = false
			var data = {
				action: "sequence",
				actionbefore: {
					action: "write",
					layoutid: "web_page_carrello",
					NUMREG: (state.siteCartNumReg) ? state.siteCartNumReg : null,
					CART: JSON.stringify(state.siteCartItems),
				},
				actionafter: {
					action: "process",
					processid: "web_actionscarrello",
					layoutid: "web_page_carrello",
					postaction: "update",
				},
			}

			$.ajax({
				type: "POST",
				data: data,
				success: function (data) {
					dataObj = JSON.parse(data);
					if(dataObj.success) {
						console.log(dataObj);
						cartStore.commit('checkCart')
						if(reload) {
							location.reload();
						} else {
							updateCartNotify();
							showToast(state.siteCartCount+' carrello aggiornato');
						}
					} else {
						console.log(dataObj);
						alert('Something Was Wrong');
					}
				},
				error: function (data) {
					console.log('An error occurred.', data);
				},
			});
		},
		async removeFromCart(state, ref) {
            //console.log(ref)
			
			var reload = false
			var data = {
				action: "sequence",
				actionbefore: {
					action: "write",
					layoutid: "web_page_carrello",
					NUMREG: (state.siteCartNumReg) ? state.siteCartNumReg : null,
					IDMOVIMENTO: ref.idMov,
				},
				actionafter: {
					action: "process",
					processid: "web_actionscarrello",
					layoutid: "web_page_carrello",
					postaction: "remove",
					numreg: state.siteCartNumReg
				},
			}

			$.ajax({
				type: "POST",
				data: data,
				success: function (data) {
					dataObj = JSON.parse(data);
					if(dataObj.success) {
						console.log(dataObj);
						cartStore.commit('checkCart')
						if(reload) {
							location.reload();
						} else {
							//updateCartNotify();
							showToast(state.siteCartCount+' articolo rimosso dal carrello');
						}
					} else {
						console.log(dataObj);
						alert('Something Was Wrong');
					}
				},
				error: function (data) {
					console.log('An error occurred.', data);
				},
			});
		},
		removeFromCart_OLD(state, ref) {
			const cartItem = state.siteCartItems.find(item => item.id === ref.id && item.code === ref.code)
			let index = state.siteCartItems.indexOf(cartItem);

			if (index > -1) {
				let product = state.siteCartItems[index];
				state.siteCartCount -= product.quantity;

				state.siteCartItems.splice(index, 1);
			}
			this.commit('saveCart')
		},
		resetCart(state) {
			state.siteCartItems = [{}]
			state.cartItemsCount = 0
			state.siteCartNumReg = null
			this.commit('saveCart')
		},
		saveCart(state, reload = false) {
			//if(!!userStore.state.user && Object.keys(userStore.state.user).length > 0)
				//syncroCartOnServer(reload)

			//state.siteCartCount += itemQty;
			//this.commit('updateCount')
			window.localStorage.setItem('siteCartItems', JSON.stringify(state.siteCartItems))
			window.localStorage.setItem('siteCartCount', state.siteCartCount)
			window.localStorage.setItem('siteCartNumReg', state.siteCartNumReg)

			//showToast(state.siteCartCount+' articoli nel carrello')
		},
		checkCart(state){
			var data = {
				action: "sequence",
				actionbefore: {
					action: "write",
					layoutid: "web_page_carrello",
				},
				actionafter: {
					action: "process",
					processid: "web_actionscarrello",
					layoutid: "web_page_carrello",
					postaction: "check"
				},
				//cart: state.siteCartItems,
				numreg: state.siteCartNumReg
			}
			
			//reset Carrello
			//state.siteCartItems = [{}]
			//this.commit('resetCart')
			
			$.ajax({
				type: "POST",
				data: data,
				success: function (data) {
					dataObj = JSON.parse(data);
					console.log('returned from checkCart:', dataObj)
					state.siteCartItems = Object.values(dataObj.cartItems)
					//state.siteCartCount = Object.keys(dataObj.cartItems).length
					state.siteCartCount = dataObj.cartItemsCount
					/*
					state.siteCartItems.push({
						id: itemId,
						data: dataObj.articolo,
						quantity: itemQty,
						price: dataObj.articolo.LISTINOVENDITA
					})
					*/
					cartStore.commit('saveCart')
				},
				error: function (data) {
					console.log('An error occurred.', data)
				}
			}).done(function(){
				//cartStore.commit('saveCart')
			})
		},
		/*
		updateCartOnLogin(state){
			var data = {
				action: "sequence",
				actionbefore: {
					action: "write",
					layoutid: "web_page_carrello",
				},
				actionafter: {
					action: "process",
					processid: "web_actionscarrello",
					layoutid: "web_page_carrello",
					postaction: "updateCartOnLogin"
				},
				numreg: state.siteCartNumReg
			}
			
			$.ajax({
				type: "POST",
				data: data,
				success: function (data) {
					dataObj = JSON.parse(data);
					console.log('returned from checkCart:', dataObj)
					state.siteCartItems = Object.values(dataObj.cartItems)
					state.siteCartCount = dataObj.cartItemsCount
					cartStore.commit('saveCart')
				},
				error: function (data) {
					console.log('An error occurred.', data)
				}
			})
		},*/
	},
	actions: {
		checkCart (context) {
			console.log('in action checkCart')
			context.commit('checkCart')
		}
	}
})

const cartPageApp = Vue.createApp({
	data() {
		return { items:[{}] }
	},
	//store: new Vuex.Store(cartStore),
	mounted() {
		console.log('cartPageApp mounted');
	},
	computed: {
		shoppingCart() {
			return this.$store.state.cart
		},
		totalPreIva () {
			return this.$store.getters.totalPreIva
		},
		totalIva () {
			return this.$store.getters.totalIva
		},
		totalAmount () {
			return this.$store.getters.total
		},
		itemsInCart: function() {
			return this.$store.state.siteCartItems
		}
	},
	methods: {
		updateItems(cartItems) {
			this.items = cartItems
			/*
			var list = this.items
			cartItems.map(function(value, key) {
				list.push(value);
			});
			*/
		},
		onUpdate(newValue, oldValue) {
		  //console.log('onUpdate', newValue, oldValue);
		  if(!isNaN(oldValue) && newValue !== oldValue) {
			this.$store.commit('updateRemoteCart')
			//addToCart(Vue.toRaw(this.items))
		  }
		},
		onChange(event) {
			//console.log('onChange', event);
			//addToCart(Vue.toRaw(this.items))
		},
		onInput(event) {
		  //console.log('onInput', event);
		},
		addToCart(itemId) {
            console.log(itemId);
			this.$store.commit('addToCart', itemId)
        },
		removeFromCart(item) {
			this.$store.commit('removeFromCart', item);
		}
	}
})

cartPageApp.use(cartStore)

//cartPageApp.component(VueNumberInput.name, VueNumberInput);
//const cartPageAppEl = cartPageApp.mount('#cartpage-Items-list')

cartOffCanvasApp = Vue.createApp({
	mounted() {},
	computed: { // computed property will be updated when async call resolves
		/*
		itemsInCart(){
		  let cart = this.$store.getters.cartProducts;
		  return cart.reduce((accum, item) => accum + item.quantity, 0)
		}
		*/
		itemsInCart: function() {
			return this.$store.state.siteCartItems
		}
	},
	watch: {
		itemsInCart: function(newValue, oldValue) {
			console.log('cartOffCanvasApp watch', this.$store.state.siteCartItems)
		}
	}
})
cartOffCanvasApp.use(cartStore)

cartNotifyApp = Vue.createApp({
	async mounted() {},
	computed: { // computed property will be updated when async call resolves
		/*
		itemsInCart(){
		  let cart = this.$store.getters.cartProducts;
		  return cart.reduce((accum, item) => accum + item.quantity, 0)
		}
		*/
		itemsInCart: function() {
			//return this.$store.state.siteCartCount
			return this.$store.getters.siteCartCount
		}
	},
	watch: {
		itemsInCart: function(newValue, oldValue) {
			console.log('cartNotifyApp watch', this.$store.state.siteCartCount)
		}
	}
})
cartNotifyApp.use(cartStore)

checkoutPageApp = Vue.createApp({
	data(){
        return {
            checked: true
		}
	},
	mounted() {
		const urlParams = new URLSearchParams( window.location.search);
		if(urlParams.get('esito') == "OK" || urlParams.get('PayerID')){
			//esito per Nexi, PayerID per PayPal - Pagamento Confermato
			//location = "/OrderConfirmation?"
			/*
			var data = [
				{name: "action", value: "sequence"},
				{name: "layoutid", value:"web_page_checkout"},
				{name: "processid", value: "web_paypal_confirm_order"}
			];
			*/
			this.confirmOrder({})
		}
		/*
		if ("siteCartCount" in localStorage)
			this.$store.state.siteCartCount = parseInt(window.localStorage.getItem('siteCartCount'))
		*/
	},
	computed: { // computed property will be updated when async call resolves
		itemsInCart: function() {
			return this.$store.state.siteCartItems
		},
		itemsInCartString: function() {
			return JSON.stringify(this.$store.state.siteCartItems)
		},
		itemsInCartCount: function() {
			//return this.$store.state.siteCartCount
			return this.$store.getters.siteCartCount
		},
		totalPreIva () {
			return this.$store.getters.totalPreIva
		},
		totalIva () {
			return this.$store.getters.totalIva
		},
		totalAmount () {
			return this.$store.getters.total
		},
		siteCartNumReg () {
			return this.$store.getters.siteCartNumReg
		},
	},
	watch: {
		itemsInCartCount: function(newValue, oldValue) {
			console.log('checkoutPageApp watch', this.$store.state.siteCartCount)
		}
	},
	methods: {
		checkoutFormSubmition(submitEvent) {
			//console.log('checkoutPageApp checkoutFormSubmition');
			
			if(submitEvent) {
				var form = $(submitEvent.currentTarget)
				submitEvent.preventDefault() // don't perform submit action (i.e., `<form>.action`)
			} else {
				//usa la form della pagina checkout
				var form = $(this.$refs.form);
			}
			//var url = form.attr('action');

			//var formData = form.serialize();
			var formData = form.serializeArray();

			formData = formData.concat([
				//{name: "action", value: "sequence"},
				//{name: "layoutid", value:"web_page_checkout"},
				//{name: "processid", value: "web_actionscheckout"}
			]);

			let syncIcon = form.find('.fa-sync')
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
						location = dataObj.redirect_url
						/*
						if(redirectUrl) {
							location = window.baseurl+redirectUrl
						} else if(window.location.pathname.indexOf("Login") != -1) {
							location = window.baseurl;
						} else {
							//location.reload();
						}
						*/
					} else {
						alert("Something went Wrong!\n"+dataObj.message);
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
		},
		confirmOrder(data) {
			//console.log('checkoutPageApp confirmOrder');
			
			var form = $(this.$refs.orderConfirmform);

			//var formData = form.serialize();
			var formData = form.serializeArray();

			formData = formData.concat([
				//{name: "action", value: "sequence"},
				//{name: "layoutid", value:"web_page_checkout"},
				//{name: "processid", value: "web_actionscheckout"}
			]);

			let syncIcon = form.find('.fa-sync')
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
						cartStore.commit('resetCart')
						location = dataObj.redirect_url
						/*
						if(redirectUrl) {
							location = window.baseurl+redirectUrl
						} else if(window.location.pathname.indexOf("Login") != -1) {
							location = window.baseurl;
						} else {
							//location.reload();
						}
						*/
					} else {
						alert("Something went Wrong!\n"+dataObj.message);
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
		}
	}
})
checkoutPageApp.use(cartStore)

//rif per dynamic filter in es6
//https://tylerburdsall.medium.com/building-a-dynamic-filter-with-es6-javascript-71dfeb50c371
productPageApp = Vue.createApp({
	inject: ['product', 'variations', 'groupVarianti', 'groupArticoli', 'variationsString'],
	data(){
        return {
			//variations: {},
			productId: this.product.ID,
			currentProduct: this.product,
			buyable: true,
			groupArticoliArray: [],
			loading: false,
        }
    },
	mounted() {
		//this.$data.variations = JSON.parse(this.variationsString)
		//this.prova = 'bau'
		const objectToArray = obj => {
		   const keys = Object.keys(obj);
		   const res = [];
		   for(let i = 0; i < keys.length; i++){
			  res.push([keys[i], obj[keys[i]]])
			  //res[keys[i]] = obj[keys[i]]
		   };
		   return res;
		}
		if(Object.keys(this.groupArticoli).length > 0) {
			this.groupArticoliArray = objectToArray(this.groupArticoli)
			this.enableValidoptions()
		}
	},
	/*
	computed: {
		currentProduct: function() {
			return this.product
		}
	},
	*/
	watch: {
		currentCode: function(newValue, oldValue) {
			//console.log('currentCode watch', newValue)
		},
		currentProduct: function(newValue, oldValue) {
			//console.log('currentProduct watch', newValue)
			productId = newValue.ID
		}
	},
	methods: {
		handleChange(e) {
			if(e.target.options.selectedIndex > -1) {
				//console.log(e.target.options[e.target.options.selectedIndex].dataset.foo)
				this.enableValidoptions()
			}
		},
		enableValidoptions(){
			let selectsNames = Object.keys(this.groupVarianti)
			//let filters = []
			let filters = {}
			selectsNames.forEach((item, index) => {
				let value = document.querySelector("select[name='"+item+"']").value
				//filters: for each select html tag, key is name and value is value
				//filters.push({key: item, value: document.querySelector("select[name='"+item+"']").value})
				//filters.push([item,value])
				//can work with multivalues filter foreach key
				filters[item] = [value]
			})
			//console.log(selectsNamesValues)
			// the dynamic filter function
			//filterItems = (data, filters) => data.filter(item => !filters.find(x => x.key.split('.').reduce((keys, key) => keys[key], item) !== x.value))
			// how to use it
			//let mio = filterItems(data, [{ key: 'type', value: 'wood' }, { key: 'some.nested.prop', value: 'value' }])
			filterData = (data, query) => {
				const filteredData = data.filter((item, index) => {
					for (let key in query) {
						if (item[1][key] === undefined || !query[key].includes(item[1][key])) {
							return false
						}
					}
					//item.originalIndex = index
					return true
				})
				return filteredData
			};
			
			
			let findedCombos = filterData(this.groupArticoliArray, filters)
			//console.log(findedCombos)		

			this.productId = ((typeof findedCombos[0] === 'undefined')) ? 0 : findedCombos[0][0]
			if(this.productId !== 0) {
				this.buyable = true
				this.getProducts()
			} else {
				this.buyable = false
				this.currentProduct.CODICE = 'combinazione non valida'
			}
		},
		getProducts: function(){
			//var self = this
			let currentApp = this
			this.loading = true
			this.buyable = false
			sendData = {
				action: "process",
				processid: "web_ajax_getProduct",
				itemId: this.productId
				//debug: true
			}
			
			$.ajax({
				method: "POST",
				//data: JSON.stringify(sendData),
				data: sendData,
				success: res => {
					resObj = JSON.parse(res)
					//console.log('success:', resObj)
					currentApp.currentProduct = resObj.articolo
					currentApp.loading = false
					currentApp.buyable = true
				},
				error: res => {
					console.log('An error occurred.', res)
				},
				done: res => {
					resObj = JSON.parse(res)
					console.log('done:', resObj)
				}
			})
		},
		provaAxiosCall() {
			let myvue = this;
			const options = {
				headers: {"content-type": "application/json", 'X-Requested-With': 'XMLHttpRequest'}
			}
			//axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
			axios.post(baseurl, {
				data: {
					action: "process",
					processid: "web_ajax_getProduct",
					itemId: this.productId
				},
				options
			})
			.then(response => {
				console.log(response)
				console.log(myvue)
				}
			)
			.catch(error => {console.log(error)})
		},
		setCtArticoli(){}
	}
})

provaApp = Vue.createApp({
	mounted() {
		//alert('quindi?')
		let myvue = this;
		$.ajax({
			context: this
		}).done((data) => {
			console.log(data)
			console.log(myvue)
		});

	}
})