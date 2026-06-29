#include <stdlib.h>
#include <string.h>
int main(void)
{
    char *s = malloc(5);
    strcpy(s, "hello");
    return 0;
}
/* FAULT: strcpy */
/* FAULT: block */
