#include <stdio.h>
#include <setjmp.h>
jmp_buf env;
void deep(int n)
{
    if (n == 0) longjmp(env, 7);
    deep(n - 1);
    printf("never\n");
}
int main(void)
{
    int r = setjmp(env);
    if (r == 0) {
        printf("first time\n");
        deep(5);
    } else
        printf("came back with %d\n", r);
    return 0;
}
/* OUTPUT
first time
came back with 7
*/
