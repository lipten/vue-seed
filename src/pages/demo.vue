<template>
<article id="demo">
    <demo></demo>
</article>
</template>

<script>


var demo = require('../components/demo.vue')

module.exports= {
    components:{demo:demo},
    ready: function(){
    	
    }
}
</script>

<style lang='less'>
@import "../css/plugin/carousel";
@import "../css/plugin/pullHandle";
</style>
