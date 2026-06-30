#include <stdio.h>
char word[] = "global";
char padded[10] = "ab";
unsigned char bytes[] = "\xff\x01";
const char *names[] = { "zero", "one", "two" };
struct item { const char *name; int qty; char code[4]; } items[] = { { "pen", 3, "P1" }, { "ink", 1, "I9" } };
int main(void)
{
    fprintf(stdout, "%s %s %d %d %d\n", word, padded, (int)sizeof padded, bytes[0], bytes[1]);
    printf("%s %s %s %d\n", names[2], items[1].name, items[0].code, items[0].qty);
    fflush(stdout);
    return 0;
}
/* OUTPUT
global ab 10 255 1
two ink P1 3
*/
