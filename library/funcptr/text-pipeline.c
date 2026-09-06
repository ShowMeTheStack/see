/*
 * title: A text pipeline of filter functions
 * level: 3
 * about: Passes each input line through a chain of character filters chosen at run time from a table, like a Unix pipeline built from function pointers.
 * input: trim upper squeeze\n   Hello,   wonderful    world!   \nno-vowels reverse\nfunction pointers are fun
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define LINE 120
#define MAXSTAGES 6

/* Every stage rewrites the string in place. */
typedef void (*stage)(char *s);

void upper(char *s)  { for (; *s; s++) *s = (char)toupper((unsigned char)*s); }
void lower(char *s)  { for (; *s; s++) *s = (char)tolower((unsigned char)*s); }

void reverse(char *s)
{
    char *e = s + strlen(s), t;
    while (s < --e) {           /* two pointers walking towards each other */
        t = *s; *s = *e; *e = t;
        s++;
    }
}

/* Remove leading and trailing blanks by shifting the text left. */
void trim(char *s)
{
    char *start = s, *end;
    while (*start == ' ')
        start++;
    memmove(s, start, strlen(start) + 1);   /* overlapping copy: memmove, not memcpy */
    end = s + strlen(s);
    while (end > s && end[-1] == ' ')
        *--end = '\0';
}

/* Collapse runs of spaces into one: a read pointer and a write pointer. */
void squeeze(char *s)
{
    char *r = s, *w = s;
    for (; *r; r++)
        if (!(*r == ' ' && w > s && w[-1] == ' '))
            *w++ = *r;
    *w = '\0';
}

void no_vowels(char *s)
{
    char *w = s;
    for (; *s; s++)
        if (strchr("aeiouAEIOU", *s) == NULL)
            *w++ = *s;
    *w = '\0';
}

struct named_stage {
    const char *name;
    stage fn;
};

const struct named_stage available[] = {
    { "upper", upper }, { "lower", lower }, { "reverse", reverse },
    { "trim", trim }, { "squeeze", squeeze }, { "no-vowels", no_vowels }
};
#define NAVAILABLE ((int)(sizeof available / sizeof available[0]))

/* Look a stage up by name; returns a null pointer if there is none. */
stage find_stage(const char *name)
{
    int i;
    for (i = 0; i < NAVAILABLE; i++)
        if (strcmp(available[i].name, name) == 0)
            return available[i].fn;
    return NULL;
}

int read_line(char *buf, int size)
{
    int c, n = 0;
    while ((c = getchar()) != EOF && c != '\n')
        if (n < size - 1)
            buf[n++] = (char)c;
    buf[n] = '\0';
    return c != EOF || n > 0;
}

int main(void)
{
    char spec[LINE], text[LINE];
    stage pipeline[MAXSTAGES];
    int nstages, i;
    char *word;

    /* Input comes in pairs: a line naming the stages, then the text. */
    while (read_line(spec, sizeof spec) && read_line(text, sizeof text)) {
        nstages = 0;
        for (word = strtok(spec, " "); word != NULL && nstages < MAXSTAGES;
             word = strtok(NULL, " ")) {
            pipeline[nstages] = find_stage(word);
            if (pipeline[nstages] == NULL)
                printf("(no stage called %s, skipped)\n", word);
            else
                nstages++;
        }

        printf("in:  [%s]\n", text);
        /* Run the stages in order; each sees the previous one's output. */
        for (i = 0; i < nstages; i++)
            pipeline[i](text);
        printf("out: [%s]\n", text);
    }
    return 0;
}
