#include <stdio.h>
int *bad(void) { int local = 5; return &local; }
int main(void)
{
    int *p = bad();
    printf("%d\n", *p);
    return 0;
}
/* WARNING: returns address of local variable */
/* FAULT: already returned */
