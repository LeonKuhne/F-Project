
class Node():
    def __init__(self, name, x, y):
        self.name = name
        self.x = x
        self.y = y
        self.actions = []
        self.properties = []
        self.exceptions = []

    def add_action(self, *actions):
        self.actions += actions

    def add_property(self, *props):
        self.properties += props

    def add_exception(self, *exceptions):
        self.exceptions += exceptions

    def __str__(self):
        actions_str = [str(a) for a in self.actions]
        props_str = [str(p) for p in self.properties]
        return f"[{self.name}: actions-{actions_str}, properties-{props_str}"
