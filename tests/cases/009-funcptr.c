#include <stdio.h>
#include <string.h>
#include <stdlib.h>
int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
int mul(int a, int b) { return a * b; }
typedef int (*binop)(int, int);
int apply(binop f, int a, int b) { return f(a, b); }
int (*pick(char c))(int, int) { return c == '+' ? add : c == '-' ? sub : mul; }
int bylen(const void *a, const void *b) { return (int)strlen(*(char * const *)a) - (int)strlen(*(char * const *)b); }
int main(void)
{
    binop ops[3] = { add, sub, mul };
    int (*fp)(int, int) = &add;
    const char *words[4] = { "kiwi", "fig", "banana", "apple" };
    int i;
    for (i = 0; i < 3; i++) printf("%d ", ops[i](6, 3));
    printf("\n%d %d %d\n", (*fp)(1, 2), apply(sub, 10, 4), pick('*')(5, 5));
    qsort(words, 4, sizeof words[0], bylen);
    for (i = 0; i < 4; i++) printf("%s ", words[i]);
    printf("\n%d\n", fp == add);
    return 0;
}
/* OUTPUT
9 3 18 
3 6 25
fig kiwi apple banana 
1
*/
