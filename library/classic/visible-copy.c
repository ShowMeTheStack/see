/*
 * title: cat that shows the invisible
 * level: 1
 * about: Copies input to output like cat, but turns tabs, backspaces and backslashes into \t, \b and \\ and squeezes runs of blanks into one.
 * input: name\tage\tcity\nAda\t36\tLondon\nspaces    squeezed   here\nback\\slash\n
 */
#include <stdio.h>

int main(void)
{
    int c, prev = EOF;

    /* The simplest cat is just:
           while ((c = getchar()) != EOF) putchar(c);
       Everything below is that loop with a few cases on top. */
    while ((c = getchar()) != EOF) {
        if (c == '\t')
            printf("\\t");          /* "\\" in a string is one backslash */
        else if (c == '\b')
            printf("\\b");
        else if (c == '\\')
            printf("\\\\");
        else if (c == ' ' && prev == ' ')
            ;                       /* skip the second and later blanks */
        else
            putchar(c);
        prev = c;
    }
    return 0;
}
