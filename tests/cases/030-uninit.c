#include <stdio.h>
int main(void)
{
    int x;
    int y = x + 1;
    printf("%d\n", y > 0 || y <= 0);
    return 0;
}
/* RUNTIME: before it was given a value */
/* OUTPUT
1
*/
