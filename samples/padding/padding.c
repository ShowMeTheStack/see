/* padding.c: why sizeof a struct is more than the sum of its fields.
   Open s in the memory picture and point at the gaps between the fields. */
#include <stdio.h>
#include <stddef.h>

struct sample {
    char c;      /* 1 byte, then 7 bytes of padding so d starts on a multiple of 8 */
    double d;
    short s;     /* 2 bytes, then 6 bytes so the whole struct is a multiple of 8 */
};

struct packed {
    double d;    /* largest first: only 2 bytes of padding at the end */
    short s;
    char c;
};

int main(void)
{
    struct sample s;

    s.c = 'A';
    s.d = 3.5;
    s.s = 7;
    printf("sizeof(struct sample) = %d\n", (int)sizeof(struct sample));
    printf("offsets: c %d, d %d, s %d\n", (int)offsetof(struct sample, c), (int)offsetof(struct sample, d), (int)offsetof(struct sample, s));
    printf("sizeof(struct packed) = %d\n", (int)sizeof(struct packed));
    printf("%c %.1f %d\n", s.c, s.d, s.s);
    return 0;
}
