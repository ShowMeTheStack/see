/*
 * title: A const int is not a constant
 * level: 2
 * about: Shows the places where C89 needs a true constant expression and a const int will not do, and the #define and enum alternatives.
 */
#include <stdio.h>

#define ROWS 3                 /* a macro: the preprocessor pastes 3 in */
enum { COLS = 4 };             /* an enum constant: a real compile-time int */

const int depth = 5;           /* read-only, but an object in memory */

int main(void)
{
    /*
     * In C, const means "read-only", not "known at compile time". depth is
     * a variable that the program may not change, with an address you can
     * take. Array sizes, case labels and static initialisers need values
     * the compiler can compute itself, so each of these fails:
     *
     *     int stack[depth];          error: array size is not an integer constant
     *     case depth:                error: case label is not an integer constant
     *     static int d2 = depth;     error: initializer element is not constant
     *
     * (C++ changed this rule, which is why the habit surprises people.)
     */
    int grid[ROWS][COLS];
    int r, c;
    int choice = 4;

    for (r = 0; r < ROWS; r++)
        for (c = 0; c < COLS; c++)
            grid[r][c] = r * COLS + c;
    printf("grid[%d][%d] = %d\n", ROWS - 1, COLS - 1, grid[ROWS - 1][COLS - 1]);

    /* An enum constant works as a case label. */
    switch (choice) {
    case COLS:
        printf("choice equals COLS\n");
        break;
    default:
        printf("something else\n");
    }

    /* Where a constant expression is not required, depth is fine and has an address. */
    printf("depth = %d, stored at %p\n", depth, (void *)&depth);
    printf("ROWS and COLS have no address; they are not objects at all\n");
    return 0;
}
