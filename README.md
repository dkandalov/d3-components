d3 components
=============
This is a bunch of UI and data components built on top of [d3.js](https://github.com/mbostock/d3).
Overall the idea is to have **reactive components which can be combined with each other in different ways**.
See [JUnit code history visualization](http://dkandalov.github.io/code-history-mining/JUnit.html).

**WARNING**: this is work-in-progress.


Why?
====
d3.js is good but after writing a lot of code it might feel like the rubik's cube in the picture below.
There are libraries (e.g. [dc.js](https://github.com/dc-js/dc.js)) which are not too low-level
but they seem to be designed for few charts with many configuration options.
What would be great is to have **small composable components** with minimal dependencies on each other.
This is an attempt to do it.

<img src="https://raw.githubusercontent.com/dkandalov/d3-components/master/omg.jpg" alt="OMG" title="OMG" align="center"/>


How to try it?
==============
Using jsfiddle:
 - [bar chart](http://jsfiddle.net/r4wk0c5t/)
 - [graph](http://jsfiddle.net/2ywqjzkg/1/)

Or locally:
 - clone the project
 - open locally ```examples/bar-chart-example.html``` or ```examples/graph-example.html```
 - use ```specs/SpecRunner.html``` to execute jasmine specs


API
===
Currently there no proper API documentation so looks at examples might be the best way to understand how components work.

There are two types of components: data source and UI components.
Data source components produce or transform data. They are supposed to be wrapped around each other
so that from outside it looks like one component.
UI components listen to updates from data component and modify web page.


Installation
============
Copy ```js/*.js``` and ```stylesheets/*.css``` files to your project.

To be done: NPM integration.