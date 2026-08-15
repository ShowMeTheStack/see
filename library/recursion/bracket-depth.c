/*
 * title: How deeply are the brackets nested?
 * level: 3
 * about: Reads lines of brackets and checks each with a recursive function that calls itself once per opening bracket, reporting the deepest nesting or where it breaks.
 * input: (a[b]{c})\n((()))[]\n{[(<>)]}\n(]\n((x)\nf(g(h(i(j(k)))))\n)\n
 */
#include <stdio.h>

static const char *pos;    /* next character to look at */
static int deepest;
static const char *error;

int is_open(char c)  { return c == '(' || c == '[' || c == '{' || c == '<'; }
int is_close(char c) { return c == ')' || c == ']' || c == '}' || c == '>'; }

char partner(char open)
{
    switch (open) {
    case '(': return ')';
    case '[': return ']';
    case '{': return '}';
    }
    return '>';
}

/* Reads a sequence of balanced groups until it meets a closing bracket
   or the end of the line. Each opening bracket starts a new call one
   level deeper, which must come back having found the matching close.
   So the call stack mirrors the brackets: when See stops in the middle
   of "f(g(h(i(", there is one frame per bracket still open. */
int groups(int depth)
{
    char open;

    if (depth > deepest)
        deepest = depth;
    while (*pos != '\0' && !is_close(*pos)) {
        if (!is_open(*pos)) {
            pos++;                 /* ordinary text: skip it */
            continue;
        }
        open = *pos++;
        if (!groups(depth + 1))
            return 0;              /* pass a failure straight up */
        if (*pos != partner(open)) {
            error = *pos == '\0' ? "a bracket is never closed" : "wrong kind of closing bracket";
            return 0;
        }
        pos++;                     /* step over the matching close */
    }
    return 1;
}

int main(void)
{
    char line[100];
    int c, n;

    for (;;) {
        n = 0;
        while ((c = getchar()) != EOF && c != '\n')
            if (n < 99)
                line[n++] = (char)c;
        line[n] = '\0';
        if (c == EOF && n == 0)
            break;

        pos = line;
        deepest = 0;
        error = NULL;
        if (groups(0) && *pos == '\0')
            printf("%-20s balanced, nested %d deep\n", line, deepest);
        else {
            if (error == NULL)
                error = "a closing bracket with nothing open";
            printf("%-20s %s, at column %d\n", line, error, (int)(pos - line) + 1);
        }
    }
    return 0;
}
