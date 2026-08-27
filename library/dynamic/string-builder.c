/*
 * title: A string builder that grows
 * level: 3
 * about: Implements a small string builder with append, append-number and append-char operations on a buffer that grows as needed, and uses it to build a CSV line and a bar chart.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct sb {
    char *data;     /* always '\0'-terminated */
    size_t len;     /* characters in use, not counting the '\0' */
    size_t cap;     /* bytes allocated */
};

static int sb_init(struct sb *b)
{
    b->cap = 8;
    b->len = 0;
    /* calloc keeps every spare byte defined, which See likes when realloc copies them. */
    b->data = calloc(b->cap, 1);
    return b->data != NULL;
}

/* Make sure there is room for extra more characters plus the '\0'. */
static int sb_reserve(struct sb *b, size_t extra)
{
    size_t need = b->len + extra + 1;
    size_t newcap = b->cap;
    char *bigger;

    if (need <= b->cap)
        return 1;
    while (newcap < need)
        newcap *= 2;
    bigger = realloc(b->data, newcap);
    if (bigger == NULL)
        return 0;
    memset(bigger + b->cap, 0, newcap - b->cap);
    printf("  [grow %u -> %u bytes]\n", (unsigned)b->cap, (unsigned)newcap);
    b->data = bigger;
    b->cap = newcap;
    return 1;
}

static void sb_add(struct sb *b, const char *s)
{
    size_t n = strlen(s);
    if (!sb_reserve(b, n))
        return;
    memcpy(b->data + b->len, s, n + 1);   /* + 1 copies the '\0' too */
    b->len += n;
}

static void sb_addc(struct sb *b, char c)
{
    if (!sb_reserve(b, 1))
        return;
    b->data[b->len++] = c;
    b->data[b->len] = '\0';
}

static void sb_addint(struct sb *b, long v)
{
    char digits[16];
    sprintf(digits, "%ld", v);    /* a long never needs more than 12 characters */
    sb_add(b, digits);
}

/* Hand the finished string to the caller, who now owns it. */
static char *sb_finish(struct sb *b)
{
    char *s = b->data;
    b->data = NULL;
    b->len = b->cap = 0;
    return s;
}

int main(void)
{
    static const char *fruit[] = { "apples", "pears", "plums", "figs" };
    static const int sold[] = { 12, 7, 15, 3 };
    struct sb b;
    char *csv;
    int i, k;

    if (!sb_init(&b))
        return 0;
    for (i = 0; i < 4; i++) {
        if (i > 0)
            sb_addc(&b, ',');
        sb_add(&b, fruit[i]);
        sb_addc(&b, '=');
        sb_addint(&b, sold[i]);
    }
    csv = sb_finish(&b);
    printf("csv: %s\n\n", csv);

    /* The same builder, reused for a bar chart with one line per fruit. */
    if (!sb_init(&b)) {
        free(csv);
        return 0;
    }
    for (i = 0; i < 4; i++) {
        sb_add(&b, fruit[i]);
        sb_add(&b, ": ");
        for (k = 0; k < sold[i]; k++)
            sb_addc(&b, '#');
        sb_addc(&b, '\n');
    }
    printf("%s", b.data);
    printf("chart is %u characters in a %u-byte buffer\n", (unsigned)b.len, (unsigned)b.cap);

    free(b.data);
    free(csv);
    return 0;
}
