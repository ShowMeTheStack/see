/*
 * title: Splitting lines into fields with strtok
 * level: 2
 * about: Reads lines of comma and space separated scores, splits them with strtok, and shows how strtok writes '\0' bytes into the buffer.
 * input: ada, 91, 78,85\nlinus 60,72 , 69\n,,bjarne,,88,95,90,,\n
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

/*
 * strtok(s, delims) returns the first token in s. Each later call with
 * NULL continues from where the last one stopped. It keeps that place
 * in a hidden static variable, so only one string can be tokenised at
 * a time, and it CHANGES the string: every delimiter that ends a token
 * is overwritten with '\0'.
 */
#define DELIMS ", \t\n"

int main(void)
{
    char line[80];
    char copy[80];
    char *tok;
    int lineno = 0, i, len;

    while (fgets(line, sizeof line, stdin) != NULL) {
        int total = 0, count = 0;
        const char *name = NULL;

        lineno++;
        strcpy(copy, line);
        len = (int)strlen(line);

        for (tok = strtok(line, DELIMS); tok != NULL; tok = strtok(NULL, DELIMS)) {
            if (name == NULL)
                name = tok;      /* points into line, not a copy */
            else {
                total += atoi(tok);
                count++;
            }
        }

        if (name == NULL)
            continue;
        printf("%-7s %d scores, average %.1f\n", name, count,
               count ? (double)total / count : 0.0);

        /*
         * Show the buffer after strtok: '|' marks each byte that strtok
         * turned into '\0'. Runs of delimiters are skipped, so a token is
         * never empty and not every comma becomes '\0'.
         */
        printf("  before: ");
        for (i = 0; i < len && copy[i] != '\n'; i++)
            putchar(copy[i]);
        printf("\n  after:  ");
        for (i = 0; i < len && copy[i] != '\n'; i++)
            putchar(line[i] == '\0' ? '|' : line[i]);
        printf("\n");
    }

    /*
     * Watch line in See's memory view while stepping: each strtok call
     * plants one more zero byte, and tok's arrow jumps forward.
     */
    printf("%d lines\n", lineno);
    return 0;
}
