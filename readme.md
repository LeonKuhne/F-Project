### Visual Scripting IDE Website with Codable Components and Groups

# f v0.9
> [live](https://f.leonk.dev)

## Features
- write bit-sized component code
- visually connect components
- start anywhere
- group components
- view component logs
- cache results
- save componets
- save projects
- parse js into components
- [WIP] parse js project 
- [WIP] share components

## Manual
### Rules
- Returning `undefined` stops a node from propogating
- Params can define guards, eg (cat:"jerry", dog:!null) => {}
- Functions run async with real-time visual playback
### Q/A
- Can you have a bunch of nodes share the same data?
> yes, by using an aditional parameter passes in the shared data 
- Can you have a node that has optional destinations?
> yes, using guards
### Managing Nodes
- Double click to create node
- Drag to move node
- Drag from one node to another to connect nodes
- Click on a node to view the node editor
- Click on a module to either apply it to the selected node, use it as a base when creating new nodes 
### Project
- Click 'import' to load modules from an existing javascript file/project
- Click 'export' to save the current project as a javascript file
### Node Editor
- Click 'run' to execute the currently selected node as the root node 
- Click 'save' to save the currently selected node in local storage
- Click 'collapse'/'expand' to toggle the visibility of a group of nodes children, if no group exists its ends are the leaves
### Parsing Classes
- class references to 'this' are replaced with an class object instance
- constructors create an object instance, update its attributes, and return the instance
- class functions take in the class object as the second parameter

## Influence
### F is for Fortran
Caches like the old .f version of Fortran with unique memory access.
### Data Processing
Flows like LISP, LINQ, and RXJS.
### Visual Scripting
Patching like Patcher in FL and Unity.
### Usability Heuristics
Usable like...
- Visibility of system status - see how it runs
- Match between system and the real world - a state diagram
- User control and freedom - arrange parts how you want
- Error prevention - test only parts of the code
- Consistency and standards - share existing function
- Recognition over recall - Recognize flow patterns
- Flexibility and efficiency of use - reusable groups
- Error handling - indicate and explore failed state
- Help and documentation - add notes to nodes


# Documentation

## Architecture
Arranged by levels of abstraction:
> view > ctrl > core
- Add features an needed by projects
- Parse this project with itself then visually clean it up; recursion is key
### VIEW
- builds 'state'
- html elements 'graphics' logic
### CTRL
- modifies 'state'
- high level 'business' logic
### CORE
- no 'state'
- low level 'procedural' logic

## Contributing
1. Test
2. Refactor
3. Fix (straightforward)
4. Features (straightforward)
5. Plan Refactorings: make fixes/features straightforward

## Usable | v1.0
### MISSION STATEMENT
0. Take an idea
1. Visually break it down
2. Logically define parts
3. Develop it as a proof of concept

### SAMPLE PROCESS
0. Take an idea, or part that isn't \*codable or completed
1. Break it down into (3-7) \*logical parts, collapsed as a group
2. Repeat steps 0-2 until all immediate parts are sufficently small
3. Code the parts until the parts' group works as expected
4. Collapse the parts' group
5. Repeate steps 0-5 until everything is collapsed
\* logical part: identified with practice (eg. low coupling, high cohesion)
\* codable: pure js code that takes an input and provides an output 

### Todo
#### NODE
- add: 'global' nodes that auto-inject via parameter names and hide connections
#### CODE
- support: callbacks ie implement a sleep node with setTimeout
#### CLEANUP
- fix: currently applying a group to a node doesn't change the root node
- fix: ALL children of a group till the ends should update when a group saves
- fix: tab should indent at current index, not at end of file
- fix: deleting a group deletes everything
- fix: allow circular nodes in group
- fix: clean up other todo's if practical


## UI Enhancements | v2.0
### MISSION STATEMENT
0. Take something that works
1. Make the interface practical
2. Make the experience lovable

### Todo
#### EDITOR
- extra: make the node & module editors togglable by clicking on the header
#### CSS
- extra: fix group node element colors during interaction
- extra: buttons don't always click when clicked on due to a gap; reduce missed clicks
- extra: indicate head nodes with unique color
- extra: indicate leaf nodes with a unique color
#### NODE
- extra: z axis depth; indicate depth using opacity and z-index on group nodes children, stacking on groups of groups. Have the z index change to that of the nodes selection
#### CODE
- extra: code auto test field
- extra: code compile check & indicator
- extra: add a 'run' button near the project that runs ALL of the head nodes, replacing the need for connecting an init/trigger node to every single gosh darn node


## Project Parser | v3.0
this could be used when you want to...
...have a prototype improve performance
...start a new project from a previous one
...use functionality from another project
...use other peoples code without their permission
### MISSION STATEMENT
0. Take this object oriented project
1. Change it to functional
2. Visually explain project logic
2. Manually optimize for cuncurrency
### Todo
#### RUN
- extra: optimize running nodes in parallel
#### PROJECT
- extra: (started) import modules from js file
- extra: import project as nodes from js file
- - parse js loops into nodes that yield using generators
- extra: export project or run path javascript file


## Maybe Never | v4.0
### Todo
#### NODE
- extra: pan node view
- extra: scroll to zoom
- extra: offscreen node indicator (dot on edge)
#### CODE
- extra: allow the spread operator for input params
- extra: properly sanitize code before running to prevent XSS
