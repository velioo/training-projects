import sys
#~ MAX_N = 1004
#~ MAX_M = 10004
#~ MAX_P = 30000
#~ parent = []


class Edge:
    def __init__(self, *args):
        self.node_a = int(args[0])
        self.node_b = int(args[1])
        self.price = int(args[2])

    def __lt__(self, other):
        return self.price < other.price if self.price is not other.price else \
            self.node_a < other.node_a if self.node_a is not other.node_a else \
                self.node_b < other.node_b

    def __str__(self):
        return str(self.node_a) + " " + str(self.node_b) + " " + str(self.price)

    def __repr__(self):
        return str(self)


#~ def get_comp(node):
    #~ if parent[node] == node:
        #~ return node
    #~ parent[node] = get_comp(parent[node])
    #~ return parent[node]


# def evaluate(n, m):
#     lower, upper = 1, MAX_P
#     for i in range(m):
#         num_comps = n
#         parent.clear()
#         parent.insert(0, None)
#         for c in range(1, n + 1):
#             parent.insert(c, c)
#         for c in range(i, m):
#             comp1 = get_comp(edges[c].node_a)
#             comp2 = get_comp(edges[c].node_b)
#             if comp1 is not comp2:
#                 parent[comp1] = comp2
#                 num_comps -= 1
#                 if num_comps == 1:
#                     if edges[c].price - edges[i].price < upper - lower:
#                         lower, upper = edges[i].price, edges[c].price
#                     break
#         if num_comps > 1:
#             break
#     print(lower, upper)

edges = []
conns = []
global_key = 0
nodes = dict()
n, m = 0, 0


def check(key, values):
    global conns
    global nodes
    for i in values:
        if i not in conns:
            conns.append(i)
            check(i, nodes[i])

    if key is global_key:
        if len(conns) is n:
            return True
        else:
            return False


def drive(min_s, max_s):
    global conns
    global global_key
    global nodes
    global m, n
    #print("Min Max: ", min_s, max_s)
    nodes = dict()
    count = 0
    for edge in edges:
        if min_s <= edge.price <= max_s:
            count += 1
            if edge.node_a not in nodes:
                nodes[edge.node_a] = [edge.node_b]
            elif edge.node_b not in nodes[edge.node_a]:
                nodes[edge.node_a].append(edge.node_b)

            if edge.node_b not in nodes:
                nodes[edge.node_b] = [edge.node_a]
            elif edge.node_a not in nodes[edge.node_b]:
                nodes[edge.node_b].append(edge.node_a)

    if count < n - 1:
        return False

    #print("Nodes: ", nodes)
    result = []
    for key, values in nodes.items():
        conns.append(key)
        global_key = key
        node = check(key, values)
        if node:
            result.append(key)
        conns.clear()

    if len(result) < n:
        return False
    else:
        return True


def main():

    global m, n
    count = 0
    file = sys.argv[1]
    with (open(file, 'r')) as f:
        for line in f:
            if count is not 0:
                edges.append(Edge(*line.strip('\n').split(' ')))
            else:
                n, m = line.split(' ')
            count += 1

    edges.sort()
    #print(edges)

    m, n = int(m), int(n)
    minimum = 1
    maximum = 30000

    for i in range(int(m - 1)):
        for k in range(i + 1, m):
            #print(i, " -- ", k - i, " -- ", edges[i], " : ", edges[k])
            can_drive = drive(edges[i].price, edges[k].price)
            if can_drive:
                if edges[k].price - edges[i].price < maximum - minimum:
                    minimum, maximum = edges[i].price, edges[k].price

        #print('________________')

    print(minimum, maximum)

    # evaluate(int(n), int(m))


if __name__ == "__main__":
        main()
