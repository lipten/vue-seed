'use strict';

// var Promise = require('es6-promise').Promise;

if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        'use strict';

        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

exports.install = function (Vue, Options) {
    var isVueNext = Vue.version.split('.')[0] === '2';
    var DEFAULT_PRE = 1.3;
    var DEFAULT_URL = 'data:img/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEXs7Oxc9QatAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';
    if (!Options) {
        Options = {
            preLoad: DEFAULT_PRE,
            error: DEFAULT_URL,
            loading: DEFAULT_URL,
            try: 3
        };
    }
    var Init = {
        preLoad: Options.preLoad || DEFAULT_PRE,
        error: Options.error ? Options.error : DEFAULT_URL,
        loading: Options.loading ? Options.loading : DEFAULT_URL,
        hasbind: false,
        try: Options.try ? Options.try : 1
    };

    var Listeners = [];
    var Loaded = [];

    var throttle = function throttle(action, delay) {
        var timeout = null;
        var lastRun = 0;
        return function () {
            if (timeout) {
                return;
            }
            var elapsed = +new Date() - lastRun;
            var context = this;
            var args = arguments;
            var runCallback = function runCallback() {
                lastRun = +new Date();
                timeout = false;
                action.apply(context, args);
            };

            if (elapsed >= delay) {
                runCallback();
            } else {
                timeout = setTimeout(runCallback, delay);
            }
        };
    };

    var _ = {
        on: function on(el, type, func) {
            el.addEventListener(type, func);
        },
        off: function off(el, type, func) {
            el.removeEventListener(type, func);
        }
    };

    var lazyLoadHandler = throttle(function () {
        for (var i = 0, len = Listeners.length; i < len; ++i) {
            checkCanShow(Listeners[i]);
        }
    }, 10);

    var onListen = function onListen(el, start) {
        if (start) {
            _.on(el, 'scroll', lazyLoadHandler);
            _.on(el, 'wheel', lazyLoadHandler);
            _.on(el, 'mousewheel', lazyLoadHandler);
            _.on(el, 'resize', lazyLoadHandler);
            _.on(el, 'animationend', lazyLoadHandler);
            _.on(el, 'transitionend', lazyLoadHandler);
        } else {
            Init.hasbind = false;
            _.off(el, 'scroll', lazyLoadHandler);
            _.off(el, 'wheel', lazyLoadHandler);
            _.off(el, 'mousewheel', lazyLoadHandler);
            _.off(el, 'resize', lazyLoadHandler);
            _.off(el, 'animationend', lazyLoadHandler);
            _.off(el, 'transitionend', lazyLoadHandler);
        }
    };


    var setElRender = function setElRender(el, bindType, src, state,modifiers) {
        if (!bindType) {
            el.setAttribute('src', src);
        } else {
            el.setAttribute('style', bindType + ': url(' + src + ')');
        }

        el.setAttribute('lazy', state);

        modifiers&&modifiers.resize&&el.setAttribute('resize', modifiers.resize);

        if(state=='loaded'||state=='error'){
            el.getAttribute('resize')&&scropLoad(el) 
        }
    };

    var checkCanShow = function checkCanShow(listener) {
        if (Loaded.indexOf(listener.src) > -1) return setElRender(listener.el, listener.bindType, listener.src, 'loaded');
        var rect = listener.el.getBoundingClientRect();
        if ((rect.top < window.innerHeight * Init.preLoad && rect.bottom > 0) && (rect.left < window.innerWidth * Init.preLoad && rect.right > 0)) {
            render(listener);
        }
    };

    

    var render = function render(item) {
        if (item.try >= Init.try) {
            return false;
        }
        item.try++;

        loadImageAsync(item).then(function (url) {
            var index = Listeners.indexOf(item);
            if (index !== -1) {
                Listeners.splice(index, 1);
            }
            setElRender(item.el, item.bindType, item.src, 'loaded');
            Loaded.push(item.src);
        }).catch(function (error) {
            setElRender(item.el, item.bindType, Init.error, 'error');
        });
    };

    //居中显示
    var scropLoad = function(el) {
        var objHeight = el.offsetHeight; //图片高度
        var objWidth = el.offsetWidth; //图片宽度
        var parent = el.parentNode;
        var parentHeight = parent.offsetHeight; //图片父容器高度
        var parentWidth = parent.offsetWidth; //图片父容器宽度

        var parentShortWidth = (parentHeight>=parentWidth)
        var parentRatio = parentWidth/parentHeight // 父元素的宽高比

        var shortWidth = (objHeight>=objWidth)
        var ratio = objWidth/objHeight  // 子元素的宽高比


        var fullwidth = false;
        var dynamicVal = ''
        // 如果父元素偏高且如果子元素偏宽
        if(parentShortWidth&&!shortWidth){
            fullwidth = false;
        }else if(!parentShortWidth&&shortWidth){
            fullwidth = true;
        }
        else{
            // 如果子元素的宽高比偏大
            if(ratio>parentRatio){
                fullwidth = false; // 让高度撑满
            }else{
                fullwidth = true;
            }
        }
        
        parent.setAttribute('style', 'overflow:hidden;position:relative;z-index:1;');
        el.setAttribute('style','background: #000;position:absolute;'+(fullwidth?'width:100%;height:auto':'height:100%;width:auto'));

        // 设置完高度再进行计算
        if (fullwidth) {
          dynamicVal = 'left:0;top:-'+(el.offsetHeight - parentHeight)/2+'px;'
        }else{
          dynamicVal = 'top:0;left:-'+(el.offsetWidth - parentWidth)/2+'px;'
        }

        el.style.cssText = el.style.cssText + dynamicVal
    };

    var loadImageAsync = function loadImageAsync(item) {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            image.src = item.src;

            image.onload = function () {
                resolve(item.src);
            };

            image.onerror = function () {
                reject();
            };
        });
    };

    var componentWillUnmount = function componentWillUnmount(el, binding, vnode, OldVnode) {
        if (!el) return;

        for (var i = 0, len = Listeners.length; i < len; i++) {
            if (Listeners[i] && Listeners[i].el === el) {
                Listeners.splice(i, 1);
            }
        }

        if (Init.hasbind && Listeners.length == 0) {
            onListen(window, false);
        }
    };

    var addListener = function addListener(el, binding, vnode) {
        if (el.getAttribute('lazy') === 'loaded') return;
        var hasIt = Listeners.find(function (item) {
            return item.el === el;
        });
        if (hasIt) {
            return Vue.nextTick(function () {
                setTimeout(function () {
                    lazyLoadHandler();
                }, 0);
            });
        }

        var parentEl = null;

        if (binding.modifiers) {
            parentEl = window.document.getElementById(Object.keys(binding.modifiers)[0]);
        }

        setElRender(el, binding.arg, Init.loading, 'loading',binding.modifiers);

        Vue.nextTick(function () {
            Listeners.push({
                bindType: binding.arg,
                try: 0,
                parentEl: parentEl,
                el: el,
                src: binding.value
            });
            lazyLoadHandler();
            if (Listeners.length > 0 && !Init.hasbind) {
                Init.hasbind = true;
                onListen(window, true);
            }
            if (parentEl) {
                onListen(parentEl, true);
            }
        });
    };

    if (isVueNext) {
        Vue.directive('lazy', {
            bind: addListener,
            update: addListener,
            componentUpdated: lazyLoadHandler,
            unbind: componentWillUnmount
        });
    } else {
        Vue.directive('lazy', {
            bind: function bind() {},
            update: function update(newValue, oldValue) {
                addListener(this.el, {
                    modifiers: this.modifiers,
                    arg: this.arg,
                    value: newValue,
                    oldValue: oldValue
                });
            },
            unbind: function unbind() {
                componentWillUnmount(this.el);
            }
        });
    }
};