/*
 * title: wc, the word counter
 * level: 1
 * about: Counts lines, words and characters the way the Unix wc program does, using a two-state IN/OUT flag.
 * input: The quick brown fox\n  jumps over\tthe lazy dog.\n\nEnd of   story.\n
 */
#include <stdio.h>

#define IN  1   /* inside a word */
#define OUT 0   /* outside a word */

int main(void)
{
    int c, state;
    long nl, nw, nc;

    state = OUT;
    nl = nw = nc = 0;     /* assignment is an expression: right to left */

    while ((c = getchar()) != EOF) {
        ++nc;
        if (c == '\n')
            ++nl;
        /* A word is anything without blanks, tabs or newlines. We count
           a word at the moment we step from OUT to IN, i.e. on its first
           character. Watch state flip in the locals panel as you step
           through a line of input. */
        if (c == ' ' || c == '\n' || c == '\t')
            state = OUT;
        else if (state == OUT) {
            state = IN;
            ++nw;
        }
    }
    printf("%7ld %7ld %7ld\n", nl, nw, nc);
    return 0;
}
