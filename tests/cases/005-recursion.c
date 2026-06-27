#include <stdio.h>
#include <stdlib.h>
int fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }
void hanoi(int n, char a, char b, char c, int *moves)
{
    if (n == 0) return;
    hanoi(n - 1, a, c, b, moves);
    (*moves)++;
    hanoi(n - 1, c, b, a, moves);
}
int cmp(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }
int main(void)
{
    int m = 0, i;
    int v[10] = { 5, 3, 9, 1, 7, 2, 8, 6, 4, 0 };
    int key = 7, *found;
    printf("%d\n", fib(20));
    hanoi(10, 'A', 'B', 'C', &m);
    printf("%d\n", m);
    qsort(v, 10, sizeof v[0], cmp);
    for (i = 0; i < 10; i++) printf("%d ", v[i]);
    printf("\n");
    found = bsearch(&key, v, 10, sizeof(int), cmp);
    printf("%d\n", (int)(found - v));
    return 0;
}
/* OUTPUT
6765
1023
0 1 2 3 4 5 6 7 8 9 
7
*/
