# f
a project to end all projects
f u, f me, f every body

#### v0.0
at some point, you too will hit the "oh shit" moment

## Todo
### NODEL
### EDITOR
- fix: I want to be able to clear out the name-input field completely before I start typing
- feature: delete node button
- extra: code auto test field
- extra: code compile check & indicator
- extra: pan node view
- extra: scroll to zoom
- extra: offscreen node indicator (dot on edge)
### MODULES
- fix: group modules to properly save node names
### PROJECT
- feature: parse from javascript file
- feature: export to javascript file

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

