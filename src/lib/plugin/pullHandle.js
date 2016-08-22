var $ = require('../zepto')

var pullHandle = function(options){

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
        self.url = options.url || ''
        self.callback = options.callback ? options.callback : function() {};


        /*上拉加载*/

        if(!!options.pullUp){
            if($(".body-loading").length==0){
                 $(self.container).append('<aside class="body-loading"><div class="loading-animate">'+
                '<div class="bounce1"></div>'+
                '<div class="bounce2"></div>'+
                '<div class="bounce3"></div>'+
                '</div><aside>')
            }
        
            $(window).on('scroll',function() {
                var scrollHeight = $(document).height() - $(window).height();
                var scrollTop = document.documentElement.scrollTop + document.body.scrollTop;
                if (scrollTop > scrollHeight - 30 && !self.loading && !self.finished) {
                    $('.body-loading').removeClass('hide');
                    self.loading = true;
                    self.page ++;



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
            if($(".refresh").length==0){
                loading = document.createElement('div')
                loading.innerHTML = '<div class="loading-animate">'+
                    '<div class="bounce1"></div>'+
                    '<div class="bounce2"></div>'+
                    '<div class="bounce3"></div>'+
                    '</div>'
                loading.className = 'refresh'
                obj.insertBefore(loading,obj.children[0])
                obj.style.marginBottom = '-35px'
            }else{
                loading = $(".refresh")[0]
            }




            var start,
                end,
                length,
                isLock = false,//是否锁定整个操作
                isCanDo = false,//是否移动滑块
                isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
                hasTouch = 'ontouchstart' in window && !isTouchPad;


            var offset=loading.clientHeight;
            var objparent = obj.parentElement;




            /*操作方法*/
            var fn =
            {
                //移动容器
                translate: function (diff) {
                    obj.style.webkitTransform='translate3d(0,'+diff+'px,0)';
                    obj.style.transform='translate3d(0,'+diff+'px,0)';
                },
                //设置效果时间
                setTransition: function (time) {
                    obj.style.webkitTransition='transform '+time+'s ease';
                    obj.style.transition='transform '+time+'s ease';
                },
                //返回到初始位置
                back: function (reset) {
                    fn.setTransition(.2)
                    fn.translate(0 - offset);
                    if(reset){
                        loading.innerHTML = '<div class="loading-animate">'+
                            '<div class="bounce1"></div>'+
                            '<div class="bounce2"></div>'+
                            '<div class="bounce3"></div>'+
                            '</div>'
                    }
                    //标识操作完成
                    isLock = false;
                },
                addEvent:function(element,event_name,event_fn){
                    if (element.addEventListener) {
                        element.addEventListener(event_name, event_fn, false);
                    } else if (element.attachEvent) {
                        element.attachEvent('on' + event_name, event_fn);
                    } else {
                        element['on' + event_name] = event_fn;
                    }
                },
                removeEvent:function(element,event_name,event_fn){
                    if (element.removeEventListener) {
                        element.removeEventListener(event_name, event_fn, false);
                    } else if (element.detachEvent) {
                        element.detachEvent('on' + event_name, event_fn);
                    } else {
                        element['on' + event_name] = null;
                    }
                }
            };

            this.removeEvent = function(){
                fn.removeEvent(obj,'touchstart',touchStart);
                fn.removeEvent(obj,'touchmove',touchMove);
                fn.removeEvent(obj,'touchend',touchEnd);
                $(loading).remove();
                fn.setTransition(0);
                fn.translate(0);
            };


            if(!!options.pullDown) {
                fn.translate(0 - offset);
                fn.addEvent(obj, 'touchstart', touchStart);
                fn.addEvent(obj, 'touchmove', touchMove);
                fn.addEvent(obj, 'touchend', touchEnd);
                /*fn.addEvent(obj,'mousedown',touchStart)
                 fn.addEvent(obj,'mousemove',touchMove)
                 fn.addEvent(obj,'mouseup',touchEnd)*/
            }else{
                this.destroy()
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
                        if((end-start-offset)/2<=150) {
//                            console.log(((end - start - offset) / 4)-30)
                            length=((end - start - offset) / 3)-25;
                            fn.translate(length);
                        }
                        else {
                            length+=0.3;
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

                    if (end - start >= 180 && Math.abs(e.changedTouches[0].pageY-start)>20) {
                        //设置滑块回弹时间
                        fn.setTransition(.2);
                       
                        //保留提示部分
                        fn.translate(0);

                         //返回初始状态
                        setTimeout(function(){
                        fn.back();
                        },1000)



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



    }



    pullHandle.prototype.changeUrl = function(url){
        this.url = url
    }

    pullHandle.prototype.hide = function(){
        $('.body-loading').addClass('hide');
        this.finished = true;
        this.loading = true;
    }

    pullHandle.prototype.reset = function(){
        $('.body-loading').html('<div class="loading-animate">'+
            '<div class="bounce1"></div>'+
            '<div class="bounce2"></div>'+
            '<div class="bounce3"></div>'+
            '</div>')
        if($('#content-section').outerHeight>window.innerHeight)
        $('.body-loading').removeClass('hide');
        this.finished = false;
        this.loading = false;
        this.page = this.opage;
    }


    pullHandle.prototype.destroy = function(){
        var obj = document.querySelector(this.container);
        obj.style.marginBottom = '0';
        this.removeEvent()
    }

module.exports = pullHandle;
