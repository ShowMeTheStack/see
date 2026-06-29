#include <stdio.h>
int main(void)
{
    int a = 10, b = 0;
    printf("%d\n", a / b);
    return 0;
}
/* FAULT: Floating point exception: integer division by zero */
