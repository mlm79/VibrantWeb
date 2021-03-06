/**
 * vibrant_visualization.js -- Visualizing 3rd-party entities on the web.
 * This script requires jQuery and Processing.js.
 *
 * @author Margaret McKenna
*/

var VibrantViz = VibrantViz || {};


/* 
	VibrantViz.interRelationse function
	@params: canvas_id - attr id for canvas element to draw on
			 _data - obj of collected info; {'sites':{sitename:{index:0,cookies:array,entities:array},…},
			 		'entities':{entityname:{index:0,sites:array},…},
			 		'cookies':{cookiename:{index:0,sites:array},…},
			 		'oldest_timestamp':date string}	
	
	Prepares _data object for visualization by creatign DataObjects, calculating min/max for site and entity counts,
	sorting sites and entities by number of children.
	
	Visualizes results using Processing.js
	
	***Cookie analysis is not fully implemented yet; references to cookie objects are ignored for now
*/

VibrantViz.interRelations = function(canvas_id,_data){
	console.log("_data",_data);
	
	var xIndent = 70;
	var ySeparation;
	var yIndent = 120;
	
	var rectWidth;
	var rectHeight = 30;
	
	var site_filter_min;
	var site_filter_max;
	var site_range_min = 500;
	var site_range_max = 0;
	var entity_filter_min;
	var entity_filter_max;
	var entity_range_min = 500;
	var entity_range_max = 0;
	var site_names = [];
	var entity_names = [];
	
	//Find min/max number of entities that sites have
	for (var i in _data.sites) {
		if (_data.sites[i].index!=null) {
			if (_data.sites[i].entities.length<site_range_min) {site_range_min = _data.sites[i].entities.length}
			if(_data.sites[i].entities.length>site_range_max) {site_range_max = _data.sites[i].entities.length}
			site_names.push(i);
		} else {
			delete _data.sites[i];
		}
		site_filter_min = site_range_min;
		site_filter_max = site_range_max;
	}
	
	//Find min/max number of sites that entities are on
	for (var i in _data.entities) {
		if (_data.entities[i].sites.length<entity_range_min) {entity_range_min = _data.entities[i].sites.length}
		if(_data.entities[i].sites.length>entity_range_max) {entity_range_max = _data.entities[i].sites.length}
		entity_names.push(i);
		entity_filter_min = entity_range_min;
		entity_filter_max = entity_range_max;
	}
	
	
	//Prepare html input elements; site_search for filtering on individual sites; 
	//entity_range and slider_range for min/max of sites/entities
	$(function() {
		$("#site_search").append('<input id="tags" />');
		$( "#tags" ).autocomplete({
			source: site_names
		});
		
		$( "#entity-range" ).slider({
			range: true,
			min: entity_range_min,
			max: entity_range_max,
			values: [ entity_filter_min, entity_filter_max ],
			slide: function( event, ui ) {
				$( "#entity_amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
				entity_filter_min = ui.values[0];
				entity_filter_max = ui.values[1];
			}
		});
		$( "#entity_amount" ).val( $( "#entity-range" ).slider( "values", 0 ) +
			" - " + $( "#entity-range" ).slider( "values", 1 ) );
		
	
		$( "#slider-range" ).slider({
			range: true,
			min: site_range_min,
			max: site_range_max,
			values: [ site_filter_min, site_filter_max ],
			slide: function( event, ui ) {
				$( "#amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
				site_filter_min = ui.values[0];
				site_filter_max = ui.values[1];
			}
		});
		$( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 ) +
			" - " + $( "#slider-range" ).slider( "values", 1 ) );	
	});
	
	
	
	//DataObject creates generic objects of parent -> children relationships 
	//for sites, entities, and cookies [cookies currently turned off]	
	function DataObject(){}
	
	DataObject.prototype.id = function(){
		return this.id;
	};

	DataObject.builder = function(type,_id) {
		var constr = type,
			id = _id,
			newObj;
			
		if (typeof DataObject[constr].prototype.id!=='function'){
			DataObject[constr].prototype = new DataObject();
		}
		
		if (typeof this[constr][id]!='undefined'){
			return this[constr][id];
		}
		
		newObj = new DataObject[constr](id);
		this[constr][id] = newObj;
		return newObj;	
	};
	
	DataObject.sites = function(id) {
		this.id = id;
		//this.children = {'entities': _data.sites[id].entities, 'cookies': _data.sites[id].cookies};
		this.children = _data.sites[id].entities;
		this.index = _data.sites[id].index;
		this.y = yIndent; 
	};
	
	DataObject.entities = function(id) {
		this.id = id;
		this.children = _data.entities[id].sites;
		this.index = _data.entities[id].index;
		this.y = yIndent + rectHeight + ySeparation;
	};
	
	DataObject.cookies = function(id) {
		this.id = id;
		this.children = _data.cookies[id].sites;
		this.index = _data.cookies[id].index;
		this.y = yIndent + rectHeight + ySeparation;
	};
	
	//Sort objects by number of children, asc
	function sortByChildren(a,b){
		return a.children.length - b.children.length
	}
	
	//Sort objects by number of children, desc
	function reverseSortByChildren(a,b){
		return b.children.length - a.children.length
	}
	
	//Create new object format by looping through original _data obj;
	//creates objects that are more generic, which makes it easier
	//to loop through in the Processing function
	var data_objects = function(){
		if (this.obj!=null) {
			return this.obj;
		}
		//var newObj = {'sites':[],'entities':[],'cookies':[]};
		var newObj = {'sites':[],'entities':[]};
		for (var i in newObj) {
			for (var j in _data[i]) {
				var obj = DataObject.builder(i,j);
				newObj[i].push(obj);
			}
		}
		
		newObj.sites.sort(sortByChildren);
		newObj.entities.sort(sortByChildren);
		//newObj.cookies.sort(sortByChildren);
		
		this.obj = newObj;
		return newObj;
	};
	
	
	//Filter out objects if that don't fall in the various min/max ranges,
	//or if they don't match the site_search value
	//@params - type: usually 'sites'; other: either 'entities' or 'cookies'
	
	function filterDataObjects(type,other,min,max,min2,max2) {
		var d = _d = data_objects();
		//var new_data = {'sites':[],'entities':[],'cookies':[]};
		var new_data = {'sites':[],'entities':[]};
		for (var i=0; i < _d[type].length;i++){
			
			var skip = false;
			/*
			for (var j=0;j<_d[type][i].children.length;j++){
				if ( _d[type][i].children[j].length>=min2 & _d[type][i].children[j].length<=max2 ) {
					skip = false;
				} else {
					skip = true;
				}
			}
			*/
			if (_d[type][i].children.length>=min & _d[type][i].children.length<=max & skip==false) {
				var obj = DataObject.builder(type,_d[type][i].id);
				new_data[type].push(obj);
				
				if (obj.id==$("#tags").val()){
					new_data[type] = [obj];
					new_data[other] = [];	
				}
				
				for (var j=0;j<_d[type][i].children.length;j++){
					var childObj = DataObject.builder(other,_d[type][i].children[j]);
					if (new_data[other].indexOf(childObj)==-1 & childObj.children.length>=min2 & childObj.children.length<=max2) {
						new_data[other].push(childObj);
					}
				}

				if (obj.id==$("#tags").val()){
					new_data[type].sort(sortByChildren);
					new_data[other].sort(reverseSortByChildren)
					return new_data;	
				}
			}
		}
		//console.log("filtered");
		new_data[type].sort(sortByChildren);
		new_data[other].sort(reverseSortByChildren);
		return new_data;
	}

	//set processing width/height based on canvas element's width/height
	var w = $("#"+canvas_id).width();
	var h = $("#"+canvas_id).height();
	var canvasDims = {
		w:w,
		h:h
	}
	
	//draw lines between a site and all its entities
	function drawLines(site,x1,y1,col,entities) {
		var x2, y2;
		for (var i = 0; i < entities.length; i++) {
			if (site.children.indexOf(entities[i].id)!=-1) {
				var entity = entities[i];
				y2 = yIndent+rectHeight+ySeparation;
				x2 = xIndent+i*(p.width-xIndent*2)/entities.length;
				p.stroke(col[0],col[1],col[2]);
				p.line(x1,y1,x2,y2);
			}
		}
	}

	//get gradated colors
	function lerpColor(p, c1, c2, amt ){ 
    	var r = p.lerp(c1[0], c2[0], amt); 
		var g = p.lerp(c1[1], c2[1], amt); 
		var b = p.lerp(c1[2], c2[2], amt); 
		color = [r,g,b];
		return color; 
	} 
	
	
	function getColors(p,len,scale) {
		var col1, col2, colors = [];
		if (scale=='gray'){
			col1 = [220,220,220];
			col2 = [20,20,20];
		} else {
			col1 = [197, 255, 21];
			col2 = [249, 20, 155];
		}		
		
		//Don't lerp colors if there's only one site or entity
		if (len==1) {
			return [col2];
		}
		
		for (var i=0;i<len;i++){
			//lerp amt should be i(len-1) so you include col2; else you never get amt==1
			var new_col = lerpColor(p,col1,col2,i/(len-1));
			colors.push(new_col);
		}
		return colors;
	}
	
	//variables required for Processing sketch
	var objs = data_objects(),
		siteColors, 
		entityColors,
		canvas = document.getElementById(canvas_id);
	
	var p = new Processing(canvas, function(p,c){	

		p.setup = function(){
			p.size(canvasDims.w,canvasDims.h);
			p.smooth();
			p.noStroke();
			p.textMode(p.CENTER);
			siteColors = getColors(p,objs.sites.length,"color");
			entityColors = getColors(p,objs.entities.length,"gray");
			ySeparation = p.height-rectHeight*2-yIndent*2;
		},
		
		p.draw = function() {
			p.background(255);
		
			var site_junk = 'entities'; //could be entities or cookies
			
			objs = filterDataObjects('sites',site_junk,site_filter_min,site_filter_max,entity_filter_min,entity_filter_max);
			siteColors = getColors(p,objs.sites.length,"color");
			entityColors = getColors(p,objs[site_junk].length,"gray");

			//Start drawing sites
			rectWidth = (p.width-xIndent*2)/objs.sites.length; //rectWidth is determined by number of sites
			for (var i =0; i < objs.sites.length;i++) {
				var col = siteColors[i],
					site = objs.sites[i],
					x = xIndent+i*rectWidth,
					y = yIndent;
				
				//draw rect
				p.noStroke();
				p.fill(col[0],col[1],col[2]);
				p.rect(x,y,rectWidth,rectHeight);
				
				//draw name of site
				p.pushMatrix();
					p.fill(0);
					p.textSize(12);
					p.translate(x+5,y-5);
					p.rotate(p.PI/-3.5);
					p.text(site.id,0,0);
				p.popMatrix();
				
				//draw number of entities a sites has
				p.fill(255);
				p.textSize(14);
				p.text(site.children.length,x+5,y+20);
				
				//draw lines between site and its children (entities or cookies)
				p.pushMatrix();
					p.smooth();
					p.strokeWeight(.5);
					drawLines(site,x,y+rectHeight,col,objs.entities);
				p.popMatrix();			
			}
			
			//Start drawing site_junk (i.e. entities or cookies)
			rectWidth = (p.width-xIndent*2)/objs.entities.length; //rectWidth is determined by number of entities
			for (var i =0; i < objs[site_junk].length;i++) {
				var entity = objs[site_junk][i],
					col = entityColors[i],
					x = xIndent+i*rectWidth,
					y = yIndent+rectHeight+ySeparation;
				
				//draw rect	
				p.noStroke();
				p.fill(col[0],col[1],col[2]);
				p.rect(x,y,rectWidth,rectHeight);
				
				//draw entity name
				p.pushMatrix();
					p.fill(0);
					p.textSize(12);
					p.translate(x+2,y+5+rectHeight);
					p.rotate(p.PI/3.5);
					p.text(entity.id,0,0);
				p.popMatrix();
				
				//draw number of sites an entity is on
				p.fill(249, 20, 15);
				p.textSize(14);
				p.text(entity.children.length,x+5,y+20);
			}
			
			//p.noLoop();	
		}
	});
}
