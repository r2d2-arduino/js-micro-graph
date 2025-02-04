"use strict";
const _version_ = '0.1.9';

class MicroGraph {

    constructor( id, data ) {
        this.id = id;        
        this.offsetX = 40;
        this.offsetY = 25;
        this.edge = 4;
        
        this.canvas = document.getElementById(this.id);
        
        if (this.canvas != undefined){
            this.ctx = this.canvas.getContext("2d");
            
            this.minBorder = undefined;
            this.maxBorder = undefined;
            this.minValue  = undefined;
            this.maxValue  = undefined;
            
            this.regionLen = undefined;
            this.regionStep = undefined;
            this.regionHeight = undefined;
            this.regionPixelValue = undefined;
            
            this.labelWidth = undefined;              
            
            this.loadData(data);

            this.resizeCanvas();
            
            this.makeHint();
            
            this.addEvents();
            
        } else {
            console.log('Canvas element not found, id: ' + id);
        }
    }
  
    buildGraph(){    
        this.hideHint();
                
        this.resizeCanvas();         
        
        this.makeTitle();
        
        this.fillTableArea();  
        
        this.makeRegionLines();

        this.makeVerticalLines();
        
        this.makeHorizontalLines();

        for (let vi = 0; vi < this.data.values.length; vi++){        
            this.makeGradient(vi);

            this.makeGraphLine(vi);

            this.makeDots(vi);
        } 
    }
    
    rebuildGraph(data){
        //this.clear();        
        this.loadData(data);        
        this.buildGraph();
    }
    
    loadData(data){
        this.data = data;
        
        this.minBorder = data.yScale[0].start;
        this.maxBorder = data.yScale[0].end;
        this.minValue  = data.yScale[0].start;
        this.maxValue  = data.yScale[0].end;
        
        for (let vi = 0; vi < this.data.values.length; vi++){
            this.calcMinMax(vi);       
        }
             
        this.regionStep = this.calcRegionStep();
        
        const regionSum = this.maxBorder - this.minBorder;
        
        this.regionLen = Math.round( regionSum / this.regionStep ) + 1;    
    }
    
    addEvents(){
        this.handleBuild = this.buildGraph.bind(this);
        this.handleMouseMove = this.graphMouseMove.bind(this);
        this.handleMouseLeave = this.graphMouseLeave.bind(this);
        
        window.addEventListener( 'load',   this.handleBuild );  
        window.addEventListener( 'resize', this.handleBuild );   
        
        this.canvas.addEventListener( 'mousemove', this.handleMouseMove );            
        this.canvas.addEventListener( 'mouseleave', this.handleMouseLeave );        
        this.canvas.addEventListener( 'ontouchstart', this.handleMouseMove );
    }
    
    resizeCanvas(){
        if (this.data.height != undefined){
            this.canvas.height = this.data.height;
        } else {
            this.canvas.height = 300;
        }
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.style.textAlign = 'center';
        
        this.labelWidth   = (this.canvas.clientWidth  - this.offsetX*2) / this.data.xScale[0].labels.length;
        this.regionHeight = (this.canvas.clientHeight - this.offsetY*2) / (this.regionLen - 1) ;
        const regionSum = this.maxBorder - this.minBorder;
        this.regionPixelValue =  (this.canvas.clientHeight - this.offsetY*2) / regionSum;
    }    
  
    fillTableArea(){
        const labelLen = this.data.xScale[0].labels.length;
        const regionEnd = this.data.yScale[0].end;
        const regionStart = this.data.yScale[0].start;
        
        const y_top = this.offsetY + (this.maxBorder - regionEnd) * this.regionPixelValue;
        const y_height = (regionEnd - regionStart) * this.regionPixelValue;
        
        //Field between start and end regions
        this.ctx.fillStyle = "rgb(228 234 239 / 50%)";
        this.ctx.fillRect(this.offsetX, y_top, this.labelWidth * labelLen, y_height);
    }
    
