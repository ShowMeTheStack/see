/*
 * title: Hex dump of a struct, padding and all
 * level: 3
 * about: Prints every byte of a struct next to the member it belongs to, so the little-endian ints, the characters and the padding bytes are all visible.
 */
#include <stdio.h>
#include <string.h>
#include <stddef.h>

struct record {
    char  code;      /* offset 0 */
    short year;      /* offset 2, after one byte of padding */
    long  id;        /* offset 4 */
    char  name[5];   /* offset 8 */
    double score;    /* offset 16, after three bytes of padding */
};

/* Which member does byte number off belong to? */
static const char *owner(unsigned off)
{
    if (off < offsetof(struct record, code) + 1) return "code";
    if (off < offsetof(struct record, year)) return "(padding)";
    if (off < offsetof(struct record, year) + 2) return "year";
    if (off < offsetof(struct record, id)) return "(padding)";
    if (off < offsetof(struct record, id) + 4) return "id";
    if (off < offsetof(struct record, name) + 5) return "name";
    if (off < offsetof(struct record, score)) return "(padding)";
    return "score";
}

static void dump(const void *object, unsigned size)
{
    const unsigned char *p = object;
    unsigned i;

    for (i = 0; i < size; i++) {
        printf("%2u: %02x  %-10s", i, p[i], owner(i));
        if (p[i] >= 32 && p[i] < 127)
            printf(" '%c'", p[i]);
        printf("\n");
    }
}

int main(void)
{
    struct record r;

    /*
     * Padding bytes are never written by member assignments, so reading them
     * would be reading uninitialised memory. memset first gives every byte,
     * padding included, a known value. Step over it and see the whole
     * struct turn to zeros.
     */
    memset(&r, 0, sizeof r);

    r.code = 'K';
    r.year = 1989;                 /* 0x07c5: stored as c5 07 */
    r.id = 0x01020304L;            /* stored as 04 03 02 01  */
    strcpy(r.name, "ansi");
    r.score = 1.0;                 /* IEEE 754: 3f f0 00 .. stored backwards */

    printf("sizeof(struct record) = %u\n", (unsigned)sizeof r);
    dump(&r, sizeof r);
    return 0;
}
