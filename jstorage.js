(function(e){function k(){if(d.jStorage)try{c=l(String(d.jStorage))}catch(a){d.jStorage="{}"}else d.jStorage="{}";g=d.jStorage?String(d.jStorage).length:0}function h(){try{d.jStorage=m(c),b&&(b.setAttribute("jStorage",d.jStorage),b.save("jStorage")),g=d.jStorage?String(d.jStorage).length:0}catch(a){}}function i(a){if(!a||typeof a!="string"&&typeof a!="number")throw new TypeError("Key name must be string or numeric");return true}if(!e||!e.toJSON&&!Object.toJSON&&!window.JSON)throw Error("jQuery, MooTools or Prototype needs to be loaded before jStorage!");
var c={},d={jStorage:"{}"},b=null,g=0,m=e.toJSON||Object.toJSON||window.JSON&&(JSON.encode||JSON.stringify),l=e.evalJSON||window.JSON&&(JSON.decode||JSON.parse)||function(a){return String(a).evalJSON()},f=false,j={isXML:function(a){return(a=(a?a.ownerDocument||a:0).documentElement)?a.nodeName!=="HTML":false},encode:function(a){if(!this.isXML(a))return false;try{return(new XMLSerializer).serializeToString(a)}catch(b){try{return a.xml}catch(c){}}return false},decode:function(a){var b="DOMParser"in window&&
(new DOMParser).parseFromString||window.ActiveXObject&&function(a){var b=new ActiveXObject("Microsoft.XMLDOM");b.async="false";b.loadXML(a);return b};if(!b)return false;a=b.call("DOMParser"in window&&new DOMParser||window,a,"text/xml");return this.isXML(a)?a:false}};e.jStorage={version:"0.1.5.4",set:function(a,b){i(a);j.isXML(b)&&(b={_is_xml:true,xml:j.encode(b)});c[a]=b;h();return b},get:function(a,b){i(a);return a in c?c[a]&&typeof c[a]=="object"&&c[a]._is_xml&&c[a]._is_xml?j.decode(c[a].xml):c[a]:
typeof b=="undefined"?null:b},deleteKey:function(a){i(a);return a in c?(delete c[a],h(),true):false},flush:function(){c={};h();return true},storageObj:function(){function a(){}a.prototype=c;return new a},index:function(){var a=[],b;for(b in c)c.hasOwnProperty(b)&&a.push(b);return a},storageSize:function(){return g},currentBackend:function(){return f},storageAvailable:function(){return!!f},reInit:function(){var a;if(b&&b.addBehavior){a=document.createElement("link");b.parentNode.replaceChild(a,b);
b=a;b.style.behavior="url(#default#userData)";document.getElementsByTagName("head")[0].appendChild(b);b.load("jStorage");a="{}";try{a=b.getAttribute("jStorage")}catch(c){}d.jStorage=a;f="userDataBehavior"}k()}};(function(){var a=false;if("localStorage"in window)try{window.localStorage.setItem("_tmptest","tmpval"),a=true,window.localStorage.removeItem("_tmptest")}catch(c){}if(a)try{if(window.localStorage)d=window.localStorage,f="localStorage"}catch(e){}else if("globalStorage"in window)try{window.globalStorage&&
(d=window.globalStorage[window.location.hostname],f="globalStorage")}catch(g){}else if(b=document.createElement("link"),b.addBehavior){b.style.behavior="url(#default#userData)";document.getElementsByTagName("head")[0].appendChild(b);b.load("jStorage");a="{}";try{a=b.getAttribute("jStorage")}catch(h){}d.jStorage=a;f="userDataBehavior"}else{b=null;return}k()})()})(window.jQuery||window.$);