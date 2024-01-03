This project aims to visualize various strategies for the blocks relocation problem (BRP).

It utilizes [grunt](http://gruntjs.com/) and [browserify](http://browserify.org/) to compile [coffee](http://coffeescript.org/) source to javascript. 
The resulting application relies on [three.js](http://threejs.org/) for accessing WebGL.


[Here](http://tilow.github.io/viola-three/) you can take a look at the application.
The `Storehouse` Object is exported to document and can thus be accessed by your browsers javascript-console.

There are basically three methods for accessing the top item of any (indexed) stack
* `document.storehouse.addItem(5);`
* `document.storehouse.unload(3);`
* `document.storehouse.relocate(4, 5);`


To run the application on your machine:
* install node
* install grunt globally (`npm install -g grunt-cli`)
* clone this repo
* hit `npm install`
* run `grunt`

You can then access a [local http server](http://127.0.0.1:8080) delivering the script to your browser.
