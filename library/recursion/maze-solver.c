/*
 * title: A maze walk that rubs out dead ends
 * level: 4
 * about: Finds a path through a text maze with depth-first recursive search, marking the route and undoing dead ends.
 */
#include <stdio.h>

#define H 11
#define W 23

/* S is the start, E the exit, # are walls. The search marks the path
   it is trying with '+'; when a branch dies it rubs those marks out
   and leaves 'x' behind so it never wanders into that dead end again. */
char maze[H][W + 1] = {
    "#######################",
    "#S....#.......#.......#",
    "#.###.#.#####.#.#####.#",
    "#...#...#...#...#...#.#",
    "###.#####.#.#####.#.#.#",
    "#...#.....#.....#.#...#",
    "#.###.#########.#.#####",
    "#.#...#.......#.#.....#",
    "#.#.###.#####.#.#####.#",
    "#...#.......#.......#E#",
    "#######################"
};

int steps = 0, path_len = 0;

/* Returns 1 if the exit can be reached from (r, c). The four neighbour
   calls are tried in turn (down, left, up, right); the first one that
   succeeds ends the search, and every frame on the stack at that moment
   is one square of the path. In See, stop on "return 1" for 'E': the
   call stack is the path, one frame per square. */
int solve(int r, int c)
{
    char here = maze[r][c];

    if (here == 'E')
        return 1;
    if (here != '.' && here != 'S')
        return 0;              /* wall, already on the path, or dead end */

    steps++;
    maze[r][c] = '+';          /* tentatively part of the path; marking
                                  the start too stops us walking back in */

    if (solve(r + 1, c) || solve(r, c - 1) || solve(r - 1, c) || solve(r, c + 1)) {
        path_len++;
        return 1;
    }

    maze[r][c] = 'x';          /* backtrack: this square leads nowhere */
    return 0;
}

void show(void)
{
    int r;

    for (r = 0; r < H; r++)
        printf("  %s\n", maze[r]);
}

int main(void)
{
    show();
    if (solve(1, 1)) {
        maze[1][1] = 'S';      /* put the start letter back for the picture */
        printf("\nescaped: path of %d squares, %d squares explored\n", path_len, steps);
        printf("'+' is the path, 'x' marks dead ends that were tried\n");
    } else
        printf("\nno way out\n");
    show();
    return 0;
}
