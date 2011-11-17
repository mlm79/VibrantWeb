/**
 * vibrant.js -- A tool for mining and visualizing 3rd-party entities on the web.
 * This script requires jQuery.
 *
 * @author Margaret McKenna
*/

/* 
	Vibrant class 
 	Class variables: none  
 	
 	Main container for tool.
*/

var Vibrant = Vibrant || {};

Vibrant.sessionObj = Vibrant.sessionObj || {"websites":{},"siteEntities":{}};

Vibrant.sessionOn = true;

Vibrant.updateSession = function(state) {
	Vibrant.sessionOn = state;
}

/* 
	Vibrant.waiting function
	@params: none	
	
	Called before Vibrant.load; inserts HTML template into current window.
*/

Vibrant.waiting = function() {
	$('body').prepend("<div id='vibrant_main'></div");
	$("#vibrant_main").load(chrome.extension.getURL('recap.html'),function(){
		console.log(chrome.extension.getURL('recap.html'));
		Vibrant.vibrateColors();
	});
}

/* 
	Vibrant.load function
	@params: none	
	
	Kicks of mining and visualizing process.
*/

Vibrant.load = function(){
	var http_links = Vibrant.findSiteLinks();
	var title = "Artifacts from "+document.URL;
	Vibrant.displayLinks(http_links,title);
	Vibrant.loadLinks(http_links);
}

Vibrant.startSession = function() {
	//start recording data
	Vibrant.load();
}

Vibrant.deleteSessionData = function() {
	//clear data cache
	chrome.extension.sendRequest({method:"delete"}, function(response) {
		console.log(response.method);
		console.log(response.size);
	});
}

/* 
	Vibrant.vibrateColors function
	@params: none	
	
	Fades counter circles in and out while waiting for Vibrant.load to be called.
*/

Vibrant.vibrateColors = function() {
	$(".vb_badge").each(function(){
		$(this).animate({opacity:.1},5000);		
	})
	$(".vb_badge").each(function(){
		$(this).animate({opacity:1},5000);		
	})
}

Vibrant.loadLinks = function(_http_links) {
	chrome.extension.sendRequest({method:"get"}, function(response) {
		console.log(response.method);
		Vibrant.sessionObj = response.data;
		
		var currentUrl = document.URL;
		Vibrant.sessionObj["websites"][currentUrl] = _http_links;
		
		var _obj = Vibrant.sessionObj["siteEntities"];
		$.each(_http_links,function(k,v){
			for (var i=0;i<v.length;i++){
				if (_obj.hasOwnProperty(v[i])) {
					if (_obj[v[i]]["websites"].indexOf(currentUrl)==-1) {
						_obj[v[i]]["websites"].push(currentUrl);
					}
				} else {
					_obj[v[i]] = {"type":k,"websites":[currentUrl]};
				}
			}
		})
		chrome.extension.sendRequest({data: Vibrant.sessionObj,method:"set"}, function(response) {
			console.log(response.method);
			console.log(response.data);
			console.log(response.size);
		});
	});		
}

/* 
	Vibrant.displayLinks function
	@params: _http_links - JSON object containing all http calls and cookies from Vibrant.findSiteLinks	
	
	Displays 3rd-party-identified links in browser.
*/

Vibrant.displayLinks = function(_http_links,title) {
	$("#vb_title").text(title);
	$.each(_http_links,function(i){
		$("#vb_"+i+"_count").text(_http_links[i].length);
		$("#vb_list").append("<h3 id='"+i+"Header"+"'>"+i+"</h3>");
		var links_list = '';
		$.each(_http_links[i],function(j){
			links_list += "<li class='vb_link'>"+_http_links[i][j]+"</li>";		
		});
		$("#"+i+"Header").after("<ol>"+links_list+"</ol>");
	});
	//Vibrant.setSearchDomainName();
	chrome.extension.sendRequest({method:"get"}, function(response) {
		Vibrant.sessionObj = response.data;
		Vibrant.setCommonWebsites();
	});
}

Vibrant.setSearchDomainName = function() {	
	$('.vb_link').each(function(){
		var domain = parseBaseDomainFromLink($(this).text());
		var query = "http://ajax.googleapis.com/ajax/services/search/web?start=0&rsz=large&v=1.0&q="
		var items = "";
		$.getJSON(query+domain,function(data){
			$.each(data["responseData"]["results"], function(key, val) {
				var url = val["url"];
				var title = val["title"];
				var blurb = val["titleNoFormatting"];
				items += "<li><a target='_blank' href='"+url+"'>"+title+"</a></li>";
			});		
	  	});
		Vibrant.displaySideBar($(this),items);		
	});	
}

