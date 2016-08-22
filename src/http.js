var $ = require('lib/zepto.js');

function Promise(fn){
  var self = this;
  function resolve(url,xhr,status,storage){
    if(!xhr.response){
      return false;
    }
    if(status=='success'){
      if(typeof xhr.response == 'object'){
        xhr.response = JSON.stringify(xhr.response)
      }
      try{
        var data = JSON.parse(xhr.response)
      }catch(err){
        console.debug('API return fail : '+url+'\nresponse is not JSON')
      }
      if(data.code==0){
        // 如果有storage参数则记录缓存
        if(storage){
          localStorage.setItem(url,xhr.response)
        }else{
          localStorage.removeItem(url)
        }
        !!self.fnSuccess&&self.fnSuccess(data)
      }else if(data.code!=0){
        console.debug('API return fail : '+url+'\ncode : '+data.code+'\ninfo : '+data.info)
        !!self.fnError&&self.fnError(data)
      }else if(data.ret==2){
        // 登录失效，重新获取token
        
      }
    }
    // 全局判断如果ret==2则登录态失效
    if(JSON.parse(xhr.responseText).ret==2){

    }
    !!self.fnComplete&&self.fnComplete(xhr,status)
  }

  return fn(resolve);
}

Promise.prototype.success = function(done){
  this.fnSuccess = done
  return this
}
Promise.prototype.error = function(done){
  this.fnError = done
  return this
}
Promise.prototype.completes = function(done){
  this.fnComplete = done
  return this
}

var baseUrl = 'http://lipten.link'


// 取缓存数据
$.getData = function(url,initData){
  if(localStorage.getItem(url)){
    return JSON.parse(localStorage.getItem(url)).data
  }else{
    return initData||{}
  }
}


// 获取数据
// 多一种写法：
// 像ajax一样带任何ajax的参数
// $.GET({
//   url: '',
//   async: false
// })
$.GET = function(){
  var url = arguments[0],
      opt = {},
      msg = {},
      force = false;

  if(typeof arguments[1]=='object'){
    msg = arguments[1];
    force = arguments[2];
  }else if(typeof arguments[1]=='boolean'){
    force = arguments[1]
  }


  // 如果有强制请求的话不存缓存
  if(!force){
    return new Promise(function(resolve){
      // 异步请求带上header
      $.ajax({
        data:msg,
        url:baseUrl+url,
        complete:function(xhr,status){
          resolve(url,xhr,status);
        }
      });
    })
  }else{

    if(!localStorage.getItem(url)){
    	return new Promise(function(resolve){
        $.ajax({
          data:msg,
      		url:baseUrl+url,
      		complete:function(xhr,status){
            resolve(url,xhr,status,true);
          }
      	});
      })
    }else{
      return new Promise(function(resolve){
        var xhr = {}
        xhr.response = JSON.parse(localStorage.getItem(url))
        setTimeout(function(){
          resolve(url,xhr,'success')
        },0)
      })
    }
  }
};

// 增加数据 必须加参数
$.POST = function(url,opt,func){
  return new Promise(function(resolve){
    $.ajax({
      type:"POST",
      data:opt,
      url:baseUrl+url,
      complete:function(xhr,status){
        resolve(url,xhr,status);
      }
    });
  })
};

// 更新数据 必须加参数
$.PUT = function(url,opt,func){
  return new Promise(function(resolve){
    $.ajax({
      type:"PUT",
      data:opt,
      url:baseUrl+url,
      complete:function(xhr,status){
        var data = JSON.parse(xhr.response)
        func&&func(data,status)
      }
    });
  })
};

// 删除数据 必须带id
$.DELETE = function(url,opt,func){
  return new Promise(function(resolve){
    $.ajax({
      type:"DELETE",
      data:opt,
      url:baseUrl+url,
      complete:function(xhr,status){
        var data = JSON.parse(xhr.response)
        func&&func(data,status)
      }
    });
  })
};

module.exports = {}
