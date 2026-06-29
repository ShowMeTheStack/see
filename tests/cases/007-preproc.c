#include <stdio.h>
#define SQUARE(x) ((x) * (x))
#define BAD_SQUARE(x) x * x
#define STR(x) #x
#define XSTR(x) STR(x)
#define GLUE(a, b) a ## b
#define VERSION 3
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#if VERSION >= 3 && defined(SQUARE)
#define MSG "new"
#elif VERSION == 2
#define MSG "old"
#else
#define MSG "ancient"
#endif
#ifndef NOTHING
int GLUE(my, var) = 42;
#endif
int main(void)
{
    printf("%d %d\n", SQUARE(1 + 2), BAD_SQUARE(1 + 2));
    printf("%s %s %s\n", STR(VERSION), XSTR(VERSION), MSG);
    printf("%d %d\n", myvar, MAX(3, 9));
    printf("%d %s\n", __LINE__, __FILE__);
    printf("%d\n", __STDC__);
#undef VERSION
#ifdef VERSION
    printf("still defined\n");
#endif
    return 0;
}
/* OUTPUT
9 5
VERSION 3 new
42 9
24 /prog.c
1
*/
