/*
 * title: Handing out a read-only view
 * level: 3
 * about: Keeps a growing heap array private to a small module and lets the rest of the program look at it only through a const pointer.
 */
#include <stdio.h>
#include <stdlib.h>

/*
 * The "owner" of the numbers. Only these functions change the buffer;
 * everyone else gets const int *, which lets them read but not scribble.
 */
struct log {
    int *items;
    int count;
    int cap;
};

int log_add(struct log *lg, int value)
{
    if (lg->count == lg->cap) {
        int newcap = lg->cap ? lg->cap * 2 : 2;
        int *bigger = realloc(lg->items, newcap * sizeof *bigger);
        if (bigger == NULL)
            return 0;
        lg->items = bigger;        /* the block may have moved: watch the arrow on the heap */
        lg->cap = newcap;
    }
    lg->items[lg->count++] = value;
    return 1;
}

/* The view: a const pointer to the data and its length. */
const int *log_view(const struct log *lg, int *count)
{
    *count = lg->count;
    return lg->items;
}

/* A reader. It cannot change the log even by accident. */
int largest_jump(const int *v, int n)
{
    int i, best = 0, d;
    for (i = 1; i < n; i++) {
        d = v[i] - v[i - 1];
        if (d < 0) d = -d;
        if (d > best) best = d;
    }
    /* v[0] = 0;   error: assignment of read-only location 'v[0]' */
    return best;
}

int main(void)
{
    struct log lg;
    const int *view;
    int n, i;
    int readings[7];

    lg.items = NULL; lg.count = 0; lg.cap = 0;
    readings[0] = 20; readings[1] = 22; readings[2] = 21; readings[3] = 30;
    readings[4] = 29; readings[5] = 18; readings[6] = 19;

    /* Step over each log_add and watch the heap block grow from 2 to 4 to 8 ints. */
    for (i = 0; i < 7; i++)
        log_add(&lg, readings[i]);

    view = log_view(&lg, &n);
    printf("%d readings:", n);
    for (i = 0; i < n; i++)
        printf(" %d", view[i]);
    printf("\nlargest jump: %d\n", largest_jump(view, n));

    /*
     * A const view is only as fresh as the block it points at. After
     * another log_add, realloc may move the block and leave view dangling,
     * so ask for a new view instead of keeping the old one.
     */
    log_add(&lg, 25);
    view = log_view(&lg, &n);
    printf("after one more: %d readings, last %d\n", n, view[n - 1]);

    free(lg.items);
    return 0;
}
