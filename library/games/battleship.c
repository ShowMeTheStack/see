/*
 * title: Battleship against hidden ships
 * level: 2
 * about: Hides three ships on a 6x6 sea with a fixed seed and takes shots like B4 from stdin, reporting hits, misses and sunk ships until the fleet is gone.
 * input: C3\nB3\nB2\nB2\nB1\nZ9\nA4\nA5\nE5\nD1\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

#define N 6
#define SHIPS 3

struct ship {
    const char *name;
    int size;
    int hits;
};

static struct ship fleet[SHIPS] = {
    { "cruiser", 3, 0 }, { "submarine", 2, 0 }, { "dinghy", 1, 0 }
};

/* Each square holds -1 for open sea, or the index of the ship there.
   That index links the grid to the fleet array. */
static int sea[N][N];
static char shots[N][N];    /* ' ' not fired, 'o' miss, 'X' hit */

static int fits(int r, int c, int down, int size)
{
    int k;

    for (k = 0; k < size; k++) {
        int rr = r + (down ? k : 0), cc = c + (down ? 0 : k);
        if (rr >= N || cc >= N || sea[rr][cc] != -1)
            return 0;
    }
    return 1;
}

static void hide_fleet(void)
{
    int s, r, c, down, k;

    for (r = 0; r < N; r++)
        for (c = 0; c < N; c++) {
            sea[r][c] = -1;
            shots[r][c] = ' ';
        }
    for (s = 0; s < SHIPS; s++) {
        do {                            /* keep trying until it fits */
            r = rand() % N;
            c = rand() % N;
            down = rand() % 2;
        } while (!fits(r, c, down, fleet[s].size));
        for (k = 0; k < fleet[s].size; k++)
            sea[r + (down ? k : 0)][c + (down ? 0 : k)] = s;
    }
}

static void show(void)
{
    int r, c;

    printf("   1 2 3 4 5 6\n");
    for (r = 0; r < N; r++) {
        printf(" %c", 'A' + r);
        for (c = 0; c < N; c++)
            printf(" %c", shots[r][c] == ' ' ? '.' : shots[r][c]);
        printf("\n");
    }
}

int main(void)
{
    char shot[8];
    int r, c, s, afloat = SHIPS, fired = 0;

    srand(17);
    hide_fleet();
    show();
    while (afloat > 0 && scanf("%7s", shot) == 1) {
        /* "B4" -> row 1, column 3. Letters and digits are consecutive
           codes, so subtraction turns them into indices. */
        r = toupper((unsigned char)shot[0]) - 'A';
        c = shot[1] - '1';
        printf("fire at %s: ", shot);
        if (r < 0 || r >= N || c < 0 || c >= N || shot[2] != '\0') {
            printf("not on the map\n");
            continue;
        }
        if (shots[r][c] != ' ') {
            printf("already fired there\n");
            continue;
        }
        fired++;
        s = sea[r][c];
        if (s < 0) {
            shots[r][c] = 'o';
            printf("splash\n");
            continue;
        }
        shots[r][c] = 'X';
        fleet[s].hits++;
        if (fleet[s].hits == fleet[s].size) {
            afloat--;
            printf("hit - you sank the %s!\n", fleet[s].name);
            show();
        } else {
            printf("hit!\n");
        }
    }
    if (afloat == 0)
        printf("Fleet destroyed with %d shots.\n", fired);
    else
        printf("%d ships still afloat.\n", afloat);
    return 0;
}
