#include <stdio.h>
int main(void)
{
    int a[5];
    int i;
    for (i = 0; i <= 5; i++) a[i] = i;
    printf("%d\n", a[0]);
    return 0;
}
/* FAULT: buffer overflow */
/* FAULT: 'a' */
