import pickle

# Load a project
def load_nodes(project_file):
    nodes = []
    with open(project_file, 'rb') as f:
        nodes = pickle.load(f)
    return nodes

def save_nodes(nodes, project_file):
    with open(project_file, 'wb') as f:
        print('saving', nodes, 'as', project_file)
        pickle.dump(nodes, f)

