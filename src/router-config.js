

module.exports = function(router){
	router.redirect({
	'*': '/demo'
	})
	router.map({
		
		'/demo':{
			component: function(resolve){
			   require(['./pages/demo.vue'],resolve)
			}
		},
		// '/foo': {
		// 	component: function(resolve){
		// 	   require(['./pages/foo.vue'],resolve)
		// 	},
		//     subRoutes:{
		//     	'/foo1/:userid/:cid':{
		//     		component:function(resolve){
		// 				   require(['./pages/foo1.vue'],resolve)
		// 				},
		//     	},
		//     	'/foo2':{
		//     		component:function(resolve){
		// 				   require(['./pages/foo2.vue'],resolve)
		// 				},
		//     	}
	  //   	}
		// }
	})
}
