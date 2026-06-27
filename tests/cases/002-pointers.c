#include <stdio.h>
void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }
int main(void)
{
    int a = 1, b = 2;
    int arr[5] = { 10, 20, 30 };
    int *p = arr;
    int (*pa)[5] = &arr;
    int **pp = &p;
    const char *s = "hello";
    char *const t = (char *)s;
    swap(&a, &b);
    printf("%d %d\n", a, b);
    printf("%d %d %d %d\n", *p, *(p + 1), p[2], arr[3]);
    printf("%d %d\n", (*pa)[1], **pp);
    p++;
    printf("%d %d\n", *p, (int)(p - arr));
    printf("%c %c %d\n", *s, s[4], (int)sizeof(arr));
    printf("%d %d %d\n", (int)sizeof(int *), (int)sizeof(double), (int)sizeof(*pa));
    printf("%d\n", t == s);
    printf("%d\n", 3[arr]);
    return 0;
}
/* OUTPUT
2 1
10 20 30 0
20 10
20 1
h o 20
4 8 20
1
0
*/
