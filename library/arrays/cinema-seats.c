/*
 * title: Booking cinema seats
 * level: 2
 * about: Keeps a seating plan in a 2D char array, books seats from typed requests like C4, refuses taken or impossible seats, and prints the plan.
 * input: C4\nC5\nC4\nA1\nF9\nZ2\nE8\nB12\nq\n
 */
#include <stdio.h>
#include <ctype.h>

#define ROWS 6
#define SEATS 10

static void plan(char hall[ROWS][SEATS])
{
    int r, s;
    printf("    ");
    for (s = 0; s < SEATS; s++)
        printf("%d", (s + 1) % 10);
    printf("\n");
    for (r = 0; r < ROWS; r++) {
        printf("  %c ", 'A' + r);
        for (s = 0; s < SEATS; s++)
            putchar(hall[r][s]);
        printf("\n");
    }
    printf("     ---- screen ----\n");
}

int main(void)
{
    char hall[ROWS][SEATS];
    char rowLetter;
    int seat, r, s, sold = 0;

    for (r = 0; r < ROWS; r++)
        for (s = 0; s < SEATS; s++)
            hall[r][s] = '.';

    /* " %c" skips spaces and newlines before the row letter. */
    while (scanf(" %c", &rowLetter) == 1 && rowLetter != 'q') {
        if (scanf("%d", &seat) != 1)
            break;
        /* People count rows from A and seats from 1; C counts from 0.
           Convert once, here, and check before touching the array. */
        r = toupper((unsigned char)rowLetter) - 'A';
        s = seat - 1;
        if (r < 0 || r >= ROWS || s < 0 || s >= SEATS) {
            printf("%c%d: no such seat\n", rowLetter, seat);
        } else if (hall[r][s] == 'X') {
            printf("%c%d: already taken\n", rowLetter, seat);
        } else {
            hall[r][s] = 'X';
            sold++;
            printf("%c%d: booked\n", rowLetter, seat);
        }
    }
    plan(hall);
    printf("%d of %d seats sold\n", sold, ROWS * SEATS);
    return 0;
}
