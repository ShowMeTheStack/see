#include <stdio.h>
#include <stdlib.h>
int grid[3][4] = { { 1, 2, 3, 4 }, { 5, 6, 7, 8 }, { 9, 10, 11, 12 } };
int sumrow(int row[], int n) { int s = 0, i; for (i = 0; i < n; i++) s += row[i]; return s; }
int total(int (*g)[4], int rows) { int s = 0, i; for (i = 0; i < rows; i++) s += sumrow(g[i], 4); return s; }
int main(void)
{
    int i, j;
    int **jag;
    char names[3][8] = { "ann", "bob", "cy" };
    int partial[5] = { 1, 2 };
    int flat[] = { 1, 2, 3, 4, 5, 6 };
    printf("%d %d %d\n", grid[1][2], *(*(grid + 2) + 3), total(grid, 3));
    jag = malloc(3 * sizeof(int *));
    for (i = 0; i < 3; i++) {
        jag[i] = malloc((i + 1) * sizeof(int));
        for (j = 0; j <= i; j++) jag[i][j] = i * 10 + j;
    }
    for (i = 0; i < 3; i++) { for (j = 0; j <= i; j++) printf("%d ", jag[i][j]); printf("| "); }
    printf("\n");
    for (i = 0; i < 3; i++) free(jag[i]);
    free(jag);
    printf("%s %s %c %d\n", names[0], names[2], names[1][1], (int)sizeof names);
    printf("%d %d %d\n", partial[1], partial[4], (int)(sizeof flat / sizeof flat[0]));
    return 0;
}
/* OUTPUT
7 12 78
0 | 10 11 | 20 21 22 | 
ann cy o 24
2 0 6
*/
