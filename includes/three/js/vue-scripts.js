//https://next.vuex.vuejs.org/guide/#the-simplest-store
//https://github.com/vuejs/vuex/blob/dev/examples/shopping-cart/store/modules/cart.js
//http://www.voerro.com/en/tutorials/r/simple-persistent-shopping-cart-implementation-with-vuejs-2-and-vuex-in-laravel-5/2

/*
let cartStore = {
    state: {
        cart: [],
        cartCount: 0,
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
	mutations: {
		login(state, user) {
			state.user = user
			window.localStorage.setItem('SiteLogin', JSON.stringify(state.user))
			Cookies.set('RegistrationId', user.RegistrationId);
			Cookies.set('SiteUserId', user.UserId);
			Cookies.set('SiteUserName', user.UserName);
			Cookies.set('SiteUserLogin', user.UserLogin);
			Cookies.set('SiteUserPsw', user.UserPsw);
			/*
			if(Object.keys(cartStore.state.items).length > 0)
				syncroCartOnServer()
			*/
		},
		logout(state) {
			state.user = {}
			window.localStorage.removeItem('SiteLogin')
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
			let user = window.localStorage.getItem('SiteLogin')
			context.commit('setUser', user)
		}
	}
})

// Create a new store instance.
const cartStore = Vuex.createStore({
	state () {
		return {
			items: ("SiteCart" in localStorage) ? JSON.parse(window.localStorage.getItem('SiteCart')) : [{}], // shape: [{ id, data, quantity }]
			cartCount: ("SiteCartCount" in localStorage) ? parseInt(window.localStorage.getItem('SiteCartCount')) : 0
		}
	},
	getters: {
		total: state => {
			console.log('getters total')
			if(state.items.length > 0) {
				return 0
				//return state.items.map(item => parseInt(item.data.LISTINOVENDITA)*item.quantity).reduce((total, amount) => total + amount);
			} else {
				return 0;
			}
		}
	},
	mutations: {
		addToCart(state, item) {
            //console.log(item);
			if(typeof item === 'object' && item !== null){
				var itemId = item.itemId
				var itemQty = item.itemQty
			} else {
				var itemId = item
				var itemQty = 1
			}
			
			let found = state.items.find(product => product.id == itemId);

			if (found) {
				//found.quantity ++;
				found.quantity += itemQty
				//found.totalPrice = found.quantity * found.price;
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
					.then(response => (console.log(response)))
					.catch(error => console.log(error))
				*/
				
				data = {
					action: "process",
					processid: "web_ajax_getProduct",
					itemId: itemId
					//debug: true
				}
				
				$.ajax({
					//type: frm.attr('method')
					type: "POST",
					//url: frm.attr('action'),
					//data: JSON.stringify(data),
					data: data,
					success: function (data) {
						dataObj = JSON.parse(data);
						//console.log('returned:', dataObj);
						state.items.push({
							id: itemId,
							data: dataObj.articolo,
							quantity: itemQty,
							price: dataObj.articolo.LISTINOVENDITA
						})
						cartStore.commit('saveCart')
					},
					error: function (data) {
						console.log('An error occurred.', data)
					}
				}).done(function(){
					//cartStore.commit('saveCart')
				});

				//commit('incrementItemQuantity', cartItem)
				//cartItem = state.items.find(product => product.id === item)
				//cartItem.quantity++
				//this.$set(item, 'quantity', itemQty);
				//this.$set(item, 'totalPrice', item.price);
			}

			//state.cartCount++;
			state.cartCount += itemQty;
			showToast(state.cartCount+' articoli nel carrello');
        },
		pushProductToCart (state, { id }) {
			state.items.push({
			  id,
			  quantity: 1
			})
		},
		incrementItemQuantity (state, { id }) {
			const cartItem = state.items.find(item => item.id === id)
			cartItem.quantity++
		},
		removeFromCart(state, item) {
			let index = state.cart.indexOf(item);

			if (index > -1) {
				let product = state.cart[index];
				state.cartCount -= product.quantity;

				state.cart.splice(index, 1);
			}
			this.commit('saveCart')
		},
		saveCart(state) {
			if(!!userStore.state.user && Object.keys(userStore.state.user).length > 0)
				syncroCartOnServer()

			window.localStorage.setItem('SiteCart', JSON.stringify(state.items))
			window.localStorage.setItem('SiteCartCount', state.cartCount)
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
		totalAmount () {
			return this.$store.getters.total
		},
		itemsInCart: function() {
			return this.$store.state.items
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
			addToCart(Vue.toRaw(this.items))
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
	mounted() {
		//const user = await getUser() // Assume getUser returns a user object with a name property
		//this.$store.commit('setUser', user)
		//console.log('async mounted', this.$store.state.cartCount)
		/*
		if ("cartCount" in localStorage)
			this.$store.state.cartCount = parseInt(window.localStorage.getItem('SiteCartCount'))
		*/
	},
	computed: { // computed property will be updated when async call resolves
		/*
		itemsInCart(){
		  let cart = this.$store.getters.cartProducts;
		  return cart.reduce((accum, item) => accum + item.quantity, 0)
		}
		*/
		itemsInCart: function() {
			return this.$store.state.items
		}
	},
	watch: { // watch changes here
		itemsInCart: function(newValue, oldValue) {
			console.log('cartOffCanvasApp watch', this.$store.state.items)
		}
	}
})
cartOffCanvasApp.use(cartStore)

cartNotifyApp = Vue.createApp({
	async mounted() {
		//const user = await getUser() // Assume getUser returns a user object with a name property
		//this.$store.commit('setUser', user)
		//console.log('async mounted', this.$store.state.cartCount)
		/*
		if ("cartCount" in localStorage)
			this.$store.state.cartCount = parseInt(window.localStorage.getItem('SiteCartCount'))
		*/
	},
	computed: { // computed property will be updated when async call resolves
		/*
		itemsInCart(){
		  let cart = this.$store.getters.cartProducts;
		  return cart.reduce((accum, item) => accum + item.quantity, 0)
		}
		*/
		itemsInCart: function() {
			return this.$store.state.cartCount
		}
	},
	watch: { // watch changes here
		itemsInCart: function(newValue, oldValue) {
			console.log('cartNotifyApp watch', this.$store.state.cartCount)
		}
	}
})
cartNotifyApp.use(cartStore)
