
var $ = require('./zepto');

    // 针对后端接口统一返回以下格式来做判断操作
    // {
    //   status: 1,     返回状态，1成功，0失败
    //   data:{},       返回数据内容
    //   error:42314,   status为0时的错误码
    //   info:""        status为0时的错误信息
    // }

    // 如果需要改成自己的接口数据格式风格请修改funciton resolve()里的代码

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

          // 这里判断返回数据中的status字段为1时表示接口返回数据成功，status为0时表示失败
          if(data.status==1){
            // 如果有storage参数则记录缓存
            if(storage){
              localStorage.setItem(url,xhr.response)
            }else{
              localStorage.removeItem(url)
            }
            // 在这里执行success的回调
            !!self.fnSuccess&&self.fnSuccess(data)
          }else if(data.status==0){
            console.debug('API return fail : '+url+'\ncode : '+data.code+'\ninfo : '+data.info)
            // 在这里执行error的回调
            !!self.fnError&&self.fnError(data)
          }
        }
        // 调用complete时回调XHR对象
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

    //    方法
    var Prorest = function(opt){
      var defaultOpt = {
        baseUrl:location.protocol+'//'+location.hostname
      }
      !opt&&(opt=defaultOpt)
      this.baseUrl = opt.baseUrl
    }
    // 取缓存数据
      Prorest.prototype.getData = function(url,initData){
        if(localStorage.getItem(url)){
          return JSON.parse(localStorage.getItem(url)).data
        }else{
          return initData||{}
        }
      }

      // 获取数据
      // 可以将数据存到本地
      Prorest.prototype.GET = function(){
        var self = this;
        var url = arguments[0],
            opt = {},
            msg = {},
            storage = false;

        if(typeof arguments[1]=='object'){
          msg = arguments[1];
          storage = arguments[2];
        }else if(typeof arguments[1]=='boolean'){
          storage = arguments[1]
        }


        if(!storage){
          return new Promise(function(resolve){
            $.ajax({
              data:msg,
              url:self.baseUrl+url,
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
                url:self.baseUrl+url,
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
      Prorest.prototype.POST = function(url,opt,func){
        var self = this;
        return new Promise(function(resolve){
          $.ajax({
            type:"POST",
            data:opt,
            url:self.baseUrl+url,
            complete:function(xhr,status){
              resolve(url,xhr,status);
            }
          });
        })
      };

      // 更新数据 必须加参数
      Prorest.prototype.PUT = function(url,opt,func){
        var self = this;
        return new Promise(function(resolve){
          $.ajax({
            type:"PUT",
            data:opt,
            url:self.baseUrl+url,
            complete:function(xhr,status){
              var data = JSON.parse(xhr.response)
              func&&func(data,status)
            }
          });
        })
      };

      // 删除数据 必须带id
      Prorest.prototype.DELETE = function(url,opt,func){
        var self = this;
        return new Promise(function(resolve){
          $.ajax({
            type:"DELETE",
            data:opt,
            url:self.baseUrl+url,
            complete:function(xhr,status){
              var data = JSON.parse(xhr.response)
              func&&func(data,status)
            }
          });
        })
      };

    //    暴露公共方法
    module.exports = Prorest;

