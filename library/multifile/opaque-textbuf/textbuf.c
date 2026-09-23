/* textbuf.c - the one file that knows what a textbuf looks like. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "textbuf.h"

/* The complete type. Its fields are private to this file. */
struct textbuf {
    char *data;     /* heap block holding the characters and a '\0' */
    size_t len;     /* characters in use, not counting the '\0' */
    size_t cap;     /* bytes in the data block */
};

/* Module state, set up by textbuf_init. */
static int initialised = 0;
static size_t first_capacity;
static int live_buffers;
static int total_grows;

void textbuf_init(void)
{
    first_capacity = 4;     /* small on purpose, so you can watch it grow */
    live_buffers = 0;
    total_grows = 0;
    initialised = 1;
}

TextBuf *textbuf_new(void)
{
    TextBuf *tb;

    if (!initialised) {
        printf("textbuf_new: call textbuf_init first\n");
        return NULL;
    }
    /* Two heap blocks: the small struct, and the character block it points to. */
    tb = malloc(sizeof *tb);
    if (tb == NULL) {
        return NULL;
    }
    tb->data = malloc(first_capacity);
    if (tb->data == NULL) {
        free(tb);
        return NULL;
    }
    memset(tb->data, 0, first_capacity);
    tb->len = 0;
    tb->cap = first_capacity;
    live_buffers++;
    return tb;
}

void textbuf_free(TextBuf *tb)
{
    if (tb == NULL) {
        return;
    }
    free(tb->data);
    free(tb);
    live_buffers--;
}

/* Make room for at least need bytes, doubling so that appending n
 * characters one by one costs only about log2(n) reallocations. */
static int reserve(TextBuf *tb, size_t need)
{
    size_t cap = tb->cap;
    char *p;

    if (need <= cap) {
        return 1;
    }
    while (cap < need) {
        cap *= 2;
    }
    /* Step over the realloc in See: the old block disappears and a bigger
     * one appears; tb->data's arrow moves to it. */
    p = realloc(tb->data, cap);
    if (p == NULL) {
        return 0;
    }
    /* Zero the new, unused tail. Nothing reads it, but it keeps the block
     * tidy in the memory picture instead of full of leftover garbage. */
    memset(p + tb->cap, 0, cap - tb->cap);
    tb->data = p;
    tb->cap = cap;
    total_grows++;
    return 1;
}

int textbuf_append(TextBuf *tb, const char *s)
{
    size_t n = strlen(s);

    if (!reserve(tb, tb->len + n + 1)) {
        return 0;
    }
    memcpy(tb->data + tb->len, s, n + 1);
    tb->len += n;
    return 1;
}

int textbuf_append_char(TextBuf *tb, char c)
{
    if (!reserve(tb, tb->len + 2)) {
        return 0;
    }
    tb->data[tb->len] = c;
    tb->len++;
    tb->data[tb->len] = '\0';
    return 1;
}

size_t textbuf_length(const TextBuf *tb)
{
    return tb->len;
}

const char *textbuf_text(const TextBuf *tb)
{
    return tb->data;
}

void textbuf_stats(void)
{
    printf("live buffers: %d, grows so far: %d\n", live_buffers, total_grows);
}
