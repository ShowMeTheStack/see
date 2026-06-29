#include <stdio.h>
#include <limits.h>
int main(void)
{
    int big = INT_MAX;
    unsigned u = 0;
    big = big + 1;
    u = u - 1;
    printf("%d %u\n", big, u);
    return 0;
}
/* RUNTIME: signed integer overflow */
/* OUTPUT
-2147483648 4294967295
*/
