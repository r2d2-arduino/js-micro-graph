const _version = 1.12;

class MicroGraph {

    constructor( id, data ) {
        this.id = id;
        this.offsetX = 40;
        this.offsetY = 25;
        this.edge = 4;

        this.canvas = document.getElementById(this.id);

        if (this.canvas){
            this.ctx = this.canvas.getContext('2d');
            
            this.data = data;
            this.minBorder = undefined;
            this.maxBorder = undefined;
            this.minValue  = undefined;
            this.maxValue  = undefined;
            this.regionLength = undefined;
            this.regionStep = undefined;
            this.regionHeight = undefined;
            this.regionPixelValue = undefined;
            this.labelWidth = undefined;

            this.loadData(data);
            this.resizeCanvas();
            this.makeHint();
            this.addEvents();
        } else {
            console.warn('Canvas element not found, id: ' + id);
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

        let values = this.data.values.length;
        for ( let vi = 0; vi < values; vi++){
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
        this.minBorder = data.yScale[0].start;
        this.maxBorder = data.yScale[0].end;
        this.minValue  = data.yScale[0].start;
        this.maxValue  = data.yScale[0].end;

        let values = this.data.values.length;
        for ( let vi = 0; vi < values; vi++){
            this.calcMinMax(vi);
        }

        this.regionStep = this.calcRegionStep();
        const regionSum = this.maxBorder - this.minBorder;
        this.regionLength = Math.round( regionSum / this.regionStep ) + 1;
    }

    addEvents(){
        this.handleBuild = this.buildGraph.bind(this);
        this.handleMouseMove = this.graphMouseMove.bind(this);
        this.handleMouseLeave = this.graphMouseLeave.bind(this);

        window.addEventListener( 'load',   this.handleBuild );
        window.addEventListener( 'resize', this.handleBuild );

        this.canvas.addEventListener( 'mousemove', this.handleMouseMove );
        this.canvas.addEventListener( 'mouseleave', this.handleMouseLeave );
        //this.canvas.addEventListener( 'touchstart', this.handleMouseMove );
    }

    resizeCanvas(){
        this.clear();
        if (this.data.height !== undefined){
            this.canvas.height = this.data.height;
        } else {
            this.canvas.height = 300;
        }
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.style.textAlign = 'center';

        this.labelWidth   = (this.canvas.clientWidth  - this.offsetX*2) / this.data.xScale[0].labels.length;
        this.regionHeight = (this.canvas.clientHeight - this.offsetY*2) / (this.regionLength - 1);
        const regionSum = this.maxBorder - this.minBorder;
        this.regionPixelValue =  (this.canvas.clientHeight - this.offsetY*2) / regionSum;
    }

    fillTableArea(){
        const labelLength = this.data.xScale[0].labels.length;
        const regionEnd = this.data.yScale[0].end;
        const regionStart = this.data.yScale[0].start;

        const yTop = this.offsetY + (this.maxBorder - regionEnd) * this.regionPixelValue;
        const yHeight = (regionEnd - regionStart) * this.regionPixelValue;

        //Field between start and end regions
        this.ctx.fillStyle = 'rgb(228 234 239 / 50%)';
        this.ctx.fillRect(this.offsetX, yTop, this.labelWidth * labelLength, yHeight);
    }

    makeRegionLines(){
        const regionEnd = this.data.yScale[0].end;
        const regionStart = this.data.yScale[0].start;

        const yTop = this.offsetY + (this.maxBorder - regionEnd) * this.regionPixelValue;
        const yHeight = (regionEnd - regionStart) * this.regionPixelValue;

        //Set line settings
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgb(218 218 218 / 100%)';

        const xStart = this.offsetX;
        const xEnd = this.canvas.clientWidth - this.offsetX;

        this.ctx.beginPath();
        this.ctx.moveTo( xStart, yTop );
        this.ctx.lineTo( xEnd, yTop );
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo( xStart, yTop + yHeight );
        this.ctx.lineTo( xEnd, yTop + yHeight );
        this.ctx.stroke();
    }

    makeVerticalLines(){
        //Set line settings
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgb(220 220 220 / 100%)';

        //Set text label settings
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center'
        this.ctx.fillStyle = 'rgb(90 90 90 / 100%)';

        const labelLength = this.data.xScale[0].labels.length;

        const yStart = this.offsetY - this.edge - 1;
        const yEnd = this.canvas.clientHeight - this.offsetY + this.edge;

        for ( let i = 0; i < labelLength; i++){
            const xCol = this.offsetX + (i + 0.5) * this.labelWidth;

            this.ctx.beginPath();
            this.ctx.moveTo( xCol, yStart );
            this.ctx.lineTo( xCol, yEnd );
            this.ctx.stroke();

            this.ctx.fillText( this.data.xScale[0].labels[i], xCol, this.canvas.clientHeight - 6 );
        }
    }

    makeHorizontalLines(){
        //Set line settings
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgb(220 220 220 / 100%)';

        //Set text label settings
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'right'
        this.ctx.fillStyle = 'rgb(90 90 90 / 100%)';

        let zeroLine = -1;
        const regionEnd = this.maxBorder;

        const xStart = this.offsetX - this.edge;
        const xEnd = this.canvas.clientWidth - this.offsetX + this.edge;

        for ( let i = 0; i < this.regionLength; i++){
            const yRow = this.offsetY + i * this.regionHeight;
            this.ctx.beginPath();
            this.ctx.moveTo( xStart, yRow );
            this.ctx.lineTo( xEnd, yRow );
            this.ctx.stroke();

            const regionText = Math.round(regionEnd - this.regionStep * i);
            this.ctx.fillText( String(regionText), xStart - 5, yRow + 3 );

            if ( regionText === 0){
                zeroLine = i;
            }
        }

        //Zero line
        if ( zeroLine > -1 ){
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'rgb(180 180 180 / 100%)';

            const yZero = this.offsetY + zeroLine * this.regionHeight;

            this.ctx.beginPath();
            this.ctx.moveTo( xStart, yZero );
            this.ctx.lineTo( xEnd, yZero );
            this.ctx.stroke();
        }
    }

    makeGraphLine(vi){
        //Set line settings
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.data.colors[vi];
        this.ctx.beginPath();

        const valuesVi = this.data.values[vi];
        //Graph
        for ( let i = 0; i < valuesVi.length; i++){
            const value = parseFloat(valuesVi[i]);
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
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';

        //Dots
        const valuesVi = this.data.values[vi];
        for ( let i = 0; i < valuesVi.length; i++){
            const value = parseFloat(valuesVi[i]);

            this.ctx.beginPath();
            this.ctx.arc( this.offsetX + (i + 0.5) * this.labelWidth,
                this.offsetY + (this.maxBorder - value) * this.regionPixelValue,
                dotSize, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }

    makeGradient(vi){
        if ( (this.data.gradient[vi] !== undefined) && (this.data.gradient[vi] == 1) ){
            this.ctx.save();

            //Set line settings
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = this.data.colors[vi];

            this.ctx.beginPath();
            //Start point
            this.ctx.moveTo( this.offsetX + 0.5 * this.labelWidth,
                this.offsetY + (this.maxBorder) * this.regionPixelValue );

            //Graph
            const valuesVi = this.data.values[vi];
            for ( let i = 0; i < valuesVi.length; i++){
                let value = parseFloat(valuesVi[i])
                this.ctx.lineTo( this.offsetX + (i + 0.5) * this.labelWidth,
                    this.offsetY + (this.maxBorder - value) * this.regionPixelValue );
            }

            //End point
            this.ctx.lineTo( this.offsetX + (valuesVi.length - 0.5) * this.labelWidth,
                this.offsetY + (this.maxBorder) * this.regionPixelValue );

            //Connect
            this.ctx.closePath();

            this.ctx.clip();

            const regionSum = this.maxBorder - this.minBorder;
            const grad = this.ctx.createLinearGradient( 0, ( this.maxBorder - this.maxValue ) * this.regionPixelValue * 0.8,
                0, this.offsetY + regionSum * this.regionPixelValue );

            grad.addColorStop( 1, 'rgb(255 255 255 / 30%)' );
            grad.addColorStop( 0, this.data.colors[vi] );

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(this.offsetX + this.labelWidth * 0.5, ( this.maxBorder - this.maxValue ) * this.regionPixelValue * 0.8,
                this.canvas.clientWidth - this.offsetX*2 - this.labelWidth,  this.data.height - this.offsetY*2);

            this.ctx.restore();
        }
    }

    makeHint(){
        let graphTip = document.createElement('div');
        graphTip.id = 'graph-tip-' + this.id;
        graphTip.setAttribute('class', 'graph-tip');
        graphTip.setAttribute('data-index', '-1');
        graphTip.setAttribute('style', 'top: 0px; left: 0px; opacity: 0;');

        let spanTitle = document.createElement('span');
        spanTitle.setAttribute('class', 'title');
        graphTip.appendChild(spanTitle);
        
        let ulElement = document.createElement('ul');

        const viLength = this.data.values.length;
        for ( let vi = 0; vi < viLength; vi++){
            let hint = this.data.names[vi];
            if (hint === undefined){
                hint = '';
            }

            let color = this.data.colors[vi];
            if (color === undefined){
                color = '#000000';
            }
            
            let strongElement = document.createElement('strong');
            
            let spanHint = document.createElement('span');
            spanHint.setAttribute('class', 'hint');
            spanHint.textContent = hint;
            
            let liElement = document.createElement('li');
            
            liElement.style.borderTop = '3px solid ' + color;
            liElement.appendChild(strongElement);
            liElement.appendChild(spanHint);
            
            ulElement.appendChild(liElement);
        }
        
        graphTip.appendChild(ulElement);
        
        let divPointer = document.createElement('div');
        divPointer.setAttribute('class', 'pointer');
        
        graphTip.appendChild(divPointer);
        
        this.canvas.after(graphTip);
    }

    makeTitle(){
        if (this.data.title !== undefined){
            //Set title settings
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'right'
            this.ctx.fillStyle = 'rgb(90 90 90 / 100%)';

            this.ctx.fillText( this.data.title, this.canvas.clientWidth - this.offsetX, 14 );
        }
    }

    calcMinMax(vi){
        const valuesLength = this.data.values[vi].length;
        let maxBorder = this.maxBorder;
        let minBorder = this.minBorder;
        let minValue = this.minValue;
        let maxValue = this.maxValue;

        for ( let i = 0; i < valuesLength; i++){
            let currValue = this.data.values[vi][i];

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
        const dot = Math.round( (event.offsetX - this.offsetX) / this.labelWidth - 0.5 );
        
        if ( (dot > -1) && (dot < this.data.values[0].length) )  {
            
            const viLen = this.data.values.length;

            let maxValue = parseFloat(this.data.values[0][dot]);
            for ( let vi = 1; vi < viLen; vi++){
                const currValue = parseFloat(this.data.values[vi][dot]);
                if ( currValue > maxValue){
                    maxValue = currValue;
                }
            }

            const yPos = this.offsetY + this.canvas.offsetTop + (this.maxBorder - maxValue) * this.regionPixelValue;
            
            let graphTip = document.getElementById('graph-tip-' + this.id);
            
            if ( dot != graphTip.getAttribute('data-index') ){ //diffferent position of hint
                const canvasRightBorder = this.canvas.offsetLeft + this.canvas.offsetWidth;

                const xDot = ( dot + 0.5 ) * this.labelWidth + this.canvas.offsetLeft + this.offsetX - (graphTip.clientWidth * 0.5);
                let xPos = xDot;
                if (xPos < 4){
                    xPos = 4;
                }
                if (xPos + graphTip.offsetWidth > canvasRightBorder){
                    xPos = canvasRightBorder - graphTip.offsetWidth;
                }

                let ySuffix = this.data.yScale[0].suffix;
                if (ySuffix === undefined){
                    ySuffix = '';
                }

                let xSuffix = this.data.xScale[0].suffix;
                if (xSuffix === undefined){
                    xSuffix = '';
                }

                graphTip.querySelector('span.title').textContent = this.data.xScale[0].labels[dot] + xSuffix;

                let ulLiStrong = graphTip.querySelectorAll('ul li strong');
                for ( let vi = 0; vi < viLen; vi++){
                    ulLiStrong[vi].textContent = this.data.values[vi][dot] + ySuffix;
                }

                graphTip.querySelector('div.pointer').style.left = 'calc(50% + ' + (xDot - xPos) + 'px)';
                graphTip.style.top = yPos - graphTip.clientHeight - 10 + 'px';
                graphTip.style.left = xPos + 'px';
                graphTip.setAttribute('data-index', dot); 
                graphTip.style.opacity = '1';                              
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
        let graphTip = document.getElementById('graph-tip-' + this.id);
        if (graphTip) {
            graphTip.style.top = '0';
            graphTip.style.left = '0';
            graphTip.style.opacity = '0';
            graphTip.setAttribute('data-index', '-1');
        }
    }

    clear(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    destroy(){
        window.removeEventListener('load', this.handleBuild);
        window.removeEventListener('resize', this.handleBuild);
        
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
        //this.canvas.removeEventListener( 'touchstart', this.handleMouseMove );
        
        let graphTip = document.getElementById('graph-tip-' + this.id);
        if (graphTip) {
            graphTip.remove();
        }

        this.clear();
        this.ctx = null;
        this.canvas = null;
    }
}
