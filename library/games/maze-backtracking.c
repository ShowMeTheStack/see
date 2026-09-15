/*
 * title: Escaping a maze by backtracking
 * level: 3
 * about: Reads a maze from stdin and finds a way from S to E with recursive depth-first search, marking the path and undoing dead ends.
 * input: ###########\n#S    #   #\n# #### # ##\n#    # #  #\n#### # ## #\n#    #    #\n# ####### #\n#        E#\n###########\n
 */
#include <stdio.h>
#include <string.h>

#define MAXR 20
#define MAXC 40

static char maze[MAXR][MAXC + 2];
static int rows, cols;
static int steps_tried = 0;

/* Try to reach E from (r,c). Mark the square with '.' on the way in.
   If none of the four directions leads out, erase the mark on the way
   back: that is the "backtracking". The call stack in the debugger holds
   exactly the current path - one frame per square. */
static int solve(int r, int c)
{
    if (r < 0 || r >= rows || c < 0 || c >= cols)
        return 0;
    if (maze[r][c] == 'E')
        return 1;
    if (maze[r][c] != ' ')
        return 0;       /* a wall, or a square already on our path */

    steps_tried++;
    maze[r][c] = '.';
    if (solve(r, c + 1) || solve(r + 1, c) || solve(r, c - 1) || solve(r - 1, c))
        return 1;
    maze[r][c] = ' ';           /* dead end: take the mark back */
    return 0;
}

int main(void)
{
    int r, c, sr = -1, sc = -1, len = 0;

    while (rows < MAXR && fgets(maze[rows], sizeof maze[rows], stdin) != NULL) {
        maze[rows][strcspn(maze[rows], "\n")] = '\0';
        if ((int)strlen(maze[rows]) > cols)
            cols = (int)strlen(maze[rows]);
        rows++;
    }
    for (r = 0; r < rows; r++)
        for (c = 0; maze[r][c] != '\0'; c++)
            if (maze[r][c] == 'S') {
                sr = r;
                sc = c;
            }
    if (sr < 0) {
        printf("No S in the maze.\n");
        return 0;
    }

    printf("maze %d x %d, start at row %d col %d\n", rows, cols, sr, sc);
    /* Treat S as an open square while searching, so the path can start
       there and never loop back into it; put the letter back afterwards. */
    maze[sr][sc] = ' ';
    if (solve(sr, sc)) {
        maze[sr][sc] = 'S';
        for (r = 0; r < rows; r++) {
            printf("%s\n", maze[r]);
            for (c = 0; maze[r][c] != '\0'; c++)
                if (maze[r][c] == '.')
                    len++;
        }
        printf("path of %d steps, %d squares visited while searching\n", len + 1, steps_tried);
        printf("(depth-first finds A path, not always the shortest one)\n");
    } else {
        maze[sr][sc] = 'S';
        printf("No way out.\n");
    }
    return 0;
}
