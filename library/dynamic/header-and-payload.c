/*
 * title: A header and its data in one block
 * level: 4
 * about: Stores a length-prefixed string as a small header struct followed directly by its characters in a single malloc, the way many real libraries lay out their strings.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
 * The header sits at the start of the block and the characters follow it.
 * (hdr + 1) is the first byte after the header: pointer arithmetic on a
 * struct pointer steps by sizeof(struct header).
 */
struct header {
    size_t length;
    size_t capacity;
};

typedef char *lstr;   /* points at the characters; the header is just before them */

static struct header *head_of(lstr s)
{
    return (struct header *)s - 1;
}

static lstr lstr_new(const char *text, size_t capacity)
{
    size_t len = strlen(text);
    struct header *h;
    lstr s;

    if (capacity < len)
        capacity = len;
    h = malloc(sizeof *h + capacity + 1);
    if (h == NULL)
        return NULL;
    h->length = len;
    h->capacity = capacity;
    s = (char *)(h + 1);
    memcpy(s, text, len + 1);
    return s;
}

static size_t lstr_len(lstr s) { return head_of(s)->length; }

/* Append if it fits; returns 0 if it would overflow the capacity. */
static int lstr_append(lstr s, const char *more)
{
    struct header *h = head_of(s);
    size_t n = strlen(more);
    if (h->length + n > h->capacity)
        return 0;
    memcpy(s + h->length, more, n + 1);
    h->length += n;
    return 1;
}

/* The block started at the header, so that is the address to free. */
static void lstr_free(lstr s)
{
    if (s != NULL)
        free(head_of(s));
}

int main(void)
{
    lstr s = lstr_new("block", 20);

    if (s == NULL)
        return 0;

    /*
     * In the heap panel there is one block, but s points 8 bytes into it,
     * past the header. Passing s itself to free would be an error that See
     * catches: free wants the exact address malloc returned.
     */
    printf("header at %p, characters at %p (%u bytes apart)\n",
           (void *)head_of(s), (void *)s, (unsigned)sizeof(struct header));
    printf("\"%s\" length %u, capacity %u\n", s, (unsigned)lstr_len(s), (unsigned)head_of(s)->capacity);

    lstr_append(s, " and ");
    lstr_append(s, "header");
    printf("\"%s\" length %u\n", s, (unsigned)lstr_len(s));
    printf("append \" overflow\": %s\n", lstr_append(s, " overflow") ? "ok" : "refused, no room");

    /* Length is stored, so it costs nothing to ask, and s still works with printf. */
    lstr_free(s);
    return 0;
}
