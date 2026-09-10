/*
 * title: Title case, shouting and a checksum with toupper and tolower
 * level: 1
 * about: Converts each input line to title case, upper case and lower case, and turns digits into numbers with c - '0'.
 * input: the c programming LANGUAGE\nhello, world 2024\nmcDONALD had 3 farms\n
 */
#include <stdio.h>
#include <ctype.h>
#include <string.h>

static void title_case(char *s)
{
    int start = 1;     /* is the next letter the start of a word? */
    for (; *s; s++) {
        unsigned char u = (unsigned char)*s;
        if (isalpha(u)) {
            *s = (char)(start ? toupper(u) : tolower(u));
            start = 0;
        } else {
            start = 1;
        }
    }
}

static void all_upper(char *s)
{
    /* toupper leaves anything that is not a lower-case letter alone,
       so no test is needed first. */
    for (; *s; s++)
        *s = (char)toupper((unsigned char)*s);
}

static int digit_sum(const char *s)
{
    int sum = 0;
    for (; *s; s++)
        if (isdigit((unsigned char)*s))
            sum += *s - '0';   /* '0'..'9' are guaranteed to be consecutive */
    return sum;
}

int main(void)
{
    char line[64];
    char work[64];
    size_t n;

    while (fgets(line, sizeof line, stdin) != NULL) {
        n = strlen(line);
        if (n > 0 && line[n - 1] == '\n')
            line[n - 1] = '\0';

        printf("original: %s\n", line);
        strcpy(work, line);
        title_case(work);
        printf("  title:  %s\n", work);
        all_upper(work);
        printf("  upper:  %s\n", work);
        printf("  digits add up to %d\n", digit_sum(line));
    }

    /*
     * Step through title_case in See: s is a pointer walking along work
     * one byte at a time, and you can watch each letter change in place
     * in main's frame.
     */
    return 0;
}
