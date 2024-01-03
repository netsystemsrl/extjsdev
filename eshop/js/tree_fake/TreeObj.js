import Tree from "./Tree.vue";

	const tree = {
	  label: "A cool folder",
	  children: [
		{
		  label: "A cool sub-folder 1",
		  children: [
			{ label: "A cool sub-sub-folder 1" },
			{ label: "A cool sub-sub-folder 2" }
		  ]
		},
		{ label: "This one is not that cool" }
	  ]
	}
	const TreeApp = Vue.createApp( {
	  data: () => ({
		tree: {
		  label: "A cool folder",
		  children: [
			{
			  label: "A cool sub-folder 1",
			  children: [
				{ label: "A cool sub-sub-folder 1" },
				{ label: "A cool sub-sub-folder 2" }
			  ]
			},
			{ label: "This one is not that cool" }
		  ]
		}
	  }),
	  components: {
		Tree
	  }
	});
	
	export default TreeApp;