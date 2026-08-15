/*
 * title: Eight queens by backtracking
 * level: 4
 * about: Places queens on a chessboard row by row, backing up whenever a queen is attacked, to count all solutions for boards of size 4 to 8.
 */
#include <stdio.h>

#define MAX 8

/* col[r] is the column of the queen in row r. Placing row by row means
   two queens can never share a row, so only columns and diagonals need
   checking. Three flag arrays make that check instant:
     used_col[c]        a queen already sits in column c
     used_down[r + c]   ... on this "\" diagonal (r + c is constant)
     used_up[r - c + n - 1] ... on this "/" diagonal (r - c is constant) */
int n;
int col[MAX];
int used_col[MAX], used_down[2 * MAX], used_up[2 * MAX];
long solutions;
long tries;

void print_board(void)
{
    int r, c;

    for (r = 0; r < n; r++) {
        for (c = 0; c < n; c++)
            printf(" %c", col[r] == c ? 'Q' : '.');
        printf("\n");
    }
}

/* Each frame owns one row. It tries every column; for each safe one it
   marks the flags, recurses to the next row, then clears the flags
   again (the backtrack). In See, stop in here at depth 8: the call
   stack is eight frames tall, one per placed queen, and each frame's r
   and c show that queen's square. */
void place(int r)
{
    int c;

    if (r == n) {
        solutions++;
        if (solutions == 1 && n == MAX) {
            printf("first solution for %d queens:\n", n);
            print_board();
        }
        return;
    }
    for (c = 0; c < n; c++) {
        tries++;
        if (used_col[c] || used_down[r + c] || used_up[r - c + n - 1])
            continue;
        col[r] = c;
        used_col[c] = used_down[r + c] = used_up[r - c + n - 1] = 1;
        place(r + 1);
        used_col[c] = used_down[r + c] = used_up[r - c + n - 1] = 0;
    }
}

int main(void)
{
    for (n = 4; n <= MAX; n++) {
        solutions = 0;
        tries = 0;
        place(0);
        printf("%d queens: %3ld solutions, %6ld squares tried\n", n, solutions, tries);
    }
    return 0;
}
