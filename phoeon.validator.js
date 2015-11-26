;!function(root,factory) {
            if(typeof root.$!="function")throw new Error("please import jquery or zepto");
            if(typeof define=="function"&&define.amd){
                define("Validator",["$"],function($){
                    return factory($);
                });
            }else root.Validator = factory(root , $);
        }(this,function(root,$){
            // 默认验证规则
            var __flagValidators = {
                // validTypeName : [tip,pattern]
                number  : ["非法数字",      /^[-\+]?\d+(\.\d+)?$/],
                email   : ["非法邮箱",      /^\w+@\w+\.\w+$/],
                tel     : ["非法电话号码",    /^((\d{3,4}-)?\d{7}|1\d{10})$/],
                qq      : ["非法QQ号码",    /^\d{5,9}$/],
                url     : ["非法url",     /^(ftp|ssh|svn|https?)\:\/\/\w+\.\w+(:\d+)?(\/\w+)*[\s\S]*$/]
            }
            // 配置项
            var __cfgOpts = {
                // 是否启用keyup验证
                keyup : true,
                // 是否启用blur验证
                blur : true,
                // 是否启用change验证
                change : true,
                // 非法信息展示回调 又用户传入
                invalidPlace : function(target,msg){
                    var errorTip = target.parent().find(".invalid-wrap");
                    if(!errorTip.length){
                        errorTip = $("<div class='invalid-wrap'></div>");
                        target.parent().append(errorTip);
                    };
                    errorTip.html(msg);
                },
                __triggerTypes : ["keyup","blur","change"]
            },
            __validators={};
            // 初始化验证工厂
            function __init(fm,cfg){
                __initValidators();
                __initGlobalVariables(fm,cfg);
                __bindInputEvent(__cfgOpts.inputs);
                __bindFormSubmit(__cfgOpts.form,__cfgOpts.inputs);
            }
            // 初始化内置验证器
            function __initValidators(){
                for(var key in __flagValidators){
                    var temp = __flagValidators[key];
                    __addValidType(key,function(p){
                        return function(v){return p.test(v);}
                    }(temp[1]),temp[0]);
                }
                // 非空验证
                __addValidType("require",function(value){return !!value.replace(/\s+/,"");},"不能为空");
            }
            // 初始化全局变量
            function __initGlobalVariables(form,cfg){
                form = __cfgOpts.form = $(form);
                __cfgOpts.inputs = form.find(".valid");
                cfg&&__config(cfg);
            }
            // 绑定form 提交拦截事件
            function __bindFormSubmit(form,inputs){
                form[0].onsubmit = function(){
                    var flag = true;
                    inputs.each(function(){
                        flag = __baseValid($(this))&&flag;
                    })
                    console.log(flag)
                    return flag;
                }
            }
            // 绑定input验证事件 keyup or blur
            function __bindInputEvent(inputs){
                var tts = [],
                    __tts = __cfgOpts.__triggerTypes;
                for(var i in __tts){
                    var tt = __tts[i],
                        of = __cfgOpts[tt];
                    of&&tts.push(tt);
                }
                // 绑定具体事件方法
                inputs.bind(tts.join(" "),function(e){
                    __baseValid($(e.target));
                })
            }
            // 基本验证结果
            function __baseValid(target){
                    var vtypes = (target.attr("data-validtype")||"").split(/\s+/);
                    target.valid = true;
                    for(var i=0;i< vtypes.length;i++){
                        if(vtypes[i]){
                            var vtype = vtypes[i].split("\|"),
                                vname = vtype[0];

                            var validType = __validators[vname];
                            if(!validType)throw new Error("no such validator : "+vname +" undefined ");

                            validType.args = vtype[1]&&vtype[1].split(":")||[];

                            var flag = target.valid = validType.valid(target.val(),target);

                            __formatErrorFlag(target,validType);

                            if(!flag) break;
                        }
                    }
                return target.valid;
            }
            // 格式化错误提示
            function __formatErrorFlag(target,vtype){
                var msg = target.valid?"":vtype.tip.replace(/\{\d+\}/g,function(r){
                    return vtype.args[r.match(/\d+/)];
                });
                __cfgOpts.invalidPlace(target,msg);
                target[target.valid===false?"addClass":"removeClass"]("invalid");
            }
            // 合并自定义配置
            function __config(cfg){
                for(var key in __cfgOpts){
                    var opt = cfg[key];
                    opt!==undefined&&(__cfgOpts[key]=opt);
                }
            }
            // 自定义错误规则添加
            function __addValidType(name,fn,tip){
                __validators[name] = {
                    tip : tip,
                    valid : fn
                }
            }
            // 同时自定义错误规则添加多个
            function __addValidTypes(types){
                for(var name in types){
                    var validator = types[name];
                    __addValidType(name,validator["valid"],validator["tip"]);
                }
            }
            // 对外暴露接口
            return {
                config : function(cfg){
                    __config(cfg);
                },
                form : function(form,cfg){
                    __init(form,cfg);
                },
                addValidType : function(name,fn,tip){
                    __addValidType(name,fn,tip);
                },
                addValidTypes : function(types){
                    __addValidTypes(types);
                }
            }
        });