    makeRegionLines(){
        const regionEnd = this.data.yScale[0].end;
        const regionStart = this.data.yScale[0].start;
        
        const y_top = this.offsetY + (this.maxBorder - regionEnd) * this.regionPixelValue;
        const y_height = (regionEnd - regionStart) * this.regionPixelValue;
            
        //Set line settings
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgb(218 218 218 / 100%)";
        
        const x_start = this.offsetX;
        const x_end = this.canvas.clientWidth - this.offsetX;
        
        this.ctx.beginPath();
        this.ctx.moveTo( x_start, y_top );
        this.ctx.lineTo( x_end, y_top );
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo( x_start, y_top + y_height );
        this.ctx.lineTo( x_end, y_top + y_height );
        this.ctx.stroke();
    }
  
    makeVerticalLines(){       
        //Set line settings
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgb(220 220 220 / 100%)";
        
        //Set text label settings
        this.ctx.font = "10px Arial";
        this.ctx.textAlign = "center"
        this.ctx.fillStyle = "rgb(90 90 90 / 100%)";
        
        const labelLen = this.data.xScale[0].labels.length;
        
        const y_start = this.offsetY - this.edge - 1;
        const y_end = this.canvas.clientHeight - this.offsetY + this.edge;
        
        for (let i = 0; i < labelLen; i++){
            const x_col = this.offsetX + (i + 0.5) * this.labelWidth;

            this.ctx.beginPath();
            this.ctx.moveTo( x_col, y_start );
            this.ctx.lineTo( x_col, y_end );
            this.ctx.stroke();

            this.ctx.fillText( this.data.xScale[0].labels[i], x_col, this.canvas.clientHeight - 6 );
        }
    }
  
    makeHorizontalLines(){
        //Set line settings
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgb(220 220 220 / 100%)";
        
        //Set text label settings
        this.ctx.font = "10px Arial";
        this.ctx.textAlign = "right"
        this.ctx.fillStyle = "rgb(90 90 90 / 100%)";          
      
        let zeroLine = -1;
        const regionEnd = this.maxBorder;
        
        const x_start = this.offsetX - this.edge;
        const x_end = this.canvas.clientWidth - this.offsetX + this.edge;
        
        for (let i = 0; i < this.regionLen; i++){
            const y_row = this.offsetY + i * this.regionHeight;            
            this.ctx.beginPath();
            this.ctx.moveTo( x_start, y_row );
            this.ctx.lineTo( x_end, y_row );
            this.ctx.stroke();

            const regionText = Math.round(regionEnd - this.regionStep * i);
            this.ctx.fillText( regionText, x_start - 5, y_row + 3 );      
            
            if ( regionText == 0){
                zeroLine = i;
            }
        }
        
        //Zero line
        if ( zeroLine > -1 ){
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "rgb(180 180 180 / 100%)";
            
            const y_zero = this.offsetY + zeroLine * this.regionHeight;
            
            this.ctx.beginPath();
            this.ctx.moveTo( x_start, y_zero );
            this.ctx.lineTo( x_end, y_zero );
            this.ctx.stroke();
        }
    }
  
    makeGraphLine(vi){
        //Set line settings
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.data.colors[vi];
        
        this.ctx.beginPath();
        //Start point
        const value0 = parseFloat(this.data.values[vi][0]);
        this.ctx.moveTo( this.offsetX + 0.5 * this.labelWidth, 
            this.offsetY + (this.maxBorder - value0) * this.regionPixelValue );
        
        //Graph
        for (let i = 0; i < this.data.values[vi].length; i++){
            const value = parseFloat(this.data.values[vi][i])
            this.ctx.lineTo( this.offsetX + (i + 0.5) * this.labelWidth, 
                this.offsetY + (this.maxBorder - value) * this.regionPixelValue );
        }       
            
        this.ctx.stroke(); 
    }
  
    makeDots(vi){
        //Dots settings
        const dotSize = 4;
        this.ctx.fillStyle = this.data.colors[vi];
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "rgb(255 255 255 / 80%)";
        
        //Dots 
        for (let i = 0; i < this.data.values[vi].length; i++){
            const value = parseFloat(this.data.values[vi][i]);
            
            this.ctx.beginPath();
            this.ctx.arc( this.offsetX + (i + 0.5) * this.labelWidth, 
                this.offsetY + (this.maxBorder - value) * this.regionPixelValue, 
                dotSize, 0, 2 * Math.PI);
            this.ctx.fill();       
            this.ctx.stroke();
        }
    }
    
