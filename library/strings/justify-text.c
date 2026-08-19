/*
 * title: Justifying a paragraph
 * level: 4
 * about: Splits a paragraph into words, packs as many as fit in each line of a fixed width, and spreads the spare spaces evenly between them.
 */
#include <stdio.h>
#include <string.h>

#define WIDTH 30
#define MAXW 80

int main(void)
{
    char text[] = "C was designed by Dennis Ritchie at Bell Labs in the early "
                  "1970s as a language for writing the Unix operating system, "
                  "and it remains one of the most widely used languages ever.";
    char *word[MAXW];          /* pointers into text, one per word */
    int len[MAXW];
    int nw = 0, first, last, i, used, gaps, spaces, extra, s;
    char *tok;

    /* Adjacent string literals are joined by the compiler into one, so
       text is a single array. strtok then puts a NUL after each word and
       word[i] points at it. In See, follow the arrows from word[] into
       text on the stack. */
    for (tok = strtok(text, " "); tok != NULL && nw < MAXW; tok = strtok(NULL, " ")) {
        word[nw] = tok;
        len[nw] = (int)strlen(tok);
        nw++;
    }

    printf("+------------------------------+\n");
    first = 0;
    while (first < nw) {
        /* Greedy packing: keep adding words while letters plus one space
           between each pair still fit in WIDTH. */
        used = len[first];
        last = first + 1;
        while (last < nw && used + 1 + len[last] <= WIDTH) {
            used += 1 + len[last];
            last++;
        }
        gaps = last - first - 1;
        printf("|");
        if (last == nw || gaps == 0) {
            /* The last line, or a line with a single word, stays ragged. */
            for (i = first; i < last; i++)
                printf("%s%s", i > first ? " " : "", word[i]);
            printf("%*s", WIDTH - used, "");
        } else {
            /* Spare columns are shared out; the first 'extra' gaps get one
               more space so the total comes out exactly right. */
            spaces = (WIDTH - used) / gaps;
            extra = (WIDTH - used) % gaps;
            for (i = first; i < last; i++) {
                printf("%s", word[i]);
                if (i < last - 1)
                    for (s = 0; s < 1 + spaces + (i - first < extra); s++)
                        putchar(' ');
            }
        }
        printf("|\n");
        first = last;
    }
    printf("+------------------------------+\n");
    return 0;
}
