var $ = require('../zepto')


window.VCarousel = function(opts) {
    this.wrap = opts.wrap || $('body');
    this.carousel = null;
    this.imgItems = null;
    this.switchItems = null;
    this.listSize = 0;
    this.mainImgItem = null,
    this.prevImgItem = null,
    this.nextImgItem = null,
    this.leftImgItem = null,
    this.rightImgItem = null,
    this.mainSwitchItem = null;
    this.pagination = opts.pagination||false;
    this.init(opts.data);
    console.log('aasdf')
}


VCarousel.prototype = {
    init: function(data){
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
        if(this.pagination){
            this.switchList = $('<ul class="switch-list"></ul>');
            this.switchList.append($(switchListTpl));
            this.carousel.after(this.switchList)
        }
    
        this.listSize = $('.img-item').size();
        this.mainImgItem = $('.img-item[data-index="' + 0 + '"]');
        this.prevImgItem = $('.img-item[data-index="' + (this.listSize - 1) + '"]');
        this.nextImgItem = $('.img-item[data-index="' + 1 + '"]');
        this.leftImgItem = $('.img-item[data-index="' + (this.listSize - 2) + '"]');
        this.rightImgItem = $('.img-item[data-index="' + 2 + '"]');
        this.mainSwitchItem = $('.switch-item[data-index="' + 0 + '"]');



        this.parentWidth = $('.carousel').width();
        this.middleMargin = this.parentWidth/4;
        this.leftMargin =  $('.img-item').eq(1).width();
        
       var self = this;
        setTimeout(function(){
            self.setDuration($('.img-item'),'0.8');
        },500)
        this.addStyle();
        this.bindEvent();


        var _this = this;
        $('.img-item').eq(0).find('img')[0].onload=function(){
            var bigHeight = $('.img-item').eq(0).height()
            _this.carousel.height(bigHeight)
        }




    },
    setDuration:function(ele,time){
        ele.css({'transition-duration':time+'s','-webkit-transition-duration':time+'s'})
    },
    setTransform:function(ele,param){
        ele.css({ '-webkit-transform':'matrix('+param+')','transform':'matrix('+param+')'})
    },
    bindEvent: function(){
        var self = this;
        $('.img-item').on('swipeLeft',function(){
            var index = $('.next-img-item').attr('data-index')
            self.switchItem(index);
        })
        $('.img-item').on('swipeRight',function(){
            var index = $('.prev-img-item').attr('data-index')
            self.switchItem(index);
        })
        $('.img-item').on('tap',function(e) {
            //e.stopPropagation();
            var isMainImgItem = $(e.target).parent().hasClass('main-img-item');

            if(isMainImgItem){
                window.location = $(e.target).parent().attr('data-url')
            }else{
                var index = $(e.target).parent().attr('data-index');
                self.switchItem(index);
            }
        });
    },
    clearStyle: function(){
        this.mainImgItem.removeClass('main-img-item');
        this.prevImgItem.removeClass('prev-img-item');
        this.nextImgItem.removeClass('next-img-item');
        this.leftImgItem.removeClass('left-img-item');
        this.rightImgItem.removeClass('right-img-item');
        this.mainSwitchItem.removeClass('switch-item-active');

        $('.img-item').attr('style',null)
        this.setDuration($('.img-item'),'0.8');
    },
    addStyle: function(index){
        this.mainImgItem.addClass('main-img-item');
        this.prevImgItem.addClass('prev-img-item');
        this.nextImgItem.addClass('next-img-item');
        this.leftImgItem.addClass('left-img-item');
        this.rightImgItem.addClass('right-img-item');
        this.mainSwitchItem.addClass('switch-item-active');
       

       this.setTransform($('.main-img-item'),'1.0,0.0,0.0,1.0,'+this.middleMargin+',0')
       this.setTransform($('.next-img-item'),'0.8,0.0,0.0,0.8,'+(this.parentWidth*1-this.leftMargin*1-(this.leftMargin*.28))+',0')
       this.setTransform($('.prev-img-item'),'0.8,0.0,0.0,0.8,'+5+',0)')
    },
    switchItem: function(index) {
        index = parseInt(index);
        this.clearStyle();
        this.mainImgItem = $('.img-item[data-index="' + index + '"]');
        if(this.pagination){
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
    
        if (index === (this.listSize - 1)) {
            this.nextImgItem = $('.img-item[data-index="' + 0 + '"]');
            this.rightImgItem = $('.img-item[data-index="' + 1 + '"]');
        } else if (index === (this.listSize - 2)) {
            this.nextImgItem = $('.img-item[data-index="' + (this.listSize - 1) + '"]');
            this.rightImgItem = $('.img-item[data-index="' + 0 + '"]');
        } else if (index < (this.listSize - 2)) {
            this.nextImgItem = $('.img-item[data-index="' + (index + 1) + '"]');
            this.rightImgItem = $('.img-item[data-index="' + (index + 2) + '"]');
        }

        this.addStyle(index);
    }
}

module.exports = VCarousel;
