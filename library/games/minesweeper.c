/*
 * title: Minesweeper with a flood-fill reveal
 * level: 3
 * about: Plays minesweeper on a 6x6 board with seeded mines; revealing a square with no neighbouring mines opens the whole empty region recursively.
 * input: r 0 0\nf 2 1\nr 2 5\nr 4 0\nr 9 9\nf 0 4\nr 0 5\nr 2 0\nr 2 2\nr 2 3\nr 4 3\n
 */
#include <stdio.h>
#include <stdlib.h>

#define N 6
#define MINES 5

static int mine[N][N];      /* 1 where a mine is */
static int count[N][N];     /* mines among the 8 neighbours */
static char seen[N][N];     /* '.' hidden, 'F' flagged, else revealed */

static int inside(int r, int c)
{
    return r >= 0 && r < N && c >= 0 && c < N;
}

static void place_mines(void)
{
    int placed = 0, r, c, dr, dc;

    srand(3);
    while (placed < MINES) {
        r = rand() % N;
        c = rand() % N;
        if (!mine[r][c]) {      /* never put two mines on one square */
            mine[r][c] = 1;
            placed++;
        }
    }
    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            for (dr = -1; dr <= 1; dr++)
                for (dc = -1; dc <= 1; dc++)
                    if ((dr || dc) && inside(r + dr, c + dc) && mine[r + dr][c + dc])
                        count[r][c]++;
}

/* Reveal one square. If it has no mine neighbours, its neighbours are
   all safe too, so reveal them - which may spread further. Put a
   breakpoint here and watch the call stack grow as the empty region
   opens: each frame is one square waiting for its neighbours. */
static int reveal(int r, int c)
{
    int dr, dc, opened = 1;

    if (!inside(r, c) || seen[r][c] != '.')
        return 0;
    seen[r][c] = (char)(count[r][c] ? '0' + count[r][c] : ' ');
    if (count[r][c] == 0)
        for (dr = -1; dr <= 1; dr++)
            for (dc = -1; dc <= 1; dc++)
                if (dr || dc)
                    opened += reveal(r + dr, c + dc);
    return opened;
}

static void show(int all)
{
    int r, c;

    printf("   0 1 2 3 4 5\n");
    for (r = 0; r < N; r++) {
        printf("%d ", r);
        for (c = 0; c < N; c++)
            printf(" %c", all && mine[r][c] ? '*' : seen[r][c]);
        printf("\n");
    }
}

static int hidden_safe(void)
{
    int r, c, n = 0;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            if (!mine[r][c] && (seen[r][c] == '.' || seen[r][c] == 'F'))
                n++;
    return n;
}

int main(void)
{
    char cmd;
    int r, c;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++)
            seen[r][c] = '.';
    place_mines();

    printf("Commands: r row col to reveal, f row col to flag.\n");
    show(0);
    while (hidden_safe() > 0) {
        if (scanf(" %c %d %d", &cmd, &r, &c) != 3) {
            printf("No more moves.\n");
            return 0;
        }
        printf("> %c %d %d\n", cmd, r, c);
        if (!inside(r, c)) {
            printf("Off the board.\n");
            continue;
        }
        if (cmd == 'f') {
            if (seen[r][c] == '.')
                seen[r][c] = 'F';
            else if (seen[r][c] == 'F')
                seen[r][c] = '.';
        } else if (mine[r][c]) {
            printf("BOOM! There was a mine at %d %d.\n", r, c);
            show(1);
            return 0;
        } else {
            printf("opened %d squares\n", reveal(r, c));
        }
        show(0);
    }
    printf("All safe squares found. You win!\n");
    show(1);
    return 0;
}
