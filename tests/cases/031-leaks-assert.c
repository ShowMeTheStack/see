#include <stdio.h>
#include <assert.h>
int main(void)
{
    int n = 3;
    assert(n == 3);
    printf("ok\n");
    assert(n > 5);
    printf("not reached\n");
    return 0;
}
/* FAULT: Aborted */
/* OUTPUT
ok
Assertion failed: n > 5, file /prog.c, line 8
*/
