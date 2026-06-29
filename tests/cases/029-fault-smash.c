#include <string.h>
void f(void)
{
    char buf[8];
    char *p = buf;
    int i;
    for (i = 0; i < 40; i++) *(p + i) = 'A';
}
int main(void) { f(); return 0; }
/* FAULT: buffer overflow */
