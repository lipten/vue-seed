/*公用文件在這裡加載*/
var Vue = require('vue');
var VueRouter = require('vue-router');
var configRouter = require('./router-config');
/*通用類庫先加載*/
var $ = require('./lib/zepto');
var fastclick = require('./lib/fastclick');
var http = require('./lib/Prorest');

var lazyload = require('./lib/vue-lazyload');
Vue.use(lazyload, {
  error: './img/error.png',
  loading: 'http://7u2spr.com1.z0.glb.clouddn.com/20160524-19554757444143eb8a5.png?imageView2/2/w/400',
  try: 3 // default 1
});


/*路由实例*/
var App = Vue.extend({});
Vue.use(VueRouter);
const router = new VueRouter();
configRouter(router);
router.start(App, 'body');
Vue.router = router

fastclick.attach(document.body);


//控制字体大小
var htmlWidth = window.innerWidth;
if (htmlWidth >= 750) {
		document.getElementsByTagName('html')[0].style.fontSize = '28px';
} else {
		document.getElementsByTagName('html')[0].style.fontSize = 28 / 750 * htmlWidth + "px";
}

var $http = new http({
	baseUrl: '/'
})

window.$http = $http;



