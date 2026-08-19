/*
 * title: Reverse the order of words
 * level: 3
 * about: Turns "the cat sat" into "sat cat the" in place by reversing the whole line, then reversing each word back.
 * input: practice makes perfect\nthe quick brown fox jumps\nhello\n
 */
#include <stdio.h>
#include <string.h>

/* Reverse the characters from p up to, but not including, q. */
static void flip(char *p, char *q)
{
    char t;
    q--;
    while (p < q) {
        t = *p; *p++ = *q; *q-- = t;
    }
}

int main(void)
{
    char line[100];
    char *start, *end;
    size_t n;

    while (fgets(line, sizeof line, stdin) != NULL) {
        /* fgets keeps the newline; remove it so it stays at the end. */
        n = strlen(line);
        if (n > 0 && line[n - 1] == '\n')
            line[--n] = '\0';
        printf("%-28s -> ", line);

        /* Step 1: "practice makes perfect" -> "tcefrep sekam ecitcarp".
           The words are now in the right order but each one is backwards. */
        flip(line, line + n);

        /* Step 2: put each word the right way round. start finds a word,
           end finds the space or NUL after it. */
        start = line;
        while (*start) {
            while (*start == ' ')
                start++;
            end = start;
            while (*end && *end != ' ')
                end++;
            flip(start, end);
            start = end;
        }
        printf("%s\n", line);
    }
    return 0;
}
