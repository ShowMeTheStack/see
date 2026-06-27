#include <stdio.h>
int g = 10;
static int counter;
int add(int a, int b) { return a + b; }
int main(void)
{
    int x = 5, y;
    unsigned u = 3000000000u;
    char c = 'A';
    short s = -2;
    long l = 100000L;
    y = add(x, g);
    counter++;
    printf("%d %d %u %c %d %ld %d\n", x, y, u, c, s, l, counter);
    printf("%d %d %d\n", 7 / 2, -7 / 2, -7 % 2);
    printf("%u %d\n", (unsigned)-1, (int)(unsigned char)300);
    printf("%x %X %o %#x %#o\n", 255, 255, 8, 255, 8);
    printf("[%5d] [%-5d] [%05d] [%+d] [% d]\n", 42, 42, 42, 42, 42);
    printf("[%.3d] [%8.3f] [%-8.2e] [%g] [%g] [%g]\n", 7, 3.14159, 31415.9, 0.0001, 100000.0, 1e20);
    printf("[%s] [%10s] [%-10s] [%.2s]\n", "abc", "abc", "abc", "abc");
    printf("%c%c%c\n", 72, 105, 33);
    printf("%%\n");
    return 0;
}
/* OUTPUT
5 15 3000000000 A -2 100000 1
3 -3 -1
4294967295 44
ff FF 10 0xff 010
[   42] [42   ] [00042] [+42] [ 42]
[007] [   3.142] [3.14e+04] [0.0001] [100000] [1e+20]
[abc] [       abc] [abc       ] [ab]
Hi!
%
*/
