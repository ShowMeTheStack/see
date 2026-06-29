#include <stdlib.h>
int main(void)
{
    char *p = malloc(10);
    free(p);
    free(p);
    return 0;
}
/* FAULT: double free */
