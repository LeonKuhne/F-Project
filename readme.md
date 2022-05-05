# f | v0.1
a project to end all projects
f u, f me, f every `body`

"oh shit" - me


### Usable | v1.0
#### MISSION STATEMENT
0. Take an idea
1. Visually break it down
2. Logically define parts

#### SAMPLE PROCESS
0. Take an idea, or part that isn't \*codable or completed
1. Break it down into (3-7) \*logical parts, collapsed as a group
2. Repeat steps 0-2 until all immediate parts are sufficently small
3. Code the parts until the parts' group works as expected
4. Collapse the parts' group
5. Repeate steps 0-5 until everything is collapsed
\* logical part: identified with practice (eg. low coupling, high cohesion)
\* codable: pure js code that takes an input and provides an output 

## Todo
### PROJECT
- feature: export to '.f' project file
- feature: import from '.f' project file
### NODE
- fix: (might already be fixed) currently applying a group to a node doesn't change the root node
### GENERAL
- fix: (might already be fixed) saving a group containing a node with joining parents duplicates that node
- fix: buttons don't always click when clicked on, due to the gap, fix this to reduce missed clicks
### CODE
- fix: (might already be fixed) adding result to the nodes data prevents it from being returnable (circular dependancy). suggestion: add a .clone function to nodes data that deepcopies without result (and other filtered out things)


### Manual

#### Q/A
- Can you have a bunch o nodes share the same data?
> yes, by using a second parameter passes in the shared data 
- Can you have a node that has optional destinations?
> you can only have "optional destinations" in collapsed node groups

#### Managing Nodes
- Double click to create node
- Drag to move node
- Drag from one node to another to connect nodes
- Click on a node to view the node editor
- Click on a module to either apply it to the selected node, use it as a base when creating new nodes 

#### Project
- Click 'import' to load modules from an existing javascript file/project
- Click 'export' to save the current project as a javascript file

#### Node Editor
- Click 'run' to execute the currently selected node as the root node 
- Click 'save' to save the currently selected node in local storage
- Click 'collapse'/'expand' to toggle the visibility of a group of nodes children, if no group exists its ends are the leaves

#### Parsing Classes
- class references to 'this' are replaced with an class object instance
- constructors create an object instance, update its attributes, and return the instance
- class functions take in the class object as the second parameter


# Project Parser | v2.0
this could be used when you want to...
...have a prototype improve performance
...start a new project from a previous one
...use functionality from another project
...use other peoples code without their permission

#### MISSION STATEMENT
0. Take an object oriented project
1. Change it to functional
2. Optimize for cuncurrency


## Todo
### NODE
- extra: z axis; indicate depth by adding effects to nodes, let nodes be moved through z axes using keybind or button, also indicate the depth
- extra: pan node view
- extra: scroll to zoom
- extra: offscreen node indicator (dot on edge)
### EDITOR
- extra: make the node & module editors togglable by clicking on the header
### CODE
- extra: code auto test field
- extra: code compile check & indicator
- extra: allow the spread operator for input params
### RUN
- extra: optimize running nodes in parallel
### CSS
- extra: fix group node element colors during interaction
### PROJECT
- extra: import modules from js file
- extra: (started) import project as nodes from js file
- extra: export project or run path javascript file
- extra: parse js loops into nodes that yield using generators


## Architecture
Arranged by levels of abstraction:
> view > ctrl > core
### VIEW
- builds 'state'
- html elements 'graphics' logic
### CTRL
- modifies 'state'
- high level 'business' logic
### CORE
- no 'state'
- low level 'procedural' logic

### Why not use MVC?
I am. "Standards" are meant to be tested. Frameworks expect deviation; framework "features" is an oxymoron. F limiting myself to the [three tier architecture specs](https://www.ibm.com/cloud/learn/three-tier-architecture).

