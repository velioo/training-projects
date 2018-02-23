import sys

class Edge:
    def __init__(self, *args):
        self.node_a = int(args[0])
        self.node_b = int(args[1])
        self.price = int(args[2])

    def __lt__(self, other): # less than
        return self.price < other.price if self.price is not other.price else \
            self.node_a < other.node_a if self.node_a is not other.node_a else \
                self.node_b < other.node_b

    def __str__(self):
        return str(self.node_a) + " " + str(self.node_b) + " " + str(self.price)

    def __repr__(self):
        return str(self)
		

minimal_tree = []	
		
def linked(gone_through, a, b):
	#if (len(gone_through) == len(minimal_tree)):
	#	return False
	
	for e in minimal_tree:
		if (e in gone_through):
			continue
		if (a == e.node_a):
			if (b == e.node_b):
				return True
			gone_through.append(e)
			if (linked(gone_through, e.node_b, b)):
				return True
		if (a == e.node_b):
			if (b == e.node_a):
				return True
			gone_through.append(e)
			if (linked(gone_through, e.node_a, b)):
				return True

	return False	


def connected(edge):
	a = edge.node_a
	b = edge.node_b
	if(not minimal_tree):
		return False
	
	a_exists = False
	b_exists = False
	for e in minimal_tree:
		if (a == e.node_a):
			if (b == e.node_b):
				return True
			if (linked([e], e.node_b, b)):
				return True
		elif (a == e.node_b):
			if (b == e.node_a):
				return True
			if (linked([e], e.node_a, b)):
				return True
		if(b == e.node_a):
			if (a == e.node_b):
				return True
			if (linked([e], e.node_b, a)):
				return True
		elif (b == e.node_b):
			if (a == e.node_a):
				return True
			if (linked([e], e.node_a, a)):
				return True
		
	return False;
	
		
def main():
	edges = []
	file = sys.argv[1]
	count = 0
	with (open(file, 'r')) as f:
		for line in f:
			if count:
				edges.append(Edge(*line.strip('\n').split(' ')))
			else:
				n, m = line.split(' ')
				count+=1
				
	edges.sort()
	
	for edge in edges:
		if(not connected(edge)):
			minimal_tree.append(edge);
	
	print(minimal_tree)
		
if __name__ == "__main__":
	main()