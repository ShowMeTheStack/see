/*
 * title: Const defaults, writable settings
 * level: 3
 * about: Starts from a const struct of default settings, copies it, then applies key=value overrides read from input.
 * input: width=120\ncolour=no\nbogus=1\nname=report\ntabs=4
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

struct settings {
    int width;
    int tabs;
    int colour;
    char name[16];
};

/*
 * The defaults are a const object: there is exactly one copy, nobody can
 * spoil it, and any part of the program can start afresh from it.
 */
static const struct settings defaults = { 80, 8, 1, "untitled" };

/* Applies one "key=value" line. line is only read, s is changed. */
int apply(struct settings *s, const char *line)
{
    const char *eq = strchr(line, '=');
    const char *val;
    size_t keylen;

    if (eq == NULL)
        return 0;
    keylen = (size_t)(eq - line);
    val = eq + 1;

    if (keylen == 5 && strncmp(line, "width", 5) == 0)
        s->width = atoi(val);
    else if (keylen == 4 && strncmp(line, "tabs", 4) == 0)
        s->tabs = atoi(val);
    else if (keylen == 6 && strncmp(line, "colour", 6) == 0)
        s->colour = strcmp(val, "yes") == 0;
    else if (keylen == 4 && strncmp(line, "name", 4) == 0) {
        strncpy(s->name, val, sizeof s->name - 1);
        s->name[sizeof s->name - 1] = '\0';
    } else
        return 0;
    return 1;
}

void show(const char *label, const struct settings *s)
{
    printf("%-9s width=%d tabs=%d colour=%s name=%s\n",
           label, s->width, s->tabs, s->colour ? "yes" : "no", s->name);
}

int main(void)
{
    struct settings cur;
    char line[64];

    /*
     * Structure assignment copies every byte of the const defaults into
     * the writable cur. Copying FROM a const object is always fine; it is
     * only writing TO one that is refused:
     *     defaults.width = 100;   error: assignment of read-only member 'width'
     */
    cur = defaults;
    show("defaults", &defaults);

    while (scanf("%63s", line) == 1)
        if (!apply(&cur, line))
            printf("ignored: %s\n", line);

    show("current", &cur);

    /* Resetting is one line, because the original is guaranteed untouched. */
    cur = defaults;
    show("reset", &cur);
    return 0;
}
