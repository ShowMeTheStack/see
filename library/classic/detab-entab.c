/*
 * title: detab and entab
 * level: 2
 * about: Replaces tabs with the right number of blanks to reach the next tab stop, then does the reverse, keeping the column count throughout.
 * input: a\tb\tc\nname\tcity\n12345678\tx\n        eight blanks\n
 */
#include <stdio.h>
#include <string.h>

#define TABSTOP 8
#define MAXLINE 200

/* Exercise 1-20. A tab does not mean "eight blanks": it means "move to
   the next column that is a multiple of 8". At column 3 that is 5
   blanks, at column 7 just 1. So we must track the column. */
void detab(const char *in, char *out)
{
    int col = 0, n;

    for (; *in != '\0'; in++) {
        if (*in == '\t') {
            n = TABSTOP - col % TABSTOP;
            while (n-- > 0) {
                *out++ = ' ';
                col++;
            }
        } else {
            *out++ = *in;
            col = (*in == '\n') ? 0 : col + 1;
        }
    }
    *out = '\0';
}

/* Exercise 1-21. Collect blanks instead of copying them. When the run
   of blanks reaches a tab stop, one tab replaces it. Anything else
   first lets out the blanks that did not make it to a stop. */
void entab(const char *in, char *out)
{
    int col = 0, blanks = 0;

    for (; *in != '\0'; in++) {
        if (*in == ' ') {
            blanks++;
            col++;
            if (col % TABSTOP == 0) {
                *out++ = blanks > 1 ? '\t' : ' ';  /* one blank stays a blank */
                blanks = 0;
            }
        } else {
            while (blanks > 0) {
                *out++ = ' ';
                blanks--;
            }
            *out++ = *in;
            col = (*in == '\n') ? 0 : col + 1;
        }
    }
    *out = '\0';
}

/* Show tabs as > and blanks as . so the difference is visible. */
void show(const char *label, const char *s)
{
    int n = (int)strcspn(s, "\n");   /* length up to the newline */

    printf("%s ", label);
    for (; *s != '\0' && *s != '\n'; s++)
        putchar(*s == '\t' ? '>' : *s == ' ' ? '.' : *s);
    printf("  (%d chars)\n", n);
}

int main(void)
{
    char line[MAXLINE], wide[MAXLINE * TABSTOP], narrow[MAXLINE * TABSTOP];

    printf("tab stops: |-------|-------|-------|\n");
    while (fgets(line, MAXLINE, stdin) != NULL) {
        detab(line, wide);
        entab(wide, narrow);
        show("input    ", line);
        show("detabbed ", wide);
        show("entabbed ", narrow);
    }
    return 0;
}
