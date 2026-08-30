/*
 * title: Padding inside structs and offsetof
 * level: 3
 * about: Prints the size and field offsets of differently ordered structs to show where the compiler adds padding, and how reordering fields saves space.
 */
#include <stdio.h>
#include <stddef.h>

/* The same four fields in two orders. On this machine an int must start at a
   multiple of 4 and a double at a multiple of 8, so the compiler inserts
   unused "padding" bytes to line them up. Open each variable in the memory
   picture and look for the gaps between the fields. */
struct careless {
    char tag;      /* offset 0, then 7 bytes of padding */
    double value;  /* offset 8 */
    char flag;     /* offset 16, then 3 bytes of padding */
    int count;     /* offset 20 */
};

struct tidy {
    double value;  /* biggest alignment first */
    int count;
    char tag;
    char flag;     /* then 2 bytes of tail padding to make the size a multiple of 8 */
};

struct small {
    char a;
    char b;
    short s;       /* fits exactly: no padding at all */
};

int main(void)
{
    /* = { 0 } sets every byte, padding included, so nothing in the picture
       is left as "never written". */
    struct careless c = { 0 };
    struct tidy t = { 0 };
    struct small s = { 0 };
    struct careless arr[3];

    c.tag = 'c';
    c.value = 1.5;
    t.tag = 't';
    t.value = 2.5;
    s.a = 'x';

    /* offsetof (from stddef.h) gives the distance in bytes from the start of
       the struct to a field. */
    printf("struct careless: size %2d  tag@%d value@%d flag@%d count@%d\n",
           (int)sizeof c, (int)offsetof(struct careless, tag),
           (int)offsetof(struct careless, value), (int)offsetof(struct careless, flag),
           (int)offsetof(struct careless, count));
    printf("struct tidy:     size %2d  value@%d count@%d tag@%d flag@%d\n",
           (int)sizeof t, (int)offsetof(struct tidy, value),
           (int)offsetof(struct tidy, count), (int)offsetof(struct tidy, tag),
           (int)offsetof(struct tidy, flag));
    printf("struct small:    size %2d  a@%d b@%d s@%d\n", (int)sizeof s,
           (int)offsetof(struct small, a), (int)offsetof(struct small, b),
           (int)offsetof(struct small, s));

    /* The fields add up to 1 + 8 + 1 + 4 = 14 bytes, yet the struct is 24. */
    printf("wasted in careless: %d bytes\n",
           (int)sizeof c - (int)(sizeof c.tag + sizeof c.value + sizeof c.flag + sizeof c.count));

    /* In an array every element starts sizeof bytes after the previous one,
       so the padding is repeated for every element. */
    printf("array of 3 careless: %d bytes, elements %d bytes apart\n",
           (int)sizeof arr, (int)((char *)&arr[1] - (char *)&arr[0]));

    printf("c.tag=%c c.value=%.1f t.tag=%c t.value=%.1f s.a=%c\n",
           c.tag, c.value, t.tag, t.value, s.a);
    return 0;
}
