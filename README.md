# 3D Game of Life

# Introduction

In this tutorial, we'll use [three.js](threejs.org) to build a 3D version of John Conway's [Game of Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life). In the Game of Life, the population of cubes evolves over time. In each generation, whether a cube lives or dies depends on its neighbors.

More specifically, choose four numbers _a_, _b_, _c_, and _d_. Here's the breakdown:

1. If a living cube has between _a_ and _b_ neighbors, it stays alive to the next generation. Otherwise it dies (by over- or underpopulation.)
2. If an empty cell has between _c_ and _d_ neighbors, it becomes alive in the next generation (by reproduction).

Because these four parameters determine the rules of the game, for fixed _a_, _b_, _c_, and _d_, we say that you are playing Life version _a_,_b_,_c_,_d_. In the 3D version of the game, each cube can have at least 0 neighbors, and at most 26. You can demo a live version [here](https://rithmschool.github.io/game-of-life-3d/).

# Table of Contents

## Part 1: Overview

1. [Introduction to Three.js](#introduction-to-threejs)

## Part 2: A Randomly Generated Initial Board

1. [Application Structure: `GameRenderer`](#application-structure-gamerenderer)
2. [Application Structure: `Cube`](#application-structure-cube)
3. [Application Structure: `CubeUniverse`](#application-structure-cubeuniverse)
4. [Animating the Evolution](#animating-the-evolution)
5. [Adding an Interface](#adding-an-interface)

## Part 3: A Customizable Initial Universe

1. [Motivation](#motivation)
2. [Pending Status Layers for Cubes](#pending-status-layers-for-cubes)
3. [Handling Mouse Events](#handling-mouse-events)
4. [Updating the Interface](#updating-the-interface)
5. [Setting Up Examples](#setting-up-examples)

## Part 4: Next Steps

1. [Supplemental Features](#supplemental-features)

### Introduction to Three.js

Before digging into the application, we need to first understand some of the basics of Three.js. Work through the examples in [these](http://slides.com/mattlane-2/code-into-the-third-dimension#/) slides (the official documentation is helpful too).

### Application Structure: `GameRenderer`

This project comes with an `index.html` file and several JavaScript files. Feel free to add your own stylesheet if you'd like to create additional styles for your project.

Our application will be built using three constructor functions: `Cube`, `CubeUniverse`, and `GameRenderer`. 

- The `GameRenderer` will be responsible for rendering and updating the scene using Three.js.
- The `Cube` will be responsible for changing its life status
- The `CubeUniverse` will collect all of the cubes, and be responsible for counting neighbors for cubes, determining the next state of the universe, and so on.

Let's begin with our `GameRenderer`. The constructor function should take in a width, a height, and a DOM node, and create a camera, scene, a renderer, and whatever lighting you want for your version of the game. You should attach the renderer to the DOM node passed into the constructor function. You should also implement a prototpe method called `render` that continually rerenders the scene. 

Once you've done that, call the constructor function inside of the `app.js` and store it in a value called `game`. Make sure everything is loading correctly!

### Application Structure: `Cube`

Next, let's work on the `Cube` constructor, which is set up to inherit from `THREE.Mesh`. The cube constructor should take three coordinates (_x_, _y_, and _z_), and create a cube. Inside of the constructor is where you can decide what type of mesh to use for the cube, what default colors it should have, and so on.

To begin, we'll assume that when a cube is created, it is not alive. We'll do this setting the `transparent` property on our cube material equal to `true`, setting the `opacity` on its material to 0, and by setting an `isAlive` property on the cube's `userData` to `false`. In Three.js, every element in the scene has a `userData` object onto which you can attach custom key-value pairs.

You should also implement a `setAlive` method on the prototype, which accepts a boolean. If the boolean is `true`, the cube should be set to alive; otherwise, it should not.

Once this is implemented, try creating a cube and adding it to the scene.

### Application Structure: `CubeUniverse`

The `CubeUniverse` constructor is where we will manage most of the complexity of the game logic. To begin, the constructor function should take a parameter called `len`, which corresponds to the length of one side of the universe. For example, if we pass in the number 3, this constructor should construct a universe of 27 cubes in a 3 &times; 3 &times; 3 grid. It should also accept the parameters that determine whether or not a cube that is alive in one generation stays alive to the next, and whether a cube that is dead in one generation can become alive in the next. These are the four parameters _a_, _b_, _c_, and _d_ mentioned in the introduction. For convenience, you may want to store them as an array on the object to be created by `CubeUniverse`.

The object created by `CubeUniverse` should have a `cubes` property from which we can access all of the cubes. We would like to access them by coordinates; for example, if our universe is called `universe`, then `universe.cubes[0][0][0]` should refer to the cube with coordinates at (0, 0, 0). In order for this to work, `cubes` needs to be a 3D array: in other words, it is an array, whose elements are all arrays, and each of those elements is once again an array.

`CubeUniverse` should also implement the following prototype method:

- `eachCube` - iterates over the 3D array of cubes and runs a callback on each one. The callback has access to the current cube.

When you're finished, use `eachCube` to add the universe to the scene and randomly determine whether each cube should be alive. (For instance, you could set a cube to be alive if some number, randomly generated for each cube, is larger than 0.3.) As you're working, you may find that you need to update the position of the camera, or you may want to adjust your lighting. Feel free to continue to iterate on how your project looks as you're working on the functionality!

### Evolving the Universe

Once you have a randomly generated universe, it's time to try to evolve it from one generation to the next. To do this, we'll need to add a method to the `CubeUniverse` prototype:

- `evolve` - based on the rules of the game (i.e. the `keepAlive` and `makeAlive` values), determines which cubes should be alive in the next generation, then iterates over all of the cubes and calls `setAlive` on them with the proper boolean passed in.

In order to make `evolve` work, you may also want to implement a helper method:

- `__neighborCount` - takes in a cube and counts how many living neighbors surround that cube. This is necessary in order to determine which cubes should be alive in the next evolution.

Be careful with the implementation here. You can't evolve any of the cubes until you know what the status for each one must be in the next generation. If you evolve a cube prematurely, that will affect its neighbors counts, which could mess up the entire evolution!

Once you think you've got this working, try evolving the universe in the console several times. 

### Animating the Evolution

We're now reaching the point where it would be nice to have some more dynamic behavior on the page. For instance, we can only evolve the universe manually, by calling `evolve` in the console. It's also annoying that we can't move the camera around to explore the universe as it is evolving.

Let's fix both of these problems, but in reverse order. Three.js provides an external library called `OrbitControls` which adds mouse controls to the camera, so that we can rotate it and zoom.

To get this working, we first need to add a script tag into our HTML.

```html
<script src="https://threejs.org/examples/js/controls/OrbitControls.js"></script>
```

Next, let's go back into our `GameRenderer` and add the following prototype method:

```js
GameRenderer.prototype.addCameraControls = function(x,y,z) {
    var controls = new THREE.OrbitControls(
        this.camera,
        this.renderer.domElement
    );
    // set the center of the rotation
    // for the most natural movement, make this 
    // the center of the cube universe
    controls.target = new THREE.Vector3(x, y, z);
    controls.update();
    return controls;
}
```

That's it! You should now be able to control the camera with the moust.

Next, pick an interval (e.g. one or two seconds) and try to get the game to automatically evolve after every interval. You'll need to modify the `GameRenderer`'s `render` method, using the pattern from the slideshow in Part 1. You'll also need to figure out how to pass the cube universe into the `render` method in order to evolve it.

### Adding an Interface

Before adding any more functionality to the canvas itself, let's take some time to add a little user interface. Add the following functionality to the game:

- A user can change the initial probability that an individual cube will start out alive before the first evolution. (Where should you store this probability?)
- A user can change the parameters that determine how the cubes evolve (i.e. the values of _a_, _b_, _c_, and _d_).
- A user can click a button to play or pause the evolution of the cube universe. 
- A user can click a button to generate a new random initial state for the universe.

Feel free to add whatever prototype properties or methods you think are necessary. For example, it may help to create a `setRandomInitialState` method on `CubeUniverse` that takes in a probability _p_ and sets each cube to start out alive with probability _p_. You may also need a `playing` property on the `GameRenderer` to indicate whether the game should be playing or paused.

### Motivation

By now you should have a working version of the 3D Game of Life. You can even adjust the parameters of the game to explore how different values of _a_, _b_, _c_, and _d_ affect the system. This is great!

But it would be even better if we could manually set the initial state, say by clicking on squares to toggle them between being alive or not. This is a bit tricky to do in a 3D game; since our mouse only knows about two-dimensions, we'll need to choose squares from different 2D slices of our universe. By clicking some cubes to set them alive, changing the active 2D slice, and repeating, we can should then be able to set the initial state of the game to be whatever we want. So let's get into it!

### Pending Status Layers for Cubes

In order to show the current 2D slice that the user can interact with, we'll need a way to visually represent cubes that are in the active 2D slice. From now on, we'll call this slice "pending layer," since cubes in it are "pending" and can be set to alive. In order to do work with this idea, we'll add another property to our a cube's `userData` property. Let's call it `inPendingLayer`.

We'll create 2D slices of the universe along the _z_-axis. So for instance, our first layer could consist of all cubes with a _z_-coordinate of 0; our second layer could consist of all cubes with a _z_-coordinate of 1, and so on.

To begin, implement a `setPending` method on `Cube.prototype`. Like `setAlive`, this method should accept a boolean that determines set a cube's `userData.inPendingLayer` property and styles it accordingly. Next, create `setPendingLayer` on `CubeUniverse.prototype` that takes a _y_-coordinate, and sets cubes with a matching _y_-coordinate to be in the pending layer.

Once this is done, try loading the page without randomly setting initial life status on the cubes, so that the canvas looks empty. By calling `setPendingLayer` for different numbers, you should see the pending layer move on the screen.

### Handling Mouse Events

Once we have an active layer highlighted, we'd like to be able to mouse over a cube and click on it to toggle it from between pending and alive. But right now we have no way of handling mouse events on the cubes! Since we're using a `canvas` to render our 3D scene, it's not like we can add event listeners to the page in the same way we did when we started building our user interface.

Fortunately, this is where `Three.js` external libraries come to our aid once again. (If you ever have trouble doing something with the library, check out the examples in their documentation first - chances are good that there's a demo of what you're trying to do.) In this case, the secret sauce lies in [this](https://threejs.org/examples/#webgl_interactive_cubes) demonstration, which features cubes that respond to mousemove events. This is exactly what we need! In order to implement it, though, we'll first need to understand a bit about _raycasting_.

#### Raycasting

In general, raycasting is a technique used to create 3D perspectives. If you want to dive down a rabbit hole, [here's](http://lodev.org/cgtutor/raycasting.html) an article on how raycasting is used in Wolfenstein 3D, a game that relied heavily on raycasting.

One application of raycasting is in determining what objects in a generated 3D space are intersected by a cursor. This is how we'll be using raycasting.

Three.js allows us to create objects called `raycasters` which we can then use to capture elements in the scene betweeen the camera and some other object. In this case, we want "some other object" to be a vector based on our mouse coordinates.

Here's how the general pattern will work. First, we need to keep track of our mouse position. Our `GameRenderer` will need to know about the mouse position, so add the following line to your constructor function:

```js
this.mouse = new THREE.Vector2();
```

Next, in your `app.js`, we need to update the coordinates of the mouse whenever you move it over the canvas:

```js
// 'main' refers to the div passed in to the GameRenderer;
// i.e. it's the dom element inside of which Three.js inserts
// the canvas element

// 'game' refers to the object returned from GameRenderer
// when it is called with the 'new' keyword

main.addEventListener('mousemove', function(e) {
  // grab the components of the moust position,
  // and normalize so that x and y are between -1 and 1
  game.mouse.x = e.layerX / e.target.width * 2 - 1;
  game.mouse.y = (e.target.height - e.layerY) / e.target.height * 2 - 1;
});
```

If you throw some `console.log` statements inside of the above callback, you should see the coordinates updating as your mouse moves.

Next, we need to create a `raycaster`. Inside of your `GameRenderer` constructor function, add the following line:

```js
this.raycaster = new THREE.Raycaster();
```

This raycaster object is capabale of casting a ray (get it) between two vectors in our 3D space. And we can update this ray's direction to account for the position fo the mouse. To do this, inside of our `GameRenderer.prototype.render` method, add the following line:

```js
this.raycaster.setFromCamera(this.mouse, this.camera);
// we'll remove this console log statement in a moment
console.log(this.raycaster.ray.origin, this.raycaster.ray.direction);
```

What's going on here? To understand things a bit better, look at what's getting logged in the console. The origin of the `ray` attached to `this.raycaster` should be the position of your camera. But `this.raycaster.ray.direction` is changing based on your mouse's position. In other words, Three.js is taking your 2D mouse position coordinates, and translating appropriately into 3D coordinates for the scene on the canvas. Cool, right?

What's more, once we have this ray, `Three.js` can also calculate any objects that intersect it. Let's remove the `console.log` statement above and replace it with the following:

```js
this.raycaster.setFromCamera(this.mouse, this.camera);
var intersects = this.raycaster.intersectObjects(this.scene.children);
console.log(intersects);
```

Note that the scene has a property on it called `children`, which refers to all objects that are in the scene. This includes all lights, meshes, and so on (basically anything added to the scene using `this.scene.add`). 

#### Managing intersections

Now you should be seeing an array with many objects inside of it whenever you hover over the cube universe. These are all of the cubes that are intersected by the raycaster ray! However, we're not interested in all the cubes that intersect. First, we're only interested in cubes in the pending layer that intersect with our ray. And second, we only want to get one cube, so that we can toggle its status with a mouse click. (Try to implement this on your own; this part is tricky, so we'll show you some code below.)

Once you've found the right value for `intersects`, it's time to determine whether there's an intersection. Here, things can get a bit tricky, because you not only need to check for new intersections, but you also need to check whether or not there's an existing intersection, because you only want to be able to mouse over one cube at a time. This also means you need to store a reference to whatever is currently being intserected; you can do this by setting a property in the `GameRenderer` equal to `intersected`. (It can start out as `null`.)

Before going any further, implement a `Cube.prototype.setHighlight` method. This should be very similar to `setAlive` and `setPending`, but is for highlighting a cube on mousemove.

Once you have that, there are basically things to consider:

1. There's a currently highlighted cube, but in the next frame there's either a new intersection or no intersection. When this happens, you need to un-highlight the current intersection.
2. There's a newly intersected cube. In this case, you assign it to `game.intersected` and highlight it.
3. There's no intersection in the next frame. In this case, `game.intersected` should be set to `null`.

That's a fair amount of complexity to keep track of. If you have trouble implementing it, here's what we ended up adding to our `GameRenderer.prototype.render` method:

```js
// find a potential new intersection
this.raycaster.setFromCamera(this.mouse, this.camera);
var layerCubes = this.scene.children.filter(function(child) {
    var isCube = child.constructor === Cube;
    var inPendingLayer = child.position.y === universe.pendingLayer;
    return isCube && inPendingLayer;
});
var intersects = this.raycaster.intersectObjects(layerCubes);

// check if there's a new intersection
var newIntersection = intersects.length > 0 && 
    this.intersected !== intersects[0].object;

// check if there's no intersection
var noIntersection = intersects.length === 0;

// if necessary, unhighlight the previous intersected
if ((newIntersection || noIntersection) && this.intersected) {
    this.intersected.setHighlight(false);
}

// if necessary, update highlight to new intersection
if (newIntersection) {
    this.intersected = intersects[0].object;
    this.intersected.setHighlight();
}

// if necessary, reset this.intersected
if (noIntersection) {
    this.intersected = null;
}
```

#### Handling Clicks

We're able to handle mousemove events, but we can't actually click on cubes yet to toggle their life status! Fortunately, handling the click is much more straightforward than handling the mousemove. Try to implement it on your own!

### Updating the Interface

Once you get the `click` event handler working for the canvas, you should be able to manually create your own cube universes from the browser! Now is a good time to update the UI as well. Here are some ways you can clean up the presentation:

- Add an option for a user to toggle between game modes: either "random" or "manual."
- If the mode is "random," the user can change the life probability as before. No cubes can be pending in "random" mode. (No need to deal with intersections either!)
- If the mode is "manual", the user can update the pending layer and click on pending cubes to make them alive.
- Once the game is playing, all cubes must be either alive or not; none can be pending.

### Setting Up Examples

One last thing. Because there are so many different sets of rules we can create, and so many different initial states for the universe, finding interesting initial states and sets of rules can be time consuming. This project comes with an `examples.js` file which contains a few different initial states. So one last feature worth implementing is an "Examples" section, where you can choose from one of those examples and watch what happens.

In order for this to work, you'll need to implement a `setManualInitialState` method on `CubeUniverse.prototype` which takes in an array of values for the parameters of the game, and an array of coordinate arrays for cubes that should start out alive, and creates the initial state in Three.js.

### Supplemental Features

Looking for more? Here are some next steps.

- Right now there's no way to go back to your initial manual state once you've started running the evolution. Add a "reset" button in manual mode that will return you to the initial state of the system.
- Add the ability to save particularly interesting initial states using `localStorage!`
- Give the user customization options for how they want their version of the game to look. 

What other features can you think to add?