#include <stdio.h>
static int value = 1;
int other(void);
int main(void) { printf("%d %d\n", value, other()); return 0; }
