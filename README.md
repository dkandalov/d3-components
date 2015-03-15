d3 components
=============
This is a bunch of UI and data components built on top of [d3.js](https://github.com/mbostock/d3).
Overall idea is to have reactive components which can be combined with each other in different ways.
See [JUnit code history visualization](http://dkandalov.github.io/code-history-mining/JUnit.html).

**WARNING**: this is work-in-progress.


Why?
====
d3.js is good but after writing a lot of code it might feel a bit like the cat in picture.
There are other libraries (like [dc.js](https://github.com/dc-js/dc.js)) but they seem to be designed for few
charts with many configuration options.
What would be great is to have small composable components with minimal dependencies on each other.
This is an attempt to do it.
(To be fair there are libraries that might already do it, e.g. [DVL](https://github.com/vogievetsky/DVL) seems to be based on similar idea.)

<img src="https://raw.github.com/dkandalov/d3-components/master/omg.gif" alt="demo" title="OMG" align="center"/>


How to use?
===========
Currently there is no proper API documentation and the only way is to look at examples.

Using jsfiddle:
 - [bar chart](http://jsfiddle.net/r4wk0c5t/)
 - [graph](http://jsfiddle.net/2ywqjzkg/1/)

Or locally:
 - clone the project
 - open locally ```examples/bar-chart-example.html``` or ```examples/graph-example.html```
 - use ```specs/SpecRunner.html``` to execute jasmine specs


Installation
============
Copy ```js/*.js``` and ```stylesheets/*.css``` files to your project.

To be done: NPM integration.