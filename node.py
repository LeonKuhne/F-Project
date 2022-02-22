class Node():
    def __init__(self, name, x, y):
        self.name = name
        self.x = x
        self.y = y
        self.children = {
            'action': [],
            'property': [],
            'exception': [],
            'unknown': [],
        }
        self.parents = {
            'action': [],
            'property': [],
            'exception': [],
            'unknown': [],
        }

    def has_child(self, child_type, child):
        return child in self.children[child_type]

    def remove_child(self, child_type, *children):
        for child in children:
            self.children[child_type].remove(child)
            child.parents[child_type].remove(self)

    def add_child(self, child_type, *children):
        self.children[child_type] += children
        for child in children:
            child.parents[child_type].append(self)

    def __str__(self):
        children = f"{[(type, arr) for type, arr in self.children.items()]}"
        return f"[{self.name}: {children}]"

