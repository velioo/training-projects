/*
ID: espr1t
LANG: C++
TASK: Speed
KEYWORDS: Testgen/Solver
*/

#include <cstdio>
#include <cassert>
#include <ctime>
#include <vector>
#include <algorithm>

using namespace std;
FILE* in; FILE* out;

const int MAX_N = 1004;
const int MAX_M = 10004;
const int MIN_PRICE = 1;
const int MAX_PRICE = 30000;

struct Edge {
    int node1, node2, price;
    Edge(int node1_ = 0, int node2_ = 0, int price_ = -1) :
        node1(node1_), node2(node2_), price(price_) {}
    bool operator < (const Edge& r) const {
        return price != r.price ? price < r.price :
            node1 != r.node1 ? node1 < r.node1 : node2 < r.node2;
    }
};

struct Test {
    int n, m;
    vector <Edge> edges;
};
vector <Test> tests;

int parent[MAX_N];
int getComp(int node) {
    if (parent[node] == node)
        return node;
    return parent[node] = getComp(parent[node]);
}

void eval1(const Test& test, int& lower, int& upper) {
    int n = test.n;
    int m = test.m;
    vector <Edge> a = test.edges;
    
    lower = MIN_PRICE, upper = MAX_PRICE;

    sort(a.begin(), a.end());
    for (int i = 0; i < m; i++) {
        int numComps = n;
        for (int c = 1; c <= n; c++)
            parent[c] = c;
        for (int c = i; c < m; c++) {
            int comp1 = getComp(a[c].node1);
            int comp2 = getComp(a[c].node2);
            if (comp1 != comp2) {
                parent[comp1] = comp2;
                if (--numComps == 1) {
                    if (a[c].price - a[i].price < upper - lower)
                        lower = a[i].price, upper = a[c].price;
                    break;
                }
            }
        }
        if (numComps > 1)
            break;
    }
}


bool vis[MAX_N];
vector < pair <int, int> > v[MAX_N];

int recurse(int node, int lower, int upper) {
    int ans = 1;
    vis[node] = true;
    for (int i = 0; i < (int)v[node].size(); i++) {
        if (!vis[v[node][i].first] &&
            v[node][i].second >= lower && v[node][i].second <= upper)
            ans += recurse(v[node][i].first, lower, upper);
    }
    return ans;
}

void eval2(const Test& test, int& lower, int& upper) {
    int n = test.n;
    int m = test.m;
    vector <Edge> a = test.edges;
    
    for (int i = 1; i <= n; i++)
        v[i].clear();
    for (int i = 0; i < (int)a.size(); i++) {
        v[a[i].node1].push_back(make_pair(a[i].node2, a[i].price));
        v[a[i].node2].push_back(make_pair(a[i].node1, a[i].price));
    }
    
    lower = MIN_PRICE, upper = MAX_PRICE;
    for (int i = 0; i < m; i++) {
        int left = a[i].price, right = MAX_PRICE;
        while (left <= right) {
            int mid = (left + right) / 2;
            for (int c = 1; c <= n; c++)
                vis[c] = false;
            if (recurse(1, a[i].price, mid) == n) {
                if (mid - a[i].price < upper - lower ||
                    (mid - a[i].price == upper - lower && a[i].price < lower))
                    lower = a[i].price, upper = mid;
                right = mid - 1;
            }
            else left = mid + 1;
        }
    }

}

void solve(Test test, int testNum, int& lower, int& upper) {
    fprintf(stderr, "Solving testcase %d...\n", testNum);
    lower = -1, upper = -1;

    unsigned sTime1 = clock();
    int lower1, upper1;
    eval1(test, lower1, upper1);
    unsigned eTime1 = clock();
    fprintf(stderr, "  -- execution time of solution 1: %.3lfs\n",
        (double)(eTime1 - sTime1) / CLOCKS_PER_SEC);

    unsigned sTime2 = clock();
    int lower2, upper2;
    eval2(test, lower2, upper2);
    unsigned eTime2 = clock();
    fprintf(stderr, "  -- execution time of solution 2: %.3lfs\n",
        (double)(eTime2 - sTime2) / CLOCKS_PER_SEC);
    
    if (lower1 != lower2 || upper1 != upper2) {
        fprintf(stderr, "  -- solutions differ (%d, %d) vs (%d, %d)!\n",
            lower1, upper1, lower2, upper2);
        system("pause");
    }
    else {
        lower = lower1, upper = upper1;
        fprintf(stderr, "  -- answer is (%d, %d)\n", lower, upper);
    }
}

