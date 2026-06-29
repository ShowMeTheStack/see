#include <stdio.h>
int main(void)
{
    const char *s = "abc";
    char *t = s;
    int *ip = 5;
    int x;
    printf("%d\n", "oops");
    if (x = 0) printf("no\n");
    return t != 0 && ip != 0;
}
/* WARNING: discards 'const' qualifier */
/* WARNING: makes pointer from integer without a cast */
/* WARNING: format '%d' expects argument of type 'int' */
/* WARNING: suggest parentheses around assignment */
/* EXIT: 1 */
