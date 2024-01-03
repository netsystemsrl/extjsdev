//*** This code is copyright 2003 by Gavin Kistner, !@phrogz.net
//*** It is covered under the license viewable at http://phrogz.net/JS/_ReuseLicense.txt
//*** Reuse or modification is free provided you abide by the terms of that license.
//*** (Including the first two lines above in your source code satisfies the conditions.)

function NewObj(kind,props,dad,text){
	var el=document.createElementNS("http://www.w3.org/2000/svg",kind);
	if (props!=null) for (var a in props){
		el.setAttributeNS(/^xlink:/.test(a)?'http://www.w3.org/1999/xlink':null,a,props[a]);
	}
	if (dad) dad.appendChild(el);
	if (text) el.appendChild(document.createTextNode(text));
	return el;
}

function DebugOut(msg,lv){
	var debugLevel=window.debugLevel;
	if (debugLevel==null) debugLevel=0;
	if (lv>debugLevel) return;
	var dOut=document.getElementById('debugoutput');
	if (dOut==null) alert(msg);
	else NewObj('tspan',{x:dOut.getAttribute('x'),dy:'1em',dx:0},dOut,msg);
}



function Point(x,y){
	if (x && x.x!=null){y=x.y; x=x.x}
	this.x=x*1; this.y=y*1;
}
Point.prototype.toSVGPoint=function(){ var p=document.documentElement.createSVGPoint(); p.x=this.x; p.y=this.y; return p }
Point.prototype.distanceTo=function(p2){
	var dx,dy;
	return Math.sqrt((dx=(p2.x-this.x))*dx+(dy=(p2.y-this.y))*dy);
}
Point.prototype.toString=function(){return '{'+this.x+','+this.y+'}'};




function Rect(x1,y1,x2,y2){
	this.x1=Math.min(x1*1,x2*1);
	this.x2=Math.max(x1*1,x2*1);
	this.y1=Math.min(y1*1,y2*1);
	this.y2=Math.max(y1*1,y2*1);
}
Rect.prototype.toSVGRect=function(){
	var r=document.documentElement.createSVGRect();
	r.x=this.x1; r.y=this.y1;
	r.width=this.x2-this.x1;
	r.height=this.y2-this.y1;
	return r;
}
Rect.prototype.toString=function(){ return '{{'+this.x1+','+this.y1+'},{'+this.x2+','+this.y2+'}}' }


function GetClass(obj){
	if (obj==null) return;
	var cName = obj.getAttribute('class');
	return (typeof(cName)=='string') ? cName : '';
}
function HasClass(obj,cName){ return (obj==null)?null:(new RegExp("\\b"+cName+"\\b")).test(GetClass(obj)) }
function AddClass(obj,cName){ KillClass(obj,cName); var oldClass; return (obj==null)?null:obj.setAttribute('class',(oldClass=GetClass(obj))+(oldClass.length!=0?' ':'')+cName) }
function KillClass(obj,cName){ return (obj==null)?null:obj.setAttribute('class',GetClass(obj).replace(RegExp("^"+cName+"\\b\\s*|\\s*\\b"+cName+"\\b",'g'),'')) }





//***Gives you the coordinates in object space for a given object corresponding to the mouse pointer location
//***Accounts for all transform='...' transformations, viewBox offsets, scaling and panning,
//***but does not (yet) account for viewBox scaling.
function ObjectCoordsFromMouse(obj,evt){
	var svgdoc = evt.target.ownerDocument;
	var svgroot = svgdoc.documentElement;
	if (window.isBrokenCTM==null){
		var t=svgdoc.createElement('g');
		t.setAttribute('transform','translate(-10)');
		t=t.appendChild(svgdoc.createElement('g'));
		t.setAttribute('transform','translate(10)');
		window.isBrokenCTM = t.getCTM().e>0.5;
	}
	var totalTransform;
	if (!isBrokenCTM) totalTransform=obj.getCTM();
	else{
		var matrices=[],n=obj;
		while(n!=null){
			if (n.getCTM!=null) matrices.push(n.getCTM());
			if (n.tagName=='svg'){
				var vBox=n.getAttribute('viewBox').split(' ');
				var trans=n.currentTranslate;
				var m=svgroot.createSVGMatrix().translate(trans.x,trans.y).scale(n.currentScale);
				if (vBox.length>1) m=m.translate(-vBox[0],-vBox[1]);
				matrices.push(m);
			}
			n=n.parentNode;
		}
		//Create the total transformation matrix from the top down
		totalTransform=svgroot.createSVGMatrix();
		for (var i=matrices.length-1;i>=0;i--) totalTransform=totalTransform.multiply(matrices[i]);
	}
	totalTransform=totalTransform.inverse();

	var xy=svgroot.createSVGPoint();
	xy.x=evt.clientX; xy.y=evt.clientY;
	return xy.matrixTransform(totalTransform);
}



function MatrixOut(m){
	return !m?'null':'[ ['+m.a.roundTo(2)+'  '+m.c.roundTo(2)+'  '+m.e.roundTo(2)+']   ['+m.b.roundTo(2)+'  '+m.d.roundTo(2)+'  '+m.f.roundTo(2)+']   [0.00  0.00  1.00]]';

}

function SVGPointOut(p){
	return !p ? 'null':'{'+p.x.roundTo(2)+','+p.y.roundTo(2)+'}';
}

function MatrixEqual(m1,m2){
	return m1!=null && m2!=null && m1.a==m2.a && m1.b==m2.b && m1.c==m2.c && m1.d==m2.d && m1.e==m2.e && m1.f==m2.f;
}
