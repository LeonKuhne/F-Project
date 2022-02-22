from tkinter import *
from os.path import exists
from project import *
from node import Node
from random import randint

class Display(Tk):
    def __init__(self):
        super().__init__()

        self.line_colors = {
            'action': 'blue',
            'property': 'green',
            'exception': 'red',
            'unknown': 'orange',
        }

        # State
        self.reset()

        # Configure the canvas
        self.canvas = Canvas(self, bg="black")
        self.canvas.place(relheight=1, relwidth=1, x=0, y=0)

        # Create a way out
        quit_button = Button(self, text="Quit", command=self.destroy)
        quit_button.place(x=0, y=0)
        
        # Create a way out
        def clean_nodes():
            nodes = self.ui_nodes.keys()
            self.reset()
            self.canvas.delete('all')
            self.toggle_line_type()
            self.load_nodes(nodes)
        clean_button = Button(self, text="Cleanup", command=clean_nodes)
        clean_button.place(x=0, y=60)

        # Toggle line color
        self.color_button = Button(self, text="Line Type", command=self.toggle_line_type)
        self.color_button.place(x=0, y=90)
        self.toggle_line_type()

        # Create/delete nodes
        def on_double_click(e):
            if isinstance(e.widget, Canvas):
                node = Node(f"Node{randint(0, 999)}", e.x, e.y)
                self.add_node(node)
                self.select_node(node)
            elif isinstance(e.widget, Button):
                node = self.get_node(e.widget)
                self.delete_node(node)
        self.bind('<Double-Button-1>', on_double_click)

    def reset(self):
        self.selected_node = None
        self.selected_button = None
        self.line_type = 'unknown'
        self.ui_nodes = {}
        self.paths = {}

    def save_to_file(self, project_path):
        on_click = lambda: save_nodes(list(self.ui_nodes.keys()), project_path)
        save_button = Button(self, text="Save", command=on_click)
        save_button.place(x=0, y=30)

    def toggle_line_type(self):
        types = list(self.line_colors.keys())
        type_idx = types.index(self.line_type)
        next_idx = (type_idx + 1) % len(types)
        self.line_type = types[next_idx]
        self.color_button.configure(bg=self.line_colors[self.line_type])

    def delete_node(self, node):
        # Remove connected lines for children and parents
        for path_type, children in node.children.items():
            for child in children:
                self.remove_path(node, child, path_type)
        for path_type, parents in node.parents.items():
            for parent in parents:
                self.remove_path(parent, node, path_type)

        # Remove it from the GUI
        button = self.ui_nodes[node]
        button.destroy()
        del self.ui_nodes[node]
        if self.selected_node == node:
            self.selected_node = None
    
        print("deleted node")

    def add_node(self, node):
        # Button for the GUI
        self.draw_node(node)

        # A line for new children
        if self.selected_node:
            self.toggle_path(self.selected_node, node)

        print("added node")

    def load_nodes(self, nodes):
        # Button for the GUI
        for node in nodes:
            self.draw_node(node)

        # Lines for existing children
        for node in nodes:
            for child_type, children in node.children.items():
                color = self.line_colors[child_type]
                for child in children:
                    self.draw_path(node, child, child_type)

    def draw_node(self, node):
        node_button = Button(self, text=node.name)
        self.ui_nodes[node] = node_button
        node_button.place(x=node.x, y=node.y)
        node_button.configure(command=lambda: self.select_node(node))

    def draw_path(self, parent, child, child_type):
        (c_width, c_height) = self.node_size(child)
        (p_width, p_height) = self.node_size(parent)
        print(f"{parent.name} -> {child.name}: {child_type}")

        color = self.line_colors[child_type]
        (dest_x, dest_y) = self.corner_pos(parent, child)
        line = self.canvas.create_line(
            parent.x + p_width/2, parent.y + p_height/2,
            dest_x + c_width/2, dest_y + c_height/2,
            arrow='last', fill=color, width=5)

        # keep track of the lines for deleting
        key = (parent, child, child_type)
        self.paths[key] = line

    def node_size(self, node):
        button = self.ui_nodes[node]
        return (button.winfo_width(), button.winfo_height())

    def corner_pos(self, parent, child):
        (c_width, c_height) = self.node_size(child)
        (p_width, p_height) = self.node_size(parent)

        if parent.y - p_height > child.y + c_height:
            y = child.y + c_height/2
        elif parent.y + p_height > child.y - c_height:
            y = child.y 
        else:
            y = child.y - c_height/2
        if parent.x - p_width > child.x + c_width:
            x = child.x + c_width/2
        elif parent.x + p_width > child.x - c_width:
            x = child.x 
        else:
            x = child.x - c_width/2
        return (x, y)
    
    def add_path(self, parent, child, line_type):
        parent.add_child(self.line_type, child)
        self.draw_path(parent, child, line_type)

    def remove_path(self, parent, child, line_type):
        key = (parent, child, line_type)
        parent.remove_child(line_type, child)
        self.canvas.delete(self.paths[key])
        del self.paths[key]

    def toggle_path(self, parent, child):
        if parent.has_child(self.line_type, child):
            self.remove_path(parent, child, self.line_type)
        else:
            self.add_path(parent, child, self.line_type)

    def get_node(self, node_button):
        for node, button in self.ui_nodes.items():
            if node_button == button:
                return node

    def select_node(self, node):
        button = self.ui_nodes[node]

        if self.selected_node == node:
            self.selected_node = None
            button.config(relief='raised')
            button.configure(bg='white')
            print(f"deselected {node.name}")
        else:
            # connect prev selected node to newly selected node
            if self.selected_node:
                self.toggle_path(self.selected_node, node)
                self.selected_button.config(relief='raised')
                self.selected_button.configure(bg='white')

            self.selected_node = node
            self.selected_button = button
            button.config(relief='sunken')
            button.configure(bg='grey')
            print(f"selected {node.name}")

if __name__ == '__main__':
    project_path = 'project.f'
    nodes = load_nodes(project_path) if exists(project_path) else []

    win = Display()
    win.load_nodes(nodes)
    win.save_to_file(project_path)
    win.mainloop()
