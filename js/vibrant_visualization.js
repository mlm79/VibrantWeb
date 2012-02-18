/**
 * vibrant_visualization.js -- Visualizing 3rd-party entities on the web.
 * This script requires jQuery and Processing.js.
 *
 * @author Margaret McKenna
*/

var VibrantViz = VibrantViz || {};

//_data_groups - array of data collections

VibrantViz.interRelations = function(canvas_id,_data){

	var xIndent = 70;
	var ySeparation;
	var yIndent = 120;
	
	var rectWidth;
	var rectHeight = 30;
	var site_length;
	
	var filter_min;
	var filter_max;
	var range_min = 500;
	var range_max = 0;
	var site_names = [];
		
	for (var i in _data.sites) {
		if (typeof(_data.sites[i].index)!=undefined) {
			if (_data.sites[i].entities.length<range_min) {range_min = _data.sites[i].entities.length}
			if(_data.sites[i].entities.length>range_max) {range_max = _data.sites[i].entities.length}
			site_names.push(i);
			site_length++;
		} else {
			delete _data.sites[i];
		}
		filter_min = range_min;
		filter_max = range_max;
		site_names.sort();
		console.log("site names",site_names);
	}
	
	//$(function() {
	function setControls(){
		$("#site_search").append('<input id="tags" />');
		$( "#tags" ).autocomplete({
			source: site_names
		});
		
		
	
		$( "#slider-range" ).slider({
			range: true,
			min: range_min,
			max: range_max,
			values: [ filter_min, filter_max ],
			slide: function( event, ui ) {
				$( "#amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
				filter_min = ui.values[0];
				filter_max = ui.values[1];
			}
		});
		$( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 ) +
			" - " + $( "#slider-range" ).slider( "values", 1 ) );
	}
	
	setControls();
	//});
	
			
	function DataObject(){}
	
	DataObject.prototype.resize = function(){
		//
	};
	
	DataObject.prototype.id = function(){
		return this.id;
	};
	
	DataObject.prototype.self = function(){
		return this;
	};
	
	DataObject.builder = function(type,_id) {
		var constr = type,
			id = _id,
			newObj;
			
		if (typeof DataObject[constr].prototype.self!=='function'){
			DataObject[constr].prototype = new DataObject();
			//console.log('constr',type);
		}
		
		newObj = new DataObject[constr](id);
		return newObj;	
	};
	
	DataObject.sites = function(id) {
		this.id = id;
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
	
	var data_objects = function(){
		if (this.obj!=null) {
			return this.obj;
		}
		var newObj = {'sites':[],'entities':[]};
		for (var i in newObj) {
			for (var j in _data[i]) {
				var obj = DataObject.builder(i,j);
				newObj[i].push(obj);
			}
		}
		this.obj = newObj;
		//console.log(newObj);
		return newObj;
	};
	
	function filterDataObjects(type,min,max) {
		var d = _d = data_objects();
		var new_data = {'sites':[],'entities':[]};
		//console.log("min",min,"max",max);
		if (type=='sites'){
			other = 'entities';
		} else {
			other = 'sites';
		}
		for (var i=0; i < _d[type].length;i++){
			if (_d[type][i].children.length>=min & _d[type][i].children.length<=max) {
				var obj = DataObject.builder(type,_d[type][i].id);
				new_data[type].push(obj);
				for (var j=0;j<_d[type][i].children.length;j++){
					var childObj = DataObject.builder(other,_d[type][i].children[j]);
					if (new_data[other].indexOf(childObj)==-1) {new_data[other].push(childObj)}
				}
			}
		}
		//console.log("filtered data obj array",new_data);
		return new_data;
	}


	
	var greatestLen = site_length>Object.keys(_data.entities).length?site_length:Object.keys(_data.entities).length;
	
	var w = $("#"+canvas_id).width();
	var h = $("#"+canvas_id).height();
	var canvasDims = {
		w:1300,
		h:600
	}
	
	
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
	
	function checkMouseHover(p,x,y,type){
		if (p.mouseX>x & p.mouseX < x+rectWidth & p.mouseY>yIndent & p.mouseY<yIndent+site_length*rectHeight){
			//console.log("fist pass");
			if (p.mouseY>y & p.mouseY<y+rectHeight) {
				//console.log("second pass");
				return true;
			}
		}
		return false;
	}
	
	
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
			col1 = [243, 132, 0];
			col2 = [1, 0, 194];
		}		
		for (var i =0;i<len;i++){
			var new_col = lerpColor(p,col1,col2,i/len);
			colors.push(new_col);
		}
		return colors;
	}
	
	var objs = data_objects();
	var siteColors, entityColors;
	
	var canvas = document.getElementById(canvas_id);
	var p = new Processing(canvas, function(p,c){	
	//function sketch( p ) {
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
			//console.log("objs unfiltered",objs.sites.length);

			objs = filterDataObjects('sites',filter_min,filter_max);
			siteColors = getColors(p,objs.sites.length,"color");
			entityColors = getColors(p,objs.entities.length,"gray");
			//console.log("objs filtered",objs.sites.length);
			p.background(255);
			rectWidth = (p.width-xIndent*2)/objs.sites.length;
			p.noStroke();
			for (var i =0; i < objs.sites.length;i++) {
				var col = siteColors[i];
				var site = objs.sites[i];
				p.fill(col[0],col[1],col[2]);
				var x = xIndent+i*rectWidth;
				var y = yIndent;
				p.rect(x,y,rectWidth,rectHeight);
				p.pushMatrix();
					p.fill(0);
					p.translate(x+5,y-5);
					p.rotate(p.PI/-3.5);
					p.text(site.id,0,0);
					//console.log(site.id);
				p.popMatrix();
				p.fill(255);
				p.text(site.children.length,x+5,y+15);
				p.pushMatrix();
					p.smooth();
					p.strokeWeight(.5);
					drawLines(site,x,y+rectHeight,col,objs.entities);
				p.popMatrix();
				//if (checkMouseHover(p,x,y,'sites')) {
					//drawLines(i,x,y,col);
				//}				
			}
			
			rectWidth = (p.width-xIndent*2)/objs.entities.length;
			//console.log(entityColors.length,objs.entities.length);
			p.noStroke();
			for (var i =0; i < objs.entities.length;i++) {
				var entity = objs.entities[i];
				var col = entityColors[i];
				p.fill(col[0],col[1],col[2]);
				var x = xIndent+i*rectWidth;
				var y = yIndent+rectHeight+ySeparation;
				p.rect(x,y,rectWidth,rectHeight);
				p.pushMatrix();
					p.fill(0);
					p.translate(x+5,y+5+rectHeight);
					p.rotate(p.PI/3.5);
					p.text(entity.id,0,0);
				p.popMatrix();
			}
			
			//p.noLoop();	
		}
	});
}