void sampleInput() {
    Test test;
    test.n = 7;
    test.m = 10;
    test.edges.push_back(Edge(1, 3, 2));
    test.edges.push_back(Edge(4, 2, 8));
    test.edges.push_back(Edge(1, 2, 11));
    test.edges.push_back(Edge(1, 4, 3));
    test.edges.push_back(Edge(1, 3, 6));
    test.edges.push_back(Edge(5, 3, 5));
    test.edges.push_back(Edge(3, 6, 9));
    test.edges.push_back(Edge(7, 6, 6));
    test.edges.push_back(Edge(5, 6, 3));
    test.edges.push_back(Edge(2, 5, 7));
    tests.push_back(test);
}

void randomTest(int n, int m) {
    Test test;
    test.n = n;
    test.m = m;
    for (int i = 2; i <= n; i++) {
        Edge edge;
        edge.node1 = i;
        edge.node2 = rand() % (i - 1) + 1;
        edge.price = rand() % MAX_PRICE + 1;
    }
    for (int i = 0; i < m; i++) {
        Edge edge;
        edge.node1 = rand() % n + 1;
        edge.node2 = rand() % n + 1;
        while (edge.node1 == edge.node2)
            edge.node2 = rand() % n + 1;
        edge.price = rand() % MAX_PRICE + 1;
        test.edges.push_back(edge);
    }
    tests.push_back(test);
}

bool isConnected(Test test) {
    vector <int> q;
    vector <bool> used(test.n, false);
    q.push_back(1); used[1] = true;
    for (int i = 0; i < (int)q.size(); i++) {
        int node = q[i];
        for (int c = 0; c < (int)test.edges.size(); c++) {
            if (test.edges[c].node1 == node) {
                if (!used[test.edges[c].node2]) {
                    used[test.edges[c].node2] = true;
                    q.push_back(test.edges[c].node2);
                }
            }
            if (test.edges[c].node2 == node) {
                if (!used[test.edges[c].node1]) {
                    used[test.edges[c].node1] = true;
                    q.push_back(test.edges[c].node1);
                }
            }
        }
    }
    for (int i = 1; i <= test.n; i++)
        if (!used[i]) return false;
    return true;
}

void printTests() {
    // Sanity check
    for (int i = 0; i < (int)tests.size(); i++) {
        assert(isConnected(tests[i]));
        assert(tests[i].n >= 2 && tests[i].n <= 1000);
        assert(tests[i].m >= 1 && tests[i].m <= 10000);
        assert(tests[i].m == (int)tests[i].edges.size());
        for (int c = 0; c < (int)tests[i].edges.size(); c++) {
            assert(tests[i].edges[c].node1 >= 1 && tests[i].edges[c].node1 <= tests[i].n);
            assert(tests[i].edges[c].node2 >= 1 && tests[i].edges[c].node2 <= tests[i].n);
            assert(tests[i].edges[c].node1 != tests[i].edges[c].node2);
            assert(tests[i].edges[c].price >= MIN_PRICE);
            assert(tests[i].edges[c].price <= MAX_PRICE);
        }
    }
    
    for (int test = 0; test < (int)tests.size(); test++) {
        char inpFile[32], solFile[32];
        sprintf(inpFile, "Speed.%02d.in", test);
        FILE* inp = fopen(inpFile, "wt");
        fprintf(inp, "%d %d\n", tests[test].n, tests[test].m);
        for (int i = 0; i < (int)tests[test].edges.size(); i++) {
            fprintf(inp, "%d %d %d\n", tests[test].edges[i].node1,
                tests[test].edges[i].node2, tests[test].edges[i].price);
        }
        fclose(inp);
        
        sprintf(solFile, "Speed.%02d.sol", test);
        FILE* sol = fopen(solFile, "wt");
        int lower, upper;
        solve(tests[test], test, lower, upper);
        fprintf(sol, "%d %d\n", lower, upper);
        fclose(sol);
    }
}

int main(void) {
    
    sampleInput();
    randomTest(5, 22);
    randomTest(10, 30);
    randomTest(20, 100);
    randomTest(50, 500);
    randomTest(50, 1000);
    randomTest(70, 500);
    randomTest(80, 800);
    randomTest(80, 1000);
    randomTest(100, 1000);
    randomTest(100, 1000);
    randomTest(200, 4000);
    randomTest(300, 1000);
    randomTest(500, 2000);
    randomTest(500, 5000);
    randomTest(500, 10000);
    randomTest(700, 5000);
    randomTest(800, 5000);
    randomTest(800, 10000);
    randomTest(1000, 10000);
    randomTest(1000, 10000);

    printTests();
    
    return 0;
}
