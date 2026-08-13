/*
 * title: Word search with a function per question
 * level: 3
 * about: Finds hidden words in a letter grid in all eight directions, using small functions so that "stop searching" is simply a return.
 */
#include <stdio.h>
#include <string.h>

#define ROWS 8
#define COLS 10

static const char grid[ROWS][COLS + 1] = {
    "GBNRUTERWS",
    "LVDLHEXMMG",
    "AOSFALMAZK",
    "CIHTLBRASW",
    "ODVAAAOCRM",
    "LQCUPTOLVF",
    "STACKPIWGW",
    "HVQXEVDCKJ"
};

/* The eight directions as row and column steps. */
static const int dr[8] = { 0, 0, 1, -1, 1, 1, -1, -1 };
static const int dc[8] = { 1, -1, 0, 0, 1, -1, 1, -1 };
static const char *dir_name[8] = {
    "right", "left", "down", "up", "down-right", "down-left", "up-right", "up-left"
};

int on_grid(int r, int c)
{
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

/* Does word start at (r, c) going in direction d? Returns as soon as a
   letter fails to match, so most calls end after one comparison. */
int matches_at(const char *word, int r, int c, int d)
{
    int i, n = (int)strlen(word);

    for (i = 0; i < n; i++) {
        if (!on_grid(r + i * dr[d], c + i * dc[d]))
            return 0;
        if (grid[r + i * dr[d]][c + i * dc[d]] != word[i])
            return 0;
    }
    return 1;
}

/* Three nested loops: rows, columns, directions. Getting out of all
   three at once is awkward with break, but trivial with return. The
   answer comes back through three pointers. */
int find(const char *word, int *row, int *col, int *dir)
{
    int r, c, d;

    for (r = 0; r < ROWS; r++)
        for (c = 0; c < COLS; c++)
            for (d = 0; d < 8; d++)
                if (matches_at(word, r, c, d)) {
                    *row = r;
                    *col = c;
                    *dir = d;
                    return 1;
                }
    return 0;
}

int main(void)
{
    const char *words[11] = {
        "STACK", "RETURN", "VOID", "LOCAL", "STATIC", "SCOPE",
        "PARAMS", "GLOBAL", "CALL", "FRAME", "HEAP"
    };
    int i, r, c, d;

    for (r = 0; r < ROWS; r++)
        printf("  %s\n", grid[r]);
    printf("\n");

    for (i = 0; i < 11; i++) {
        if (find(words[i], &r, &c, &d))
            printf("%-7s row %d, column %d, going %s\n", words[i], r + 1, c + 1, dir_name[d]);
        else
            printf("%-7s not hidden here\n", words[i]);
    }
    return 0;
}
