/*
 * title: Counting islands with union-find
 * level: 2
 * about: Merges land cells of a map into islands with a disjoint-set forest using path compression and union by size, then reports how many islands there are and how big.
 */
#include <stdio.h>

#define R 7
#define C 12

static const char *map[R] = {
    "##..#....##.",
    "#...##...#..",
    "....#.......",
    ".##.....###.",
    ".##..#..#.#.",
    ".....#..###.",
    "#....#......"
};

/* Every cell is a set. parent[i] points towards the set's representative
   (its root); a root points to itself. size[] is kept only at roots. */
int parent[R * C];
int size[R * C];

/* Find the root, and on the way back make every visited cell point straight
   at it ("path compression"), so the next search is instant. */
int find(int x)
{
    if (parent[x] != x)
        parent[x] = find(parent[x]);
    return parent[x];
}

/* Join two sets by hanging the smaller tree under the larger root. That
   keeps the trees shallow even before compression helps. */
void unite(int a, int b)
{
    int ra = find(a), rb = find(b);
    if (ra == rb)
        return;
    if (size[ra] < size[rb]) {
        int t = ra;
        ra = rb;
        rb = t;
    }
    parent[rb] = ra;
    size[ra] += size[rb];
}

int main(void)
{
    int r, c, i, islands = 0;

    for (i = 0; i < R * C; i++) {
        parent[i] = i;
        size[i] = 1;
    }

    /* Only look right and down: every pair of neighbours is seen once. */
    for (r = 0; r < R; r++)
        for (c = 0; c < C; c++) {
            if (map[r][c] != '#')
                continue;
            if (c + 1 < C && map[r][c + 1] == '#')
                unite(r * C + c, r * C + c + 1);
            if (r + 1 < R && map[r + 1][c] == '#')
                unite(r * C + c, (r + 1) * C + c);
        }

    /* Label each island with a letter chosen by its root. */
    for (r = 0; r < R; r++) {
        for (c = 0; c < C; c++) {
            int id = r * C + c;
            if (map[r][c] != '#')
                putchar('.');
            else
                putchar('A' + find(id) % 26);
        }
        putchar('\n');
    }

    for (i = 0; i < R * C; i++)
        if (map[i / C][i % C] == '#' && find(i) == i) {
            islands++;
            printf("island %c: root cell (%d,%d), %d cell%s\n", 'A' + i % 26, i / C,
                   i % C, size[i], size[i] == 1 ? "" : "s");
        }
    printf("%d islands\n", islands);
    return 0;
}
