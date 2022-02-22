from tkinter import *
from os.path import exists
from project import *
from node import Node
from random import randint

class Display(Tk):
    def __init__(self):
        super().__init__()

        self.selected_node = None
        self.nodes = []
        self.line_type = 'action'
        self.line_colors = {
            'action': 'blue',
            'property': 'green',
            'exception': 'red',
            'unknown': 'orange',
        }

        # Configure the canvas
        self.canvas = Canvas(self, bg="black")
        self.canvas.place(relheight=1, relwidth=1, x=0, y=0)

        # Create a way out
        quit_button = Button(self, text="Quit", command=self.destroy)
        quit_button.place(x=0, y=0)
        
        # Toggle line color
        color_button = Button(self, text="Line Type", command=self.toggle_line_type)
        color_button.place(x=0, y=60)

        # Add some dynamics
        def on_double_click(e):
            if e.widget == self.canvas:
                self.add_node(Node(f"Node{randint(0, 999)}", e.x, e.y))

        self.bind('<Double-Button-1>', on_double_click)

    def save_to_file(self, project_path):
        on_click = lambda: save_nodes(self.nodes, project_path)
        save_button = Button(self, text="Save", command=on_click)
        save_button.place(x=0, y=30)

    def toggle_line_type(self):
        self.line_type = ('action' if self.line_type == 'property' else 'property')

    def add_node(self, *nodes):
        print('adding node', nodes)

        for node_idx in range(len(nodes)):
            node = nodes[node_idx]
            #print(node)

            # add it to the display
            on_click = lambda: self.select_node(node)
            node_button = Button(self, text=node.name, command=on_click)
            node_button.place(x=node.x, y=node.y)

            # Add lines for actions
            for child in node.actions:
                self.canvas.create_line(
                    node.x, node.y, child.x, child.y,
                    arrow='last', fill="blue", width=5)

            # Add lines for data properties
            for child in node.properties:
                self.canvas.create_line(
                    node.x, node.y, child.x, child.y,
                    arrow='last', fill="green", width=5)

            # Add line for a new children
            if self.selected_node:
                self.connect_nodes(self.selected_node, node)

        self.nodes += nodes

    def connect_nodes(self, parent, child):
        if self.line_type == 'action':
            parent.add_action(child)
        elif self.line_type == 'property':
            parent.add_property(child)
        elif self.line_type == 'exception':
            parent.add_exception(child)

        color = self.line_colors[self.line_type]
        self.canvas.create_line(
            parent.x, parent.y,
            child.x, child.y, 
            arrow='last', fill=color, width=5)

    def select_node(self, node):
        if self.selected_node == node:
            self.selected_node = None
            print(f"deselected {node.name}")
        else:
            # connect the previously selected node to the newly selected one
            if self.selected_node:
                self.connect_nodes(self.selected_node, node)
                print(f"connected {self.selected_node.name} and {node.name}")

            self.selected_node = node
            print(f"selected {node.name}")

if __name__ == '__main__':
    project_path = 'project.f'
    nodes = load_nodes(project_path) if exists(project_path) else []
    
    win = Display()
    win.add_node(*nodes)
    win.save_to_file(project_path)
    win.mainloop()
