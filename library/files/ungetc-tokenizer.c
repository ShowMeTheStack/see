/*
 * title: Peeking ahead with ungetc
 * level: 3
 * about: Splits a little arithmetic file into numbers, names and operators by reading one character too many and pushing it back with ungetc.
 */
#include <stdio.h>
#include <ctype.h>

/* Read a whole number. We only know the number has ended when we have
   already read the character after it - a space, a '+', anything. That
   character belongs to the next token, so ungetc puts it back on the
   stream and the next fgetc will return it again. */
static long read_number(FILE *fp)
{
    long value = 0;
    int c;

    while ((c = fgetc(fp)) != EOF && isdigit(c))
        value = value * 10 + (c - '0');
    if (c != EOF)
        ungetc(c, fp);      /* one character of push-back is guaranteed */
    return value;
}

static void read_name(FILE *fp, char *buf, int size)
{
    int c, n = 0;

    while ((c = fgetc(fp)) != EOF && (isalnum(c) || c == '_')) {
        if (n < size - 1)
            buf[n++] = (char)c;
    }
    buf[n] = '\0';
    if (c != EOF)
        ungetc(c, fp);
}

int main(void)
{
    FILE *fp;
    int c, next;
    char name[16];
    int tokens = 0;

    fp = fopen("/tmp/expr.txt", "w");
    if (fp == NULL) {
        perror("/tmp/expr.txt");
        return 1;
    }
    fputs("total = price*12 + tax_2 <= 4096\n", fp);
    fclose(fp);

    fp = fopen("/tmp/expr.txt", "r");
    if (fp == NULL) {
        perror("/tmp/expr.txt");
        return 1;
    }

    while ((c = fgetc(fp)) != EOF) {
        if (isspace(c))
            continue;
        tokens++;
        if (isdigit(c)) {
            /* We swallowed the first digit to find out it WAS a digit.
               Give it back so read_number sees the whole number. */
            ungetc(c, fp);
            printf("NUMBER   %ld\n", read_number(fp));
        } else if (isalpha(c)) {
            ungetc(c, fp);
            read_name(fp, name, sizeof name);
            printf("NAME     %s\n", name);
        } else {
            /* Two-character operators like <= need one peek too. */
            next = fgetc(fp);
            if (next == '=' && (c == '<' || c == '>' || c == '=' || c == '!')) {
                printf("OPERATOR %c%c\n", c, next);
            } else {
                if (next != EOF)
                    ungetc(next, fp);
                printf("OPERATOR %c\n", c);
            }
        }
    }
    fclose(fp);
    printf("%d tokens\n", tokens);
    return 0;
}
