/**
 * vibrant_visualization.js -- Visualizing 3rd-party entities on the web.
 * This script requires jQuery and Processing.js.
 *
 * @author Margaret McKenna
*/

var VibrantViz = VibrantViz || {};

//_data_groups - array of data collections

VibrantViz.interRelations = function(canvas_id,_data){

	var xIndent = 20;
	var ySeparation;
	var yIndent = 50;
	
	var rectWidth;
	var rectHeight = 30;
	var site_length;
	
	for (var i in _data.sites) {
		if (typeof(_data.sites[i].index)!=undefined) {
			site_length++;
		} else {
			delete _data.sites[i];
		}
	}
	
	
			
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
			console.log('constr',type);
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
		var newObj = {'sites':[],'entities':[]};
		for (var i in newObj) {
			for (var j in _data[i]) {
				var obj = DataObject.builder(i,j);
				newObj[i].push(obj);
			}
		}
		console.log(newObj);
		return newObj;
	};
	
	function filterDataObjects(type,attr,min,max) {
		var d = data_objects();
		for (var i in d[type]){
			if (d[type][i].children.length<min || d[type][i].children.length>max) {
				d[type].remove(i);
			}
		}
		console.log("filtered data obj array",newObj);
		return data_objects;
	}


	
	var greatestLen = site_length>Object.keys(_data.entities).length?site_length:Object.keys(_data.entities).length;
	
	var canvasDims = {
		w:1300,
		//h:yIndent*2+greatestLen*rectHeight
		h:500
	}
	
	
	function drawLines(site) {
		var i = site,
		 	col = _data.sites[i].color,
		 	x = xIndent;
			y = yIndent+_data.sites[i].index*rectHeight;
		 	
		for (var j in _data.sites[i].entities) {
			var entity = _data.sites[i].entities[j];
			var x1 = x+rectWidth,
				y1 = y + j/_data.sites[i].entities.length*rectHeight,
				y2 = yIndent+_data.entities[entity].index*rectHeight+_data.entities[entity].sites.indexOf(i)/_data.entities[entity].sites.length*rectHeight,
				x2 = xIndent+rectWidth+xSeparation;
			p.stroke(col[0],col[1],col[2]);
			p.line(x1,y1,x2,y2);
		}
	}
	
	function checkMouseHover(p,x,y,type){
		if (p.mouseX>x & p.mouseX < x+rectWidth & p.mouseY>yIndent & p.mouseY<yIndent+site_length*rectHeight){
			console.log("fist pass");
			if (p.mouseY>y & p.mouseY<y+rectHeight) {
				console.log("second pass");
				return true;
			}
		}
		return false;
	}
	
	
	function lerpColor(p, c1, c2, amt ){ 
      var r = p.lerp(c1[0], c2[0], amt); 
      var g = p.lerp(c1[1], c2[1], amt); 
      var b = p.lerp(c1[2], c2[2], amt); 
      color = [r,g,b]
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
	
	var p = new Processing(canvas_id, function(p,c){
		
		$("#"+canvas_id).css({'width':canvasDims.w+'px','height':canvasDims.h+'px','margin':'auto','border':'1px solid #454545'});		
	
		
		p.setup = function(){
			p.size(canvasDims.w,canvasDims.h);
			p.ellipseMode(p.CENTER);
			p.smooth();
			p.noStroke();
			p.textMode(p.CENTER);
			siteColors = getColors(p,objs.sites.length,"color");
			entityColors = getColors(p,objs.entities.length,"gray");
			ySeparation = p.height-rectHeight*2-yIndent*2;
		},
		p.draw = function() {
			p.background(255);
			rectWidth = (p.width-xIndent*2)/objs.sites.length;
			
			for (var i =0; i < objs.sites.length;i++) {
				var col = siteColors[i];
				var site = objs.sites[i];
				p.fill(col[0],col[1],col[2]);
				var x = xIndent+i*rectWidth;
				var y = yIndent;
				p.rect(x,y,rectWidth,rectHeight);
				//p.fill(0);
				//p.text(i,x,y);
				p.fill(0);
				
				p.pushMatrix();
					p.translate(x+5,y+5);
					p.rotate(p.PI/-3.5);
					p.text(site.id,0,0);
					console.log(site.id);
				p.popMatrix();
				
				//if (checkMouseHover(p,x,y,'sites')) {
					//drawLines(i,x,y,col);
				//}				
			}
			
			rectWidth = (p.width-xIndent*2)/objs.entities.length;
			console.log(entityColors.length,objs.entities.length);
			for (var i =0; i < objs.entities.length;i++) {
				var col = entityColors[i];
				p.fill(col[0],col[1],col[2]);
				var x = xIndent+i*rectWidth;
				var y = yIndent+rectHeight+ySeparation;
				p.rect(x,y,rectWidth,rectHeight);
				//p.fill(0);
				//p.text(i,x+20,y+20);
			}
			
			p.noLoop();	
		}
	});

	


}

VibrantViz.intraRelations = function(canvas,_data){


}