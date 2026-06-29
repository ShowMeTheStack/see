#include <stdio.h>
int max(a, b)
int a, b;
{
    return a > b ? a : b;
}
double half(x)
double x;
{
    return x / 2;
}
int noproto();
int main()
{
    printf("%d %.2f %d\n", max(3, 8), half(5.0), noproto(4));
    return 0;
}
int noproto(n) int n; { return n * n; }
/* OUTPUT
8 2.50 16
*/