    makeGradient(vi){
        if ( (this.data.gradient[vi] != undefined) && (this.data.gradient[vi] == 1) ){
            //this.ctx.globalCompositeOperation = "darken";
            this.ctx.save();
            
            //Set line settings
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = this.data.colors[vi];
            
            this.ctx.beginPath();
            //Start point
            this.ctx.moveTo( this.offsetX + 0.5 * this.labelWidth, 
                this.offsetY + (this.maxBorder) * this.regionPixelValue );
            
            //Graph
            for (let i = 0; i < this.data.values[vi].length; i++){
                let value = parseFloat(this.data.values[vi][i])
                this.ctx.lineTo( this.offsetX + (i + 0.5) * this.labelWidth, 
                    this.offsetY + (this.maxBorder - value) * this.regionPixelValue );
            }
            
            //End point
            this.ctx.lineTo( this.offsetX + (this.data.values[vi].length - 0.5) * this.labelWidth, 
                this.offsetY + (this.maxBorder) * this.regionPixelValue );
                
            //Connect
            this.ctx.closePath();        
                
            this.ctx.clip();    
            
            const regionSum = this.maxBorder - this.minBorder;
            const grad = this.ctx.createLinearGradient( 0, ( this.maxBorder - this.maxValue ) * this.regionPixelValue * 0.8, 
                0, this.offsetY + regionSum * this.regionPixelValue );
            
            grad.addColorStop( 1, "rgb(255 255 255 / 30%)" );
            grad.addColorStop( 0, this.data.colors[vi] );
            
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(this.offsetX + this.labelWidth * 0.5, ( this.maxBorder - this.maxValue ) * this.regionPixelValue * 0.8, 
                this.canvas.clientWidth - this.offsetX*2 - this.labelWidth,  this.data.height - this.offsetY*2); 
            
            this.ctx.restore();   
        }    
    }    
  
    makeHint(){
        let hintElement = document.createElement('div');
        hintElement.id = "graph-tip-" + this.id;
        hintElement.setAttribute('class', "graph-tip");
        hintElement.setAttribute('data-index', '-1');
        hintElement.setAttribute('style', 'top: 0px; left: 0px; opacity: 0;');
        
        const viLen = this.data.values.length;
        let newHtml = '<span class="title"></span><ul>';
        
        for (let vi = 0; vi < viLen; vi++){
            newHtml += '<li><strong></strong><span class="hint"></span></li>';  
        }
        newHtml += '</ul><div class="pointer" style="left: 50%;"></div>';
        
        hintElement.innerHTML = newHtml;
        
        this.canvas.after(hintElement);
        
        let graphTip = document.getElementById("graph-tip-" + this.id);
        
        for (let vi = 0; vi < viLen; vi++){
            let hint = this.data.names[vi];
            if (hint == undefined){
                hint = '';
            }
            
            let color = this.data.colors[vi];
            if (color == undefined){
                color = '#000000';
            }
            
            graphTip.querySelectorAll('.hint')[vi].innerHTML = hint;
            graphTip.querySelectorAll('ul li')[vi].style.borderTop = "3px solid " + color;
        }
    }
  
    makeTitle(){
        if (this.data.title != undefined){
            //Set title settings
            this.ctx.font = "12px Arial";
            this.ctx.textAlign = "right"
            this.ctx.fillStyle = "rgb(90 90 90 / 100%)";
            
            this.ctx.fillText( this.data.title, this.canvas.clientWidth - this.offsetX, 14 );
        }
    }
    
    calcMinMax(vi){
        const valuesLen = this.data.values[vi].length;
        let maxBorder = this.maxBorder;
        let minBorder = this.minBorder;
        let minValue = this.minValue;
        let maxValue = this.maxValue;
        
        for (let i = 0; i < valuesLen; i++){
            let currValue = this.data.values[0][i] * 1;
            
            if ( currValue < minBorder){
                minBorder = currValue;
            }
            if ( currValue > maxBorder ){
                maxBorder = currValue;
            }
            if ( currValue < minValue){
                minValue = currValue;
            }
            if ( currValue > maxValue ){
                maxValue = currValue;
            }            
        }
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.maxBorder = Math.ceil(maxBorder / 10) * 10;
        this.minBorder = Math.floor(minBorder / 10) * 10;
    }
  
