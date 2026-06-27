#include <stdio.h>
int main(void)
{
    int i, j, n = 0;
    for (i = 0; i < 10; i++) {
        if (i == 2) continue;
        if (i == 7) break;
        n += i;
    }
    printf("%d\n", n);
    i = 0;
    while (1) { if (++i > 5) break; }
    printf("%d\n", i);
    do { i--; } while (i > 0);
    printf("%d\n", i);
    for (i = 0; i < 6; i++) {
        switch (i) {
        case 0: printf("zero "); break;
        case 1:
        case 2: printf("small "); break;
        case 3: printf("three ");
        case 4: printf("fall "); break;
        default: printf("big ");
        }
    }
    printf("\n");
    for (i = 0; i < 3; i++)
        for (j = 0; j < 3; j++)
            if (i * j == 2) goto found;
    printf("not found\n");
found:
    printf("%d %d\n", i, j);
    n = 5;
    n = n > 3 ? n * 2 : n;
    printf("%d %d %d\n", n, (n, 7), !n);
    printf("%d %d\n", 1 && 0, 0 || 2);
    return 0;
}
/* OUTPUT
19
6
0
zero small small three fall fall big 
1 2
10 7 0
0 1
*/