Vibrant.setCommonWebsites = function() {
	var _obj = Vibrant.sessionObj["siteEntities"];
	$('.vb_link').each(function(){
		var items="";
		var txt = $(this).text();
		if (_obj.hasOwnProperty(txt)&&_obj[txt]['websites'].length>0) {
		
			//delete reference to current website
			_obj[txt]['websites'].splice(_obj[txt]['websites'].indexOf(window.location.href),1);
			
			var siteArray = _obj[txt]['websites'];
			if (siteArray.length>0)	{
				$(this).css({"font-weight":"bold",'color':'red'});
			}
			$.each(siteArray,function(i) {
				var site = siteArray[i];
				items += "<li><a target='_blank' href='"+site+"'>"+site+"</a></li>";
			});
		}		
		Vibrant.displaySideBar($(this),items);	
	});
}

Vibrant.displaySideBar = function(_link,_items) {
	_link.mouseover(function(){
		$("#vb_search_list").empty();
		if (_items!="") {
			$("#vb_search_list").append(_items);
			var top = $(this).offset().top;
			var left = $(this).offset().left;
			$("#vb_search_popup").offset({top:top,left:left-230});
			$("#vb_search_popup").show();
		} else {
			$("#vb_search_popup").hide();
		}
	});
	
	_link.mouseout(function(){
		//$("#vb_search_list").empty();
		//$("#vb_search_popup").hide();
	});
}

/* 
	Vibrant.findSiteLinks function
	@params: none	
	@results: json_reponse - JSON object containing all http calls and cookies found on site
	
	Finds all requests of type 'script','iframe','img',and 'a', as well as cookies. Returns only 
	those with non-relative links.
*/

Vibrant.findSiteLinks = function() {
	var json_response = {"scripts":[],"frames":[],"images":[],"links":[],"cookies":[]};
	var el_types = {
		0:{"name":"scripts","el_match":"script","attr_match":"src"},
		1:{"name":"images","el_match":"img","attr_match":"src"},
		2:{"name":"links","el_match":"a","attr_match":"href"},	
		3:{"name":"frames","el_match":"iframe","attr_match":"src"},		
	}
	
	//Collect scripts, imgs, links
	$.each(el_types,function(i){
		$(el_types[i]["el_match"],document).each(function(){
			var cleanLink = Vibrant.cleanLink($(this),el_types[i]["attr_match"]);		
			if (cleanLink){
				//$(this).css({'border':'5px solid red'});
				json_response[el_types[i]["name"]].push(cleanLink);
			}
		});
	});
	
	//Collect cookies
	var cookies = document.cookie.split(";");
	$.each(cookies, function(i){
		json_response["cookies"].push(cookies[i]);
	});
	
	return json_response;
}

/* 
	Vibrant.cleanLink function
	@params: _el - element type, matched element from Vibrant.findSiteLinks	
			 _attr - element attribute to be extracted, e.g. 'src'
	
	Finds relevant element attribute value that is a) not from the window's domain, and b) is an http request.
*/

Vibrant.cleanLink = function(_el,_attr) {
	var domain = parseBaseDomain(document.domain);
	var re = new RegExp(domain);
	var badRe = new RegExp(badMatches());
	if (_el.attr(_attr)&&_el.attr(_attr).indexOf('http')!=-1&&!(_el.attr(_attr).match(re))&&!(_el.attr(_attr).match(badRe))){
		return(_el.attr(_attr));
	} else {
		return false;
	}
}

/*
chrome.extension.onConnect.addListener(function(port) {
	console.assert(port.name == "VibrantWeb_state");
	port.onMessage.addListener(function(msg) {
		console.log(msg.state);
	});
	
	if (typeof(msg.state) != 'undefined')
		Vibrant.updateSession(msg.state);
	else if (typeof(msg.clearCache) != 'undefined'&&msg.clearCache==false)
		Vibrant.deleteSessionData();
		
});
*/

//wait to load so more cookies/http calls can be captured (e.g. beacon imgs)
Vibrant.waiting();
window.setTimeout(Vibrant.load,1000);
