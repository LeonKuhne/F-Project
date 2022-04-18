# f
a project to end all projects
f u, f me, f every body

#### v0.1
"oh shit" - me


## Todo v1.0
### PROJECT
- feature: parse from javascript file
- feature: export to javascript file
### NODEL
- fix: currently applying a group to a node doesn't change the root node
### GENERAL
- fix: saving a group containing a node with joining parents duplicates that node
### EDITOR
- fix: scrolling down in a full textarea should work properly


## Todo v2.0
### GENERAL
- extra: what if you made the node & module editors togglable by clicking on the header
### EDITOR
- extra: code auto test field
- extra: code compile check & indicator
- extra: pan node view
- extra: scroll to zoom
- extra: offscreen node indicator (dot on edge)
### RUN
- extra: optimize running nodes in parallel
### CSS
- extra: fix group node element colors during interaction


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

