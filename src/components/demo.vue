<template>

<div id="carousel-containner"></div>
    <section class="grid">
        <div class="grid-item" v-link="{path : '/foo'}">
            <img src="http://img.yzcdn.cn/upload_files/2016/05/31/Fo_uoyBjwr-N9k3w1_u6OnEqaLcb.jpg">
            <div class="detail">
                <div class="name">钢铁侠T恤</div>
                <div class="price">￥66.00</div>
            </div>
        </div>
        <div class="grid-item">
            <img src="http://img.yzcdn.cn/upload_files/2016/05/31/FhcUL97fjxKa-0omuJdYdOc6l2mb.jpg">
            <div class="detail">
                <div class="name">电影周边</div>
                <div class="price">￥66.00</div>
            </div>
        </div>
        <div class="grid-item">
            <img src="http://img.yzcdn.cn/upload_files/2016/05/31/FoRllhIvzNIEKuDjCxKqLSo0DEDc.jpg">
            <div class="detail">
                <div class="name">美国队长玩偶</div>
                <div class="price">￥66.00</div>
            </div>
        </div>
        <div class="grid-item">
            <img src="http://img.yzcdn.cn/upload_files/2016/05/31/FoblBwPnX1y9_flyk0aYXJeYIiHB.jpg">
            <div class="detail">
                <div class="name">太阳的后裔周边周边</div>
                <div class="price">￥66.00</div>
            </div>
        </div>
    </section>
</template>

<script>


/*
異步加載組件
component:{Foo:function (resolve) {
  require(['./foo.vue'], resolve)
}},
*/
var VCarousel  =  require('../lib/plugin/carousel')
var pullHandle = require('../lib/plugin/pullHandle')


module.exports= {
    ready: function(){
      new pullHandle({
          container: "#demo",
          pullDown: true,
          pullUp: false,
      })
      var vcarousel = new VCarousel({
          wrap: $('#carousel-containner'),
          pagination:false,
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
          }
          ]
      });
    }
}
</script>


<style lang="less">
@import "../css/common";


.grid{
    /*display: flex;*/
    margin: 0 auto;
    width: 90%;
    font-size: 0;
}
.grid-item{
    /*flex:1;*/
    display: inline-block;
    border-radius: 7px;
    width:45%;
    margin: 2.5%;
    overflow:hidden;
    background-color: #fff;
}
.grid-item img{
    display: block;
    width: 100%;
}
.detail{
    border-top: 1px solid #eee;
    box-sizing: border-box;
    padding: 1%;
    font-size: 1rem;
    background-color: #fff;
}
.name{
    width: 100%;
    box-sizing:border-box;
    padding: 1vw;
    color: #ccc;
    overflow: hidden;
    white-space: nowrap;
    text-overflow:ellipsis;
}
.price{
    padding: 1vw;
    color: red;
}


</style>
