/*
 * title: A safe string builder
 * level: 3
 * about: Wraps a fixed-size buffer in a struct that tracks its length, appends text and numbers safely, and records when output was cut short.
 */
#include <stdio.h>
#include <string.h>

#define CAP 48

/* The buffer travels with its length, so appending never has to search
   for the NUL (unlike strcat), and the capacity is always known. */
struct builder {
    char buf[CAP];
    int len;         /* characters in use, not counting the NUL */
    int truncated;   /* set once anything did not fit */
};

static void sb_init(struct builder *b)
{
    b->buf[0] = '\0';
    b->len = 0;
    b->truncated = 0;
}

/* Copy as much of s as fits, always leaving room for the NUL. */
static void sb_add(struct builder *b, const char *s)
{
    while (*s && b->len < CAP - 1)
        b->buf[b->len++] = *s++;
    b->buf[b->len] = '\0';
    if (*s)
        b->truncated = 1;
}

static void sb_char(struct builder *b, char c)
{
    char two[2];
    two[0] = c;
    two[1] = '\0';
    sb_add(b, two);
}

/* Format a number into a small local array first. An int needs at most
   11 characters ("-2147483648") plus the NUL, so 12 is enough and sprintf
   cannot overrun it. Then append that through the bounded sb_add. */
static void sb_int(struct builder *b, int n)
{
    char tmp[12];
    sprintf(tmp, "%d", n);
    sb_add(b, tmp);
}

int main(void)
{
    struct builder sb;
    const char *items[5] = { "milk", "eggs", "bread", "coffee", "strawberry jam" };
    int qty[5] = { 2, 12, 1, 1, 3 };
    int i;

    /* Step through and watch sb in the stack panel: buf fills from the
       left, len counts up, and the NUL moves along just behind the text. */
    sb_init(&sb);
    sb_add(&sb, "List:");
    for (i = 0; i < 5; i++) {
        sb_char(&sb, ' ');
        sb_int(&sb, qty[i]);
        sb_char(&sb, 'x');
        sb_add(&sb, items[i]);
        sb_char(&sb, i < 4 ? ',' : '.');
    }
    printf("[%s]\n", sb.buf);
    printf("length %d of %d%s\n", sb.len, CAP - 1, sb.truncated ? ", output was cut short" : "");

    sb_init(&sb);
    sb_add(&sb, "Short and sweet.");
    printf("[%s] length %d%s\n", sb.buf, sb.len, sb.truncated ? ", cut short" : "");
    return 0;
}
