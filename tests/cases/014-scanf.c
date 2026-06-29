#include <stdio.h>
int main(void)
{
    int a, b, n;
    char word[20], c;
    double d;
    n = scanf("%d %d", &a, &b);
    printf("%d: %d+%d=%d\n", n, a, b, a + b);
    scanf("%s %lf", word, &d);
    printf("%s %.3f\n", word, d);
    scanf(" %c", &c);
    printf("[%c]\n", c);
    while ((n = getchar()) != '\n' && n != EOF) ;
    if (fgets(word, sizeof word, stdin)) printf("line: %s", word);
    n = scanf("%d", &a);
    printf("%d\n", n);
    return 0;
}
/* INPUT
12 30
pi 3.14159
  x rest of line
the next line
*/
/* OUTPUT
2: 12+30=42
pi 3.142
[x]
line: the next line
-1
*/