    calcRegionStep(){
        const regionSum = this.maxBorder - this.minBorder;
        const amountNum = Math.floor( Math.log10( regionSum ) ) + 1;
        
        
        let regionStep = Math.ceil( regionSum / (10 ** amountNum) ) * (10 ** (amountNum - 1));
        if (regionSum / regionStep < 3){
            regionStep /= 2;
        }
        
        return regionStep;
    }
    
    graphMouseMove(event){        
        const x = event.clientX;        
        const labelWidth = this.labelWidth;
        const dot = Math.round( (x - this.offsetX) / labelWidth - 0.5 );       
        
        if ( (dot > -1) && (dot < this.data.values[0].length) )  {
            
            const viLen = this.data.values.length;
            
            let maxValue = parseFloat(this.data.values[0][dot]);
            for (let vi = 1; vi < viLen; vi++){
                const currValue = parseFloat(this.data.values[vi][dot]);
                if ( currValue > maxValue){
                    maxValue = currValue;
                }
            }           
            
            const y_pos = this.offsetY + this.canvas.offsetTop + (this.maxBorder - maxValue) * this.regionPixelValue;        
        
            let graphTip = document.getElementById("graph-tip-" + this.id);
            
            if ( dot != graphTip.getAttribute('data-index') * 1 ){ //diffferent position of hint
                const canvasRightBorder = this.canvas.offsetLeft + this.canvas.offsetWidth;
                
                const x_dot = ( dot + 0.5 ) * labelWidth + this.canvas.offsetLeft + this.offsetX - (graphTip.clientWidth * 0.5);
                let x_pos = x_dot;
                if (x_pos < 4){
                    x_pos = 4;
                }
                if (x_pos + graphTip.offsetWidth > canvasRightBorder){
                    x_pos = canvasRightBorder - graphTip.offsetWidth;
                }
                
                graphTip.style.top = y_pos - graphTip.clientHeight - 10 + 'px';
                graphTip.style.left = x_pos + 'px';
                graphTip.style.opacity = 1;                
                graphTip.setAttribute('data-index', dot);
                
                let y_suff = this.data.yScale[0].suffix;
                if (y_suff == undefined){
                    y_suff = '';
                }
                
                let x_suff = this.data.xScale[0].suffix;
                if (x_suff == undefined){
                    x_suff = '';
                }
                
                graphTip.querySelector('span.title').innerHTML = this.data.xScale[0].labels[dot] + x_suff;
                
                let ulLiStrong = graphTip.querySelectorAll('ul li strong');
                for (let vi = 0; vi < viLen; vi++){
                    ulLiStrong[vi].innerHTML = this.data.values[vi][dot] + y_suff;                                        
                }
                
                graphTip.querySelector('div.pointer').style.left = "calc(50% + " + (x_dot - x_pos) + "px)";
            }
        }
    }

    graphMouseLeave(event){
        const x = event.clientX;
        const y = event.clientY;
        
        const borderTop  = this.offsetY + this.canvas.offsetTop;
        const borderLeft = this.offsetX + this.canvas.offsetLeft;
        const borderRight  = this.canvas.clientWidth + borderLeft - this.offsetX*2;
        const borderBottom = this.canvas.clientHeight + borderTop - this.offsetY*2;

        if ( (x < borderLeft) || (x > borderRight) || ( y < borderTop) || (y > borderBottom) ){
            this.hideHint();
        } 
    }   
    
    hideHint(){
        let graphTip = document.getElementById("graph-tip-" + this.id);
        graphTip.style.top = 0;
        graphTip.style.left = 0;
        graphTip.style.opacity = 0;     
    }  
    
    clear(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    destroy(){
        window.removeEventListener( 'load',   this.handleBuild );  
        window.removeEventListener( 'resize', this.handleBuild );   
        
        this.canvas.removeEventListener( 'mousemove',  this.handleMouseMove );            
        this.canvas.removeEventListener( 'mouseleave', this.handleMouseLeave );        
        this.canvas.removeEventListener( 'ontouchstart', this.handleMoveMove );
        
        this.clear();
        //remove tip
        document.getElementById("graph-tip-" + this.id).remove();
    }
}
