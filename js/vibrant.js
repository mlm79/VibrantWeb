/**
 * vibrant.js -- A tool for mining and visualizing 3rd-party entities on the web.
 * This script requires jQuery.
 *
 * @author Margaret McKenna
*/

/* 
	Vibrant class 
 	Class variables: 
 		- Vibrant.sessionObj : array of entities collected on the site; each entity is an object 
 								containing 'domain','site','entity','type','timestamp'  
 	
 	Main container for tool.
*/


/*============================ SETTING UP VW =======================================*/

var Vibrant = Vibrant || {};

Vibrant.sessionObj = {};

/* 
	Vibrant.checkSessionState function
	@params: none	
	
	Checks background.html for sessionState. If sessionOn==true, loads VW; if false, nothing happens.
*/

Vibrant.checkSessionState = function() {
	chrome.extension.sendRequest({method:"get",dataLabel:"sessionState"}, function(response) {
		if (response.data["sessionOn"]&&isGoodUrl()) {
			console.log("starting");
			window.setTimeout(Vibrant.load,1000);
			Vibrant.startTab();
		}
	});
}

Vibrant.startTab = function(){
	$('body').prepend("<div class='vb_tab' id='vb_showViz'></div>")
	$('#vb_showViz').click(function(){
		//sketch();	
	})
}


/* 
	Vibrant.waiting function
	@params: none	
	
	Called before Vibrant.load; inserts HTML template into current window.
*/

Vibrant.waiting = function() {
	$('body').prepend("<div class='vb_tab' id='vibrant_main'></div");
	$("#vibrant_main").load(chrome.extension.getURL('recap.html'),function(){
		console.log(chrome.extension.getURL('recap.html'));
		Vibrant.vibrateColors();
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



/*============================ COLLECTING DATA =======================================*/

/* 
	Vibrant.load function
	@params: none	
	
	Kicks of mining and visualizing process.
*/

Vibrant.load = function(){
	var siteEntities = Vibrant.collectSiteEntities();
	Vibrant.sessionObj = siteEntities;
	var title = "Artifacts from "+document.URL;
	Vibrant.storeSiteEntities(siteEntities);
}


/* 
	Vibrant.findSiteLinks function
	@params: none	
	@results: json_reponse - JSON object containing all http calls and cookies found on site
	
	Finds all requests of type 'script','iframe','img',and 'a', as well as cookies. Returns only 
	those with non-relative links.
*/

Vibrant.collectSiteEntities = function() {
	var siteEntities = [];
	
	var timestamp = new Date();
	var domain = parseBaseDomain(document.domain);
	var site = document.URL;
	
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
				siteEntities.push({"timestamp":timestamp,"domain":domain,"site":site,"entity":cleanLink,"type":el_types[i]["name"]});
			}
		});
	});
	
	//Collect cookies
	var cookies = document.cookie.split(";");
	$.each(cookies, function(i){
		siteEntities.push({"timestamp":timestamp,"domain":domain,"site":site,"entity":cookies[i],"type":"cookies"});
	});
	
	return siteEntities;
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
	Vibrant.storeSiteEntities function
	@params: none
	
	Send Vibrant.sessionObj to background.html to be added to "browsingData" storage
*/

Vibrant.storeSiteEntities = function(_siteEntities) {
	if (_siteEntities.length>0) {
		chrome.extension.sendRequest({data: _siteEntities,method:"set",dataLabel:"browsingData"}, function(response) {
			console.log(response.method);
			console.log(response.data);
			console.log(response.size);
		});	
	} else {
		console.log("No entities to store.");	
	}

}

/*============================ DISPLAY DATA =======================================*/

Vibrant.viewDataAsTable = function(_data) {
	var str="<table id='myTable' class='tablesorter'><thead><tr>";
	$.each(_data[0],function(k,v){
		str+="<th class='"+k+"_head'>"+k+"</th>";
	})
	str+="</tr></thead><tbody>";

	for (var i=0; i < _data.length; i++) {
		str+="<tr>";
		$.each(_data[i],function(k,v){
			str+="<td class='"+k+"'>"+v+"</td>";
		})
		str+="</tr>";
	}
	str+="</tbody></table>"
	return str;
}


/*============================ RUN SESSION =======================================*/

Vibrant.checkSessionState();

