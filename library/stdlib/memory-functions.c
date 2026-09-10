/*
 * title: memcpy, memmove, memset and memcmp on raw bytes
 * level: 2
 * about: Inserts into and deletes from an array with memmove, clears with memset, copies structs with memcpy and compares buffers with memcmp.
 */
#include <stdio.h>
#include <string.h>

struct pixel {
    unsigned char r, g, b, a;
};

static void show(const char *label, const int *a, int n)
{
    int i;
    printf("%-18s", label);
    for (i = 0; i < n; i++)
        printf(" %2d", a[i]);
    printf("\n");
}

int main(void)
{
    int list[10];
    int n = 6, i;
    struct pixel p1, p2;
    unsigned char raw[8];

    for (i = 0; i < n; i++)
        list[i] = (i + 1) * 10;
    show("start", list, n);

    /*
     * Insert 25 at index 2. Elements 2..5 must move one place right.
     * The source and destination overlap, so memcpy is not allowed
     * here: memmove is the one that copies as if through a temporary.
     * Counts are in BYTES, hence the sizeof.
     */
    memmove(&list[3], &list[2], (n - 2) * sizeof list[0]);
    list[2] = 25;
    n++;
    show("insert 25 at 2", list, n);

    /* Delete index 0: everything shifts one place left. */
    memmove(&list[0], &list[1], (n - 1) * sizeof list[0]);
    n--;
    show("delete index 0", list, n);

    /*
     * memset fills bytes, not ints. Zero works for ints because an int
     * of all-zero bytes is 0. memset(list, 1, ...) would NOT give ones:
     * each int would become 0x01010101.
     */
    memset(list, 0, sizeof list);
    show("memset to 0", list, 4);
    memset(list, 1, 2 * sizeof list[0]);
    printf("memset to byte 1:  %d (0x%08X)\n", list[0], (unsigned)list[0]);

    /* memcpy copies a whole struct, the same as p2 = p1 would. */
    p1.r = 255; p1.g = 128; p1.b = 0; p1.a = 255;
    memcpy(&p2, &p1, sizeof p2);
    printf("p2 = (%d, %d, %d, %d)\n", p2.r, p2.g, p2.b, p2.a);

    /* memcmp compares byte by byte, like strcmp but without stopping
       at a zero byte. */
    printf("memcmp(p1, p2) = %d\n", memcmp(&p1, &p2, sizeof p1));
    p2.b = 1;
    printf("after p2.b = 1: memcmp says p1 is %s\n",
           memcmp(&p1, &p2, sizeof p1) < 0 ? "smaller" : "not smaller");

    /* Raw bytes may contain zeros; string functions would stop there. */
    memset(raw, 0, sizeof raw);
    raw[5] = 'x';
    printf("strlen sees %d bytes, memchr finds 'x' at %d\n",
           (int)strlen((char *)raw), (int)((unsigned char *)memchr(raw, 'x', sizeof raw) - raw));

    /*
     * Watch list in See's memory view during the memmove calls: a whole
     * run of 4-byte cells slides by one cell in a single step.
     */
    return 0;
}
