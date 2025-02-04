# js-micro-graph
Simple and lightweight library for plotting graphs in native JS.

The canvas element is used as a basis.

## Examples of graphs
![Example 1 of graph](/../main/photos/graph-1.png)
![Example 2 of graph](/../main/photos/graph-2.png)

## File Structure:
* **micro-graph.css** - Styles used in the graph tooltip. 
* **micro-graph.js** - Main library for plotting. Uncompressed version (17kB).
* **micro-graph.min.js** - Main library for plotting. Compressed version (8.5kB).
* **micro-graph.min.js.gz** - Main library for plotting. Compressed GZ version (2.3kB).

  
## Example of code
```html
<link href="micro-graph.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="micro-graph.js"></script>

<canvas id="myCanvas"></canvas>

<script>
  const data = {  
    title: 'Temperature',
    xScale: [{
      suffix: ' day',
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    }],
    yScale: [{
      suffix: ' C*',
      start: -20, 
      end: 40 }],
    values: [
      [7.15, 1.41, -1.22, -3.02, -0.67,4.81, 5.04, 3.81, 5.74, 0.62, -1.4, -0.95, -1.36, 1.07, 0.87, 1.88, 3.29, 3.48, 0.32, -0.69, 0.04, 0.75, 1.84, 3.41, 5.61, 6.03, 6.37, 7.1, 7.34, 5.72, 5.15],
    ],        
    names: ['Inner temperature'],      
    colors: ['#743ee2'],
    height: 300,
    gradient: [1],
 }
 let myGraph = new MicroGraph('myCanvas', data);
</script>
```
