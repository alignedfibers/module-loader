



var element = document.querySelector("#greeting");
element.innerText = "Hello, world!";


var libraries = (function(){
  var __libs__ = {
    //This keeps all of the libs on an internal scope
    /***
     * Here at the top in lights we see something internal that can be exposed,
     *  What we are seeing are modules that can be partially degraded.
     * 
     * **/
    init : function(){
      this.builder = 'Shawn Stark';
      delete this.init;
      return this;
    }
  }.init();
  var __internallibs__ = {
    //Remove
    init : function(){
      this.builder = 'Shawn Stark';
      delete this.init;
      return this;
    }
  }.init(); //keeping the libs that I want gated seperate
  var consumers = {
    //This object houses the functions to add, destroy and get references to libraries
    addLib : function(privateName,libLiteral, restrictPubOn){
      __libs__[privateName] = libLiteral;
      //if(privateName == 'AdvancedDemo'){libLiteral.sayhi();}
    },
    pubRef : function(hiddenName,publishedName,returnAs,pubOn){
      /*Object.defineProperty(consumers,publishedName, {value : __libs__[hiddenName],
                                   writable : true,
                                   enumerable : true,
                                   configurable : true});*/
      consumers[publishedName] = __libs__[hiddenName];

      if(returnAs == 'reference') return consumers[publishedName];
      if(returnAs == 'string') return publishedName;
      return;
    }
  };
  //A test lib is added before returning the lib manager
  consumers.addLib('sillyLib1',(function(){
    return {
      getSilly1 : function(){
        console.log('Silly for the first time');
      }
    };
  })());
  //Another test lib is added before returning the lib manager
  consumers.addLib('sillyLib2',(function(){ 
    var d1 = consumers.pubRef('sillyLib1','sillyLib1','reference');
    return {
      getSilly2 : function(){
        d1.getSilly1();
        console.log('Silly for the second time');
      }
    };
  })());
  //A library that is very usefull for type checking is added
  consumers.addLib('TypeChecks',(function(){
    var dependency;
    return {
      isFunction : function(functionToCheck) {
        //var inLibs = __libs__;
          var getType = {};
          return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
      },
      isInt : function(x) {
        //var inLibs = __libs__;
          return x % 1 === 0;
      },   
      isArray : function(obj) {
        //var inLibs = __libs__;
          return Object.prototype.toString.call(obj) === '[object Array]';
      },
      isObject : function(obj) {
        //var inLibs = __libs__;
          return {}.toString.apply(obj) === '[object Object]';
      },
      isObject4 : function(value) {
        // http://jsperf.com/isobject4
        return value !== null && typeof value === 'object';
      },
      isBlankObject : function(value) {
        return value !== null && typeof value === 'object' && !getPrototypeOf(value);
      },
      isDefined : function(value) {return typeof value !== 'undefined';},
      isUndefined : function(value) {return typeof value === 'undefined';},
      hasCustomToString : function(obj) {return isFunction(obj.toString) && obj.toString !== toString;}
    };
  })());
  //A library intended to make online requests to load more libraries
  consumers.addLib('GnicLoader',(function(){var dependency; return {};})());
  //A useful library to manipulate objects, this library has a dependency
  consumers.addLib('ObjectTools',(function(){
    var TypeChecks = consumers.pubRef('TypeChecks','TypeChecks','reference'); 
    return{
      merge : function(t, s) { /*! (C) Andrea Giammarchi */
      //This one is going to take a little work to understand
        return Object.defineProperties(t, Object.keys(s).reduce((o, k) => {
          let d = Object.getOwnPropertyDescriptor(s, k),
          m = typeof d.value == 'object';
          if (m)
            d.value = merge(k in t ? t[k] : Object.create(Object.getPrototypeOf(s[k])), d.value);
            if (m || !(k in t)) o[k] = d;
            return o;
        },{}));
      },
      diff : function(a, b){
        //console.log('Inside Get Object Diff');
        var aplus = [],
        bplus = [];

        if(!(typeof a == "string") && !(typeof b == "string")){

            if (TypeChecks.isArray(a)) {
                for (var i=0; i<a.length; i++) {
                    if (b[i] === undefined) aplus.push(i);
                }
            } else {
                for(var i in a){
                    if (a.hasOwnProperty(i)) {
                        if(b[i] === undefined) {
                            aplus.push(i);
                        }
                    }
                }
            }

            if (TypeChecks.isArray(b)) {
                for (var j=0; j<b.length; j++) {
                    if (a[j] === undefined) bplus.push(j);
                }
            } else {
                for(var j in b){
                    if (b.hasOwnProperty(j)) {
                        if(a[j] === undefined) {
                            bplus.push(j);
                        }
                    }
                }
            }
        }

        return {
            added: aplus,
            removed: bplus
        };
      },
      clone : function(obj){
        if (null === obj || "object" != typeof obj) {
            return obj;
        }
        var copy = obj.constructor();
        for (var attr in obj) {
            copy[attr] = obj[attr];
        }
        return copy;        
      }
    };
  })());
  //Another library I think is useful
  consumers.addLib('TimeOutTracker',(function(){

      return {
          NewTracker : function(){
            var timeouts = [], timerID = null;
            var clearTimerID = function() {
              console.log('inside clearTimerID');
              timerID = null;
              for(var i=0; i< timeouts.length; i++) {
                timeouts[i]();
              }
              timeouts.length = 0;
            };
            var getTimerID = function () {
                console.log('inside getTimerID');
                if (!timerID)  {
                    timerID = setTimeout(clearTimerID);
                }
                return timerID;
            };
            var registerTimeout = function(fn) { // register function to be called on timeout
                console.log('inside registerTimeout');
                if (timerID==null) getTimerID();
                timeouts[timeouts.length] = fn;
            };
            return {
              clearTimerID : clearTimerID,
              getTimerID : getTimerID,
              registerTimeout : registerTimeout
            };
          },
          registerTimeout : function(fn) { // register function to be called on timeout
              if (timerID==null) getTimerID();
              timeouts[timeouts.length] = fn;
          }
      };
      
  })());
  consumers.addLib('',(function(){var dependency; return{};})());
  //Exposing a couple libraries on the consumer object before it is returned
  //consumers.pubRef('sillyLib2','sillyLib2',undefined);
  //consumers.pubRef('sillyLib2','newref2',undefined);  
  consumers.pubRef('TimeOutTracker','TimeOutTracker',undefined);
return consumers;  
})();