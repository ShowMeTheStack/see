/*
 * title: Struct padding and offsetof
 * level: 3
 * about: Uses offsetof to find the holes the compiler leaves inside structs, then reorders the members to make the same struct smaller.
 */
#include <stdio.h>
#include <stddef.h>

/* Members in a careless order: char, double, char, int, char. */
struct careless {
    char tag;
    double value;
    char flag;
    int count;
    char last;
};

/* The same members, biggest alignment first. */
struct tidy {
    double value;
    int count;
    char tag;
    char flag;
    char last;
};

#define FIELD(type, m) \
    printf("  %-6s offset %2u  size %u\n", #m, \
           (unsigned)offsetof(struct type, m), (unsigned)sizeof(((struct type *)0)->m))

int main(void)
{
    struct careless c;
    struct tidy t;

    /*
     * A double must start at an address that is a multiple of 8 on this
     * machine, an int at a multiple of 4. To keep that true for every member,
     * the compiler inserts unused bytes (padding) between members, and at the
     * end so that the next element of an array is aligned too.
     */
    printf("struct careless, %u bytes:\n", (unsigned)sizeof c);
    FIELD(careless, tag);
    FIELD(careless, value);
    FIELD(careless, flag);
    FIELD(careless, count);
    FIELD(careless, last);

    printf("struct tidy, %u bytes:\n", (unsigned)sizeof t);
    FIELD(tidy, value);
    FIELD(tidy, count);
    FIELD(tidy, tag);
    FIELD(tidy, flag);
    FIELD(tidy, last);

    printf("useful bytes in both: %u\n",
           (unsigned)(sizeof(double) + sizeof(int) + 3 * sizeof(char)));
    printf("an array of 1000 would waste %u bytes careless, %u bytes tidy\n",
           (unsigned)(1000 * (sizeof c - 15)), (unsigned)(1000 * (sizeof t - 15)));

    /*
     * Give both a value and look at them in the stack panel: the careless
     * one has visible gaps between its members.
     */
    c.tag = 'c'; c.value = 1.5; c.flag = 1; c.count = 3; c.last = 'z';
    t.tag = 't'; t.value = 2.5; t.flag = 0; t.count = 4; t.last = 'z';
    printf("%c %.1f %d %d %c | %c %.1f %d %d %c\n",
           c.tag, c.value, c.flag, c.count, c.last,
           t.tag, t.value, t.flag, t.count, t.last);
    return 0;
}
