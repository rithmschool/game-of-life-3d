# 3D Game of Life

## Introduction

In this tutorial, we'll use [three.js](threejs.org) to build a 3D version of John Conway's [Game of Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life). In the Game of Life, the population of cubes evolves over time. In each generation, whether a cube lives or dies depends on its neighbors.

More specifically, choose four numbers _a_, _b_, _c_, and _d_. Here's the breakdown:

1. If a cube has between _a_ and _b_ neighbors, it stays alive to the next generation. Otherwise it dies (by over- or underpopulation.)
2. If an empty cell has between _c_ and _d_ neighbors, it becomes alive in the next generation (by reproduction).

Because these four parameters determine the rules of the game, for fixed _a_, _b_, _c_, and _d_, we say that you are playing Life version _a_,_b_,_c_,_d_. In the 3D version of the game, each cube can have at least 0 neighbors, and at most 26. You can demo a live version [here](https://rithmschool.github.io/game-of-life-3d/).

## Table of Contents

1. [Introduction to Three.js](#introduction-to-threejs)
2. [Application Structure: `GameRenderer`](#application-structure-gamerenderer)
2. [Application Structure: `Cube`](#application-structure-cube)
2. [Application Structure: `CubeUniverse`](#application-structure-cubeuniverse)

### Introduction to Three.js

Before digging into the application, we need to first understand some of the basics of Three.js. Work through the examples in [these](http://slides.com/mattlane-2/code-into-the-third-dimension#/) slides (the official documentation is helpful too).

### Application Structure: `GameRenderer`

Our application will be built using three constructor functions: `Cube`, `CubeUniverse`, and `GameRenderer`. 

- The `GameRenderer` will be responsible for rendering and updating the scene using Three.js.
- The `Cube` will be responsible for changing its life status
- The `CubeUniverse` will collect all of the cubes, and be responsible for counting neighbors for cubes, determining the next state of the universe, and so on.

Let's begin with our `GameRenderer`. The constructor function should take in a width and a height, and create a camera, scene, a renderer, and whatever lighting you want for your version of the game. You should also implement a prototpe method called `render` that continually rerenders the scene.

### Application Structure: `Cube`

### Application Structure: `CubeUniverse`