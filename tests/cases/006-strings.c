#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>
int main(void)
{
    char a[50] = "Hello";
    char b[] = "World";
    char *tok, line[] = "one, two,,three";
    int n;
    strcat(a, ", ");
    strcat(a, b);
    printf("%s %d\n", a, (int)strlen(a));
    printf("%d %d %d\n", strcmp("abc", "abd") < 0, strcmp("b", "a") > 0, strncmp("abcx", "abcy", 3));
    printf("%s\n", strchr(a, 'W'));
    printf("%s\n", strrchr(a, 'l'));
    printf("%s\n", strstr(a, "lo, "));
    printf("%d %d\n", (int)strspn("aabbc", "ab"), (int)strcspn("hello", "lo"));
    for (tok = strtok(line, ", "); tok; tok = strtok(NULL, ", ")) printf("[%s]", tok);
    printf("\n");
    printf("%d %c %c\n", isdigit('7') != 0, toupper('q'), tolower('Q'));
    n = atoi("  -42xyz");
    printf("%d %ld %.2f\n", n, strtol("0x1f", NULL, 16), atof("2.5e1"));
    memset(b, '*', 3);
    printf("%s\n", b);
    memmove(a + 2, a, 5);
    printf("%s\n", a);
    sprintf(a, "%05.1f|%-4s|%3c", 2.25, "ab", 'z');
    printf("%s\n", a);
    return 0;
}
/* OUTPUT
Hello, World 12
1 1 0
World
ld
lo, World
4 2
[one][two][three]
1 Q q
-42 31 25.00
***ld
HeHelloWorld
002.2|ab  |  z
*/
