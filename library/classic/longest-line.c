/*
 * title: The longest line, with getline and copy
 * level: 2
 * about: Reads lines with a hand-written getline, remembers the longest with copy, and prints it.
 * input: short\na bit longer line\nthe very longest line of the whole input\nmedium sized line\n
 */
#include <stdio.h>

#define MAXLINE 100

/* The book calls this getline. Some modern libraries already have a
   function with that name, so it is called get_line here. */
int get_line(char line[], int maxline);
void copy(char to[], const char from[]);

int main(void)
{
    int len, max = 0;
    char line[MAXLINE];      /* the line just read */
    char longest[MAXLINE];   /* the longest line so far */

    /* Two arrays in main's frame. In the stack panel, line changes on
       every pass, and longest changes only when a record is broken. */
    while ((len = get_line(line, MAXLINE)) > 0) {
        if (len > max) {
            max = len;
            copy(longest, line);
        }
    }
    if (max > 0)
        printf("longest (%d characters with the newline): %s", max, longest);
    return 0;
}

/* Read a line into s, return its length. The newline is kept, then a
   '\0' marks the end. It never writes more than lim characters, the
   '\0' included, so a long line is cut instead of overflowing s.
   Returns 0 only at end of input; an empty line still has its '\n'. */
int get_line(char s[], int lim)
{
    int c = 0, i;

    for (i = 0; i < lim - 1 && (c = getchar()) != EOF && c != '\n'; ++i)
        s[i] = (char)c;
    if (c == '\n') {
        s[i] = (char)c;
        ++i;
    }
    s[i] = '\0';
    return i;
}

/* Copy from into to, including the '\0'. Arrays are passed as pointers,
   so this writes straight into main's longest array: step into copy
   and see that to holds the address of main's array. */
void copy(char to[], const char from[])
{
    int i = 0;

    while ((to[i] = from[i]) != '\0')
        ++i;
}
