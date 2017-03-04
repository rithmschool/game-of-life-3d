# 3D Game of Life

## Introduction

In this tutorial, we'll use [three.js](threejs.org) to build a 3D version of John Conway's [Game of Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life). In the Game of Life, the population of cubes evolves over time. In each generation, whether a cube lives or dies depends on its neighbors.

More specifically, choose four numbers _a_, _b_, _c_, and _d_. Here's the breakdown:

1. If a living cube has between _a_ and _b_ neighbors, it stays alive to the next generation. Otherwise it dies (by over- or underpopulation.)
2. If an empty cell has between _c_ and _d_ neighbors, it becomes alive in the next generation (by reproduction).

Because these four parameters determine the rules of the game, for fixed _a_, _b_, _c_, and _d_, we say that you are playing Life version _a_,_b_,_c_,_d_. In the 3D version of the game, each cube can have at least 0 neighbors, and at most 26. You can demo a live version [here](https://rithmschool.github.io/game-of-life-3d/).

## Table of Contents

### Part 1: Overview

1. [Introduction to Three.js](#introduction-to-threejs)

### Part 2: A Randomly Generated Initial Board

1. [Application Structure: `GameRenderer`](#application-structure-gamerenderer)
2. [Application Structure: `Cube`](#application-structure-cube)
3. [Application Structure: `CubeUniverse`](#application-structure-cubeuniverse)
4. [Animating the Evolution](#animating-the-evolution)

### Part 3: A Customizable Initial Board

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

You should also implement a `setAlive` method on the prototype, which accepts a boolean. If the boolean is `true`, the cube should be set to alive; otherwise, it should not. Calling `setAlive` with no arguments should be the same as calling it with an argument of `true`.

Once this is implemented, try creating a cube and adding it to the scene.

### Application Structure: `CubeUniverse`

The `CubeUniverse` constructor is where we will manage most of the complexity of the game logic. To begin, the constructor function should take a parameter called `len`, which corresponds to the length of one side of the universe. For example, if we pass in the number 3, this constructor should construct a universe of 27 cubes in a 3 &times; 3 &times; 3 grid. It should also accept the parameters that determine whether or not a cube that is alive in one generation stays alive to the next, and whether a cube that is dead in one generation can become alive in the next. These are the four parameters _a_, _b_, _c_, and _d_ mentioned in the introduction. For convenience, you may want to store _a_ and _b_ in an array called `keepAlive`, and _c_ and _d_ in an array called `makeAlive`

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