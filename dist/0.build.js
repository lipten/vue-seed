webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if (media) {
			styleElement.setAttribute("media", media);
		}
	
		if (sourceMap) {
			// https://developer.chrome.com/devtools/docs/javascript-debugging
			// this makes source maps inside style tags work properly in Chrome
			css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */';
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(2)();
	// imports
	
	
	// module
	exports.push([module.id, ".box-sizing{box-sizing:border-box}.text-ellipsis{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.grid{margin:0 auto;width:90%;font-size:0}.grid-item{display:inline-block;border-radius:7px;width:45%;margin:2.5%;overflow:hidden;background-color:#fff}.grid-item img{display:block;width:100%}.detail{border-top:1px solid #eee;padding:1%;font-size:1rem;background-color:#fff}.detail,.name{box-sizing:border-box}.name{width:100%;padding:1vw;color:#ccc;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.price{padding:1vw;color:red}", ""]);
	
	// exports


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(2)();
	// imports
	
	
	// module
	exports.push([module.id, "#carousel-containner{width:90%;margin:0 5%}.carousel{height:224px;overflow:hidden;margin:10px auto}.img-list{position:relative}.img-item{position:absolute;width:50%;transition:all 0s;-webkit-transition:all 0s;z-index:0;opacity:0;border-radius:5px;overflow:hidden;transform:matrix(.8,0,0,.8,0,0);-webkit-transform:matrix(.8,0,0,.8,0,0)}.img-item img{width:100%;vertical-align:bottom}.prev-img-item{z-index:1;opacity:1;transform-origin:left;-webkit-transform-origin:left}.next-img-item{z-index:1;opacity:1;transform-origin:right;-webkit-transform-origin:right}.main-img-item{z-index:2;opacity:1}.img-modal{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.3)}.main-img-item .img-modal{background:transparent}.switch-list{text-align:center}.switch-item{display:inline-block;width:9px;height:9px;background:#e0e0e0;border-radius:50%;margin:0 0 5px 8px;transition:all .8s;-webkit-transition:all .8s}.switch-item-active{background:#ea0201}.switch-list li:first-child{margin-left:0}.body-loading{text-align:center}.body-loading .text-tip{padding:10px;text-align:center;display:inline-block}.body-loading.hide{visibility:hidden;display:block!important}.loading-animate{padding:10px;text-align:center}.loading-animate div{width:10px;height:10px;background:#ffde1b;border-radius:100%;display:inline-block;-webkit-animation:bouncedelay 1.4s infinite ease-in-out;-webkit-animation-fill-mode:both}.loading-animate .bounce1{-webkit-animation-delay:-.32s}.loading-animate .bounce2{-webkit-animation-delay:-.16s}@-webkit-keyframes bouncedelay{0%,80%,to{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}", ""]);
	
	// exports


/***/ },
/* 6 */,
/* 7 */,
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(4);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(3)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/.0.23.1@css-loader/index.js!./../../node_modules/.8.5.3@vue-loader/lib/style-rewriter.js!./../../node_modules/.2.2.3@less-loader/index.js!./../../node_modules/.8.5.3@vue-loader/lib/selector.js?type=style&index=0!./demo.vue", function() {
				var newContent = require("!!./../../node_modules/.0.23.1@css-loader/index.js!./../../node_modules/.8.5.3@vue-loader/lib/style-rewriter.js!./../../node_modules/.2.2.3@less-loader/index.js!./../../node_modules/.8.5.3@vue-loader/lib/selector.js?type=style&index=0!./demo.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(5);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(3)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/.0.23.1@css-loader/index.js!./../../node_modules/.8.5.3@vue-loader/lib/style-rewriter.js!./../../node_modules/.2.2.3@less-loader/index.js!./../../node_modules/.8.5.3@vue-loader/lib/selector.js?type=style&index=0!./demo.vue", function() {
				var newContent = require("!!./../../node_modules/.0.23.1@css-loader/index.js!./../../node_modules/.8.5.3@vue-loader/lib/style-rewriter.js!./../../node_modules/.2.2.3@less-loader/index.js!./../../node_modules/.8.5.3@vue-loader/lib/selector.js?type=style&index=0!./demo.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 10 */,
/* 11 */
/***/ function(module, exports) {

	module.exports = " <div id=carousel-containner></div> <section class=grid> <div class=grid-item v-link=\"{path : '/foo'}\"> <img src=http://img.yzcdn.cn/upload_files/2016/05/31/Fo_uoyBjwr-N9k3w1_u6OnEqaLcb.jpg> <div class=detail> <div class=name>钢铁侠T恤</div> <div class=price>￥66.00</div> </div> </div> <div class=grid-item> <img src=http://img.yzcdn.cn/upload_files/2016/05/31/FhcUL97fjxKa-0omuJdYdOc6l2mb.jpg> <div class=detail> <div class=name>电影周边</div> <div class=price>￥66.00</div> </div> </div> <div class=grid-item> <img src=http://img.yzcdn.cn/upload_files/2016/05/31/FoRllhIvzNIEKuDjCxKqLSo0DEDc.jpg> <div class=detail> <div class=name>美国队长玩偶</div> <div class=price>￥66.00</div> </div> </div> <div class=grid-item> <img src=http://img.yzcdn.cn/upload_files/2016/05/31/FoblBwPnX1y9_flyk0aYXJeYIiHB.jpg> <div class=detail> <div class=name>太阳的后裔周边周边</div> <div class=price>￥66.00</div> </div> </div> </section> ";

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = " <article id=demo> <demo></demo> </article> ";

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// <template>
	//
	// <div id="carousel-containner"></div>
	//     <section class="grid">
	//         <div class="grid-item" v-link="{path : '/foo'}">
	//             <img src="http://img.yzcdn.cn/upload_files/2016/05/31/Fo_uoyBjwr-N9k3w1_u6OnEqaLcb.jpg">
	//             <div class="detail">
	//                 <div class="name">钢铁侠T恤</div>
	//                 <div class="price">￥66.00</div>
	//             </div>
	//         </div>
	//         <div class="grid-item">
	//             <img src="http://img.yzcdn.cn/upload_files/2016/05/31/FhcUL97fjxKa-0omuJdYdOc6l2mb.jpg">
	//             <div class="detail">
	//                 <div class="name">电影周边</div>
	//                 <div class="price">￥66.00</div>
	//             </div>
	//         </div>
	//         <div class="grid-item">
	//             <img src="http://img.yzcdn.cn/upload_files/2016/05/31/FoRllhIvzNIEKuDjCxKqLSo0DEDc.jpg">
	//             <div class="detail">
	//                 <div class="name">美国队长玩偶</div>
	//                 <div class="price">￥66.00</div>
	//             </div>
	//         </div>
	//         <div class="grid-item">
	//             <img src="http://img.yzcdn.cn/upload_files/2016/05/31/FoblBwPnX1y9_flyk0aYXJeYIiHB.jpg">
	//             <div class="detail">
	//                 <div class="name">太阳的后裔周边周边</div>
	//                 <div class="price">￥66.00</div>
	//             </div>
	//         </div>
	//     </section>
	// </template>
	//
	// <script>
	
	
	/*
	異步加載組件
	component:{Foo:function (resolve) {
	  require(['./foo.vue'], resolve)
	}},
	*/
	var VCarousel = __webpack_require__(16);
	var pullHandle = __webpack_require__(17);
	
	module.exports = {
	    ready: function () {
	        new pullHandle({
	            container: "#demo",
	            pullDown: true,
	            pullUp: false
	        });
	        var vcarousel = new VCarousel({
	            wrap: $('#carousel-containner'),
	            pagination: false,
	            data: [{
	                url: '',
	                img: './src/img/1.jpg'
	            }, {
	                url: '',
	                img: './src/img/2.jpg'
	            }, {
	                url: '',
	                img: './src/img/3.jpg'
	            }, {
	                url: '',
	                img: './src/img/4.jpg'
	            }, {
	                url: '',
	                img: './src/img/3.jpg'
	            }]
	        });
	    }
	};
	// </script>
	//
	//
	// <style lang="less">
	// @import "../css/common";
	//
	//
	// .grid{
	//     /*display: flex;*/
	//     margin: 0 auto;
	//     width: 90%;
	//     font-size: 0;
	// }
	// .grid-item{
	//     /*flex:1;*/
	//     display: inline-block;
	//     border-radius: 7px;
	//     width:45%;
	//     margin: 2.5%;
	//     overflow:hidden;
	//     background-color: #fff;
	// }
	// .grid-item img{
	//     display: block;
	//     width: 100%;
	// }
	// .detail{
	//     border-top: 1px solid #eee;
	//     box-sizing: border-box;
	//     padding: 1%;
	//     font-size: 1rem;
	//     background-color: #fff;
	// }
	// .name{
	//     width: 100%;
	//     box-sizing:border-box;
	//     padding: 1vw;
	//     color: #ccc;
	//     overflow: hidden;
	//     white-space: nowrap;
	//     text-overflow:ellipsis;
	// }
	// .price{
	//     padding: 1vw;
	//     color: red;
	// }
	//
	//
	// </style>

	/* generated by vue-loader */

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// <template>
	// <article id="demo">
	//     <demo></demo>
	// </article>
	// </template>
	//
	// <script>
	/*
	異步加載組件
	component:{Foo:function (resolve) {
	  require(['./foo.vue'], resolve)
	}},
	*/
	
	var demo = __webpack_require__(20);
	
	module.exports = {
	  components: { demo }
	};
	// </script>
	//
	// <style lang='less'>
	// @import "../css/plugin/carousel";
	// @import "../css/plugin/pullHandle";
	// </style>

	/* generated by vue-loader */

/***/ },
/* 15 */,
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	
	window.VCarousel = function (opts) {
	    this.wrap = opts.wrap || $('body');
	    this.carousel = null;
	    this.imgItems = null;
	    this.switchItems = null;
	    this.listSize = 0;
	    this.mainImgItem = null, this.prevImgItem = null, this.nextImgItem = null, this.leftImgItem = null, this.rightImgItem = null, this.mainSwitchItem = null;
	    this.pagination = opts.pagination || false;
	    this.init(opts.data);
	    console.log('aasdf');
	};
	
	VCarousel.prototype = {
	    init: function (data) {
	        this.carousel = $('<div class="carousel"><div class="img-list"></div></div>');
	        this.wrap.append(this.carousel[0]);
	        this.imgList = $('.img-list');
	        var imgListTpl = '',
	            switchListTpl = '';
	        for (var i = 0; i < data.length; i++) {
	            imgListTpl += '<a data-index=' + i + ' data-url="' + data[i].url + '" class="img-item"><img src="' + data[i].img + '"><div class="img-modal"></div></a>';
	            switchListTpl += '<li data-index=' + i + ' class="switch-item"></li>';
	        }
	        this.imgList.append($(imgListTpl));
	        if (this.pagination) {
	            this.switchList = $('<ul class="switch-list"></ul>');
	            this.switchList.append($(switchListTpl));
	            this.carousel.after(this.switchList);
	        }
	
	        this.listSize = $('.img-item').size();
	        this.mainImgItem = $('.img-item[data-index="' + 0 + '"]');
	        this.prevImgItem = $('.img-item[data-index="' + (this.listSize - 1) + '"]');
	        this.nextImgItem = $('.img-item[data-index="' + 1 + '"]');
	        this.leftImgItem = $('.img-item[data-index="' + (this.listSize - 2) + '"]');
	        this.rightImgItem = $('.img-item[data-index="' + 2 + '"]');
	        this.mainSwitchItem = $('.switch-item[data-index="' + 0 + '"]');
	
	        this.parentWidth = $('.carousel').width();
	        this.middleMargin = this.parentWidth / 4;
	        this.leftMargin = $('.img-item').eq(1).width();
	
	        var self = this;
	        setTimeout(function () {
	            self.setDuration($('.img-item'), '0.8');
	        }, 500);
	        this.addStyle();
	        this.bindEvent();
	
	        var _this = this;
	        $('.img-item').eq(0).find('img')[0].onload = function () {
	            var bigHeight = $('.img-item').eq(0).height();
	            _this.carousel.height(bigHeight);
	        };
	    },
	    setDuration: function (ele, time) {
	        ele.css({ 'transition-duration': time + 's', '-webkit-transition-duration': time + 's' });
	    },
	    setTransform: function (ele, param) {
	        ele.css({ '-webkit-transform': 'matrix(' + param + ')', 'transform': 'matrix(' + param + ')' });
	    },
	    bindEvent: function () {
	        var self = this;
	        $('.img-item').on('swipeLeft', function () {
	            var index = $('.next-img-item').attr('data-index');
	            self.switchItem(index);
	        });
	        $('.img-item').on('swipeRight', function () {
	            var index = $('.prev-img-item').attr('data-index');
	            self.switchItem(index);
	        });
	        $('.img-item').on('tap', function (e) {
	            //e.stopPropagation();
	            var isMainImgItem = $(e.target).parent().hasClass('main-img-item');
	
	            if (isMainImgItem) {
	                window.location = $(e.target).parent().attr('data-url');
	            } else {
	                var index = $(e.target).parent().attr('data-index');
	                self.switchItem(index);
	            }
	        });
	    },
	    clearStyle: function () {
	        this.mainImgItem.removeClass('main-img-item');
	        this.prevImgItem.removeClass('prev-img-item');
	        this.nextImgItem.removeClass('next-img-item');
	        this.leftImgItem.removeClass('left-img-item');
	        this.rightImgItem.removeClass('right-img-item');
	        this.mainSwitchItem.removeClass('switch-item-active');
	
	        $('.img-item').attr('style', null);
	        this.setDuration($('.img-item'), '0.8');
	    },
	    addStyle: function (index) {
	        this.mainImgItem.addClass('main-img-item');
	        this.prevImgItem.addClass('prev-img-item');
	        this.nextImgItem.addClass('next-img-item');
	        this.leftImgItem.addClass('left-img-item');
	        this.rightImgItem.addClass('right-img-item');
	        this.mainSwitchItem.addClass('switch-item-active');
	
	        this.setTransform($('.main-img-item'), '1.0,0.0,0.0,1.0,' + this.middleMargin + ',0');
	        this.setTransform($('.next-img-item'), '0.8,0.0,0.0,0.8,' + (this.parentWidth * 1 - this.leftMargin * 1 - this.leftMargin * .28) + ',0');
	        this.setTransform($('.prev-img-item'), '0.8,0.0,0.0,0.8,' + 5 + ',0)');
	    },
	    switchItem: function (index) {
	        index = parseInt(index);
	        this.clearStyle();
	        this.mainImgItem = $('.img-item[data-index="' + index + '"]');
	        if (this.pagination) {
	            this.mainSwitchItem = $('.switch-item[data-index="' + index + '"]');
	        }
	
	        if (index === 0) {
	            this.prevImgItem = $('.img-item[data-index="' + (this.listSize - 1) + '"]');
	            this.leftImgItem = $('.img-item[data-index="' + (this.listSize - 2) + '"]');
	        } else if (index === 1) {
	            this.prevImgItem = $('.img-item[data-index="' + (index - 1) + '"]');
	            this.leftImgItem = $('.img-item[data-index="' + (this.listSize - 1) + '"]');
	        } else if (index > 1) {
	            this.prevImgItem = $('.img-item[data-index="' + (index - 1) + '"]');
	            this.leftImgItem = $('.img-item[data-index="' + (index - 2) + '"]');
	        }
	
	        if (index === this.listSize - 1) {
	            this.nextImgItem = $('.img-item[data-index="' + 0 + '"]');
	            this.rightImgItem = $('.img-item[data-index="' + 1 + '"]');
	        } else if (index === this.listSize - 2) {
	            this.nextImgItem = $('.img-item[data-index="' + (this.listSize - 1) + '"]');
	            this.rightImgItem = $('.img-item[data-index="' + 0 + '"]');
	        } else if (index < this.listSize - 2) {
	            this.nextImgItem = $('.img-item[data-index="' + (index + 1) + '"]');
	            this.rightImgItem = $('.img-item[data-index="' + (index + 2) + '"]');
	        }
	
	        this.addStyle(index);
	    }
	};
	
	module.exports = VCarousel;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	
	var pullHandle = function (options) {
	
	    var self = this;
	
	    self.view = options.view;
	    self.page = options.page || 0;
	    // 记录原来规定的起始页
	    this.opage = options.page || 0;
	    self.container = options.container || 'article';
	    self.size = options.size ? options.size : 15;
	    self.loading = false;
	    self.finished = false;
	    // self.collection = self.view.collection
	    self.url = options.url || '';
	    self.callback = options.callback ? options.callback : function () {};
	
	    /*上拉加载*/
	
	    if (!!options.pullUp) {
	        if ($(".body-loading").length == 0) {
	            $(self.container).append('<aside class="body-loading"><div class="loading-animate">' + '<div class="bounce1"></div>' + '<div class="bounce2"></div>' + '<div class="bounce3"></div>' + '</div><aside>');
	        }
	
	        $(window).on('scroll', function () {
	            var scrollHeight = $(document).height() - $(window).height();
	            var scrollTop = document.documentElement.scrollTop + document.body.scrollTop;
	            if (scrollTop > scrollHeight - 30 && !self.loading && !self.finished) {
	                $('.body-loading').removeClass('hide');
	                self.loading = true;
	                self.page++;
	
	                //定时开始请求
	                /*var complete = false
	                  var postTime = 0;
	                var timer = setInterval(function(){
	                    postTime++;
	                    if(complete&&postTime==1){
	                        complete()
	                        complete = false
	                        clearInterval(timer)
	                    }
	                },1000)
	                        // new a collection
	                var temp_collection = new window.app.collection;
	                temp_collection.url = self.url;
	                temp_collection.fetch({
	                    data: {
	                        page: self.page,
	                        size: self.size
	                    },
	                    success: function(data) {
	                        var models = data.models;
	                          if(postTime>=1){
	                            $('.body-loading').addClass('hide');
	                            if (models.length == 0) {
	                                self.finished = true;
	                                $('.body-loading').removeClass('hide');
	                                $('.body-loading').html('<span class="text-tip">没有更多内容。</span>')
	                            }
	                            _.each(models, function(model) {
	                                self.collection.add(model);
	                            });
	                            self.loading = false;
	                            options.pullUp.callback&&options.pullUp.callback()
	                            clearInterval(timer)
	                        }else{
	                            complete = function(){
	                                $('.body-loading').addClass('hide');
	                                if (models.length == 0) {
	                                    self.finished = true;
	                                    $('.body-loading').removeClass('hide');
	                                    $('.body-loading').html('<span class="text-tip">没有更多内容。</span>')
	                                }
	                                _.each(models, function(model) {
	                                    self.collection.add(model);
	                                });
	                                self.loading = false;
	                                  options.pullUp.callback&&options.pullUp.callback()
	                            }
	                        }
	                    },
	                    error: function(){
	                        $('.body-loading').html('<span class="text-tip">数据加载出错，请检查您的网络</span>')
	                    }
	                });*/
	            }
	        });
	    }
	
	    /*下拉刷新*/
	
	    /*插入下拉刷新元素*/
	    var loading;
	    var obj = document.querySelector(self.container);
	    if ($(".refresh").length == 0) {
	        loading = document.createElement('div');
	        loading.innerHTML = '<div class="loading-animate">' + '<div class="bounce1"></div>' + '<div class="bounce2"></div>' + '<div class="bounce3"></div>' + '</div>';
	        loading.className = 'refresh';
	        obj.insertBefore(loading, obj.children[0]);
	        obj.style.marginBottom = '-35px';
	    } else {
	        loading = $(".refresh")[0];
	    }
	
	    var start,
	        end,
	        length,
	        isLock = false,
	        //是否锁定整个操作
	    isCanDo = false,
	        //是否移动滑块
	    isTouchPad = /hp-tablet/gi.test(navigator.appVersion),
	        hasTouch = 'ontouchstart' in window && !isTouchPad;
	
	    var offset = loading.clientHeight;
	    var objparent = obj.parentElement;
	
	    /*操作方法*/
	    var fn = {
	        //移动容器
	        translate: function (diff) {
	            obj.style.webkitTransform = 'translate3d(0,' + diff + 'px,0)';
	            obj.style.transform = 'translate3d(0,' + diff + 'px,0)';
	        },
	        //设置效果时间
	        setTransition: function (time) {
	            obj.style.webkitTransition = 'transform ' + time + 's ease';
	            obj.style.transition = 'transform ' + time + 's ease';
	        },
	        //返回到初始位置
	        back: function (reset) {
	            fn.setTransition(.2);
	            fn.translate(0 - offset);
	            if (reset) {
	                loading.innerHTML = '<div class="loading-animate">' + '<div class="bounce1"></div>' + '<div class="bounce2"></div>' + '<div class="bounce3"></div>' + '</div>';
	            }
	            //标识操作完成
	            isLock = false;
	        },
	        addEvent: function (element, event_name, event_fn) {
	            if (element.addEventListener) {
	                element.addEventListener(event_name, event_fn, false);
	            } else if (element.attachEvent) {
	                element.attachEvent('on' + event_name, event_fn);
	            } else {
	                element['on' + event_name] = event_fn;
	            }
	        },
	        removeEvent: function (element, event_name, event_fn) {
	            if (element.removeEventListener) {
	                element.removeEventListener(event_name, event_fn, false);
	            } else if (element.detachEvent) {
	                element.detachEvent('on' + event_name, event_fn);
	            } else {
	                element['on' + event_name] = null;
	            }
	        }
	    };
	
	    this.removeEvent = function () {
	        fn.removeEvent(obj, 'touchstart', touchStart);
	        fn.removeEvent(obj, 'touchmove', touchMove);
	        fn.removeEvent(obj, 'touchend', touchEnd);
	        $(loading).remove();
	        fn.setTransition(0);
	        fn.translate(0);
	    };
	
	    if (!!options.pullDown) {
	        fn.translate(0 - offset);
	        fn.addEvent(obj, 'touchstart', touchStart);
	        fn.addEvent(obj, 'touchmove', touchMove);
	        fn.addEvent(obj, 'touchend', touchEnd);
	        /*fn.addEvent(obj,'mousedown',touchStart)
	         fn.addEvent(obj,'mousemove',touchMove)
	         fn.addEvent(obj,'mouseup',touchEnd)*/
	    } else {
	        this.destroy();
	    }
	
	    //滑动开始
	    function touchStart(e) {
	        if (objparent.scrollTop <= 0 && !isLock) {
	            var even = typeof event == "undefined" ? e : event;
	            //标识操作进行中
	            isLock = true;
	            isCanDo = true;
	            //保存当前鼠标Y坐标
	            start = hasTouch ? even.touches[0].pageY : even.pageY;
	            //消除滑块动画时间
	            fn.setTransition(0);
	            //loading.innerHTML='下拉刷新数据';
	        }
	        return false;
	    }
	
	    //滑动中
	    function touchMove(e) {
	        if (objparent.scrollTop <= 0 && isCanDo) {
	            var even = typeof event == "undefined" ? e : event;
	            //保存当前鼠标Y坐标
	            end = hasTouch ? even.touches[0].pageY : even.pageY;
	
	            if (start < end) {
	
	                even.preventDefault();
	                //消除滑块动画时间
	                fn.setTransition(0);
	                //移动滑块
	                if ((end - start - offset) / 2 <= 150) {
	                    //                            console.log(((end - start - offset) / 4)-30)
	                    length = (end - start - offset) / 3 - 25;
	                    fn.translate(length);
	                } else {
	                    length += 0.3;
	                    fn.translate(length);
	                }
	                if (end - start >= 180) {
	                    //loading.innerHTML='释放刷新';
	                }
	            }
	        }
	    }
	    //滑动结束
	    function touchEnd(e) {
	        if (isCanDo) {
	            isCanDo = false;
	            //判断滑动距离是否大于等于指定值
	
	            if (end - start >= 180 && Math.abs(e.changedTouches[0].pageY - start) > 20) {
	                //设置滑块回弹时间
	                fn.setTransition(.2);
	
	                //保留提示部分
	                fn.translate(0);
	
	                //返回初始状态
	                setTimeout(function () {
	                    fn.back();
	                }, 1000);
	
	                //执行回调函数
	                //loading.innerHTML='正在刷新数据';
	
	                //松手之后执行逻辑,ajax请求数据，数据返回后隐藏加载中提示
	
	
	                //定时开始请求
	                /*var complete = false
	                  var postTime = 0;
	                var timer = setInterval(function(){
	                    postTime++;
	                    if(complete&&postTime==1){
	                        fn.back();
	                        self.reset();
	                        clearInterval(timer)
	                    }
	                },1000)*/
	
	                /*var collection = self.view.collection;
	                collection.url = self.url;
	                self.page = 1;
	                  collection.fetch({
	                    data: {
	                        page: options.page || 0,
	                        size: 5,
	                    },
	                    success: function (data) {
	                        if(postTime>=1){
	                            fn.back();
	                            options.pullDown.callback&&options.pullDown.callback()
	                            self.reset();
	                            clearInterval(timer)
	                        }else{
	                            complete = true
	                        }
	                    },
	                    error: function(){
	                        loading.innerHTML='<div class="loading-animate">数据读取失败，请检查您的网络</div>';
	                        setTimeout(function(){
	                            fn.back(true);
	                        },2000)
	                    }
	                });*/
	            } else {
	                //返回初始状态
	                fn.back();
	            }
	        }
	    }
	};
	
	pullHandle.prototype.changeUrl = function (url) {
	    this.url = url;
	};
	
	pullHandle.prototype.hide = function () {
	    $('.body-loading').addClass('hide');
	    this.finished = true;
	    this.loading = true;
	};
	
	pullHandle.prototype.reset = function () {
	    $('.body-loading').html('<div class="loading-animate">' + '<div class="bounce1"></div>' + '<div class="bounce2"></div>' + '<div class="bounce3"></div>' + '</div>');
	    if ($('#content-section').outerHeight > window.innerHeight) $('.body-loading').removeClass('hide');
	    this.finished = false;
	    this.loading = false;
	    this.page = this.opage;
	};
	
	pullHandle.prototype.destroy = function () {
	    var obj = document.querySelector(this.container);
	    obj.style.marginBottom = '0';
	    this.removeEvent();
	};
	
	module.exports = pullHandle;

/***/ },
/* 18 */,
/* 19 */,
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(8)
	__vue_script__ = __webpack_require__(13)
	__vue_template__ = __webpack_require__(11)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(9)
	__vue_script__ = __webpack_require__(14)
	__vue_template__ = __webpack_require__(12)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}


/***/ }
]);