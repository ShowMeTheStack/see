/*
 * title: A growing table of records, sorted two ways
 * level: 3
 * about: Reads student records into a heap array of structs that grows with realloc, then sorts it with qsort by name and by mark.
 * input: Priya 82\nTom 67\nAmara 91\nLiu 74\nJonas 67\nSofia 88\nKwame 59
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct student {
    char name[16];
    int mark;
};

static int by_name(const void *a, const void *b)
{
    const struct student *x = a, *y = b;
    return strcmp(x->name, y->name);
}

/* Highest mark first; ties broken by name so the order is fully determined. */
static int by_mark(const void *a, const void *b)
{
    const struct student *x = a, *y = b;
    if (x->mark != y->mark)
        return y->mark - x->mark;
    return strcmp(x->name, y->name);
}

static void print_all(const char *heading, const struct student *s, int n)
{
    int i;
    printf("%s\n", heading);
    for (i = 0; i < n; i++)
        printf("  %-8s %3d\n", s[i].name, s[i].mark);
}

int main(void)
{
    struct student *list = NULL, *bigger;
    struct student one;
    int n = 0, cap = 0;

    /*
     * Read into a local struct first and copy it in only when the whole
     * record was read. memset gives the unused end of the name a value too,
     * so the struct copy below copies no uninitialised bytes.
     */
    memset(&one, 0, sizeof one);
    while (scanf("%15s %d", one.name, &one.mark) == 2) {
        if (n == cap) {
            cap = cap ? cap * 2 : 2;
            bigger = realloc(list, cap * sizeof *list);
            if (bigger == NULL)
                break;
            list = bigger;
        }
        list[n++] = one;
        memset(&one, 0, sizeof one);
    }

    /*
     * qsort only needs the start, the count and the size of one element. It
     * shuffles whole 20-byte structs around inside the heap block.
     */
    qsort(list, n, sizeof *list, by_name);
    print_all("by name:", list, n);
    qsort(list, n, sizeof *list, by_mark);
    print_all("by mark:", list, n);

    free(list);
    return 0;
}
