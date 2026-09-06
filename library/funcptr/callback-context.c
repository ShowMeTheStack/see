/*
 * title: Callbacks with a context pointer
 * level: 3
 * about: Walks a linked list with a for_each that passes a void pointer of user data to every callback, so one walker can count, total, find and collect.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct city {
    const char *name;
    long people;
    struct city *next;
};

/*
 * The callback gets the item and a void pointer chosen by whoever
 * called for_each. That pointer is the callback's "context": it can
 * point at a counter, a struct of results, anything. Returning nonzero
 * stops the walk early.
 */
typedef int (*visitor)(struct city *c, void *ctx);

void for_each(struct city *head, visitor v, void *ctx)
{
    struct city *c;
    for (c = head; c != NULL; c = c->next)
        if (v(c, ctx))
            break;
}

/* Context: a plain long. */
int add_people(struct city *c, void *ctx)
{
    long *total = ctx;
    *total += c->people;
    return 0;
}

/* Context: a struct with a threshold in and a count out. */
struct over_query {
    long threshold;
    int count;
};
int count_over(struct city *c, void *ctx)
{
    struct over_query *q = ctx;
    if (c->people > q->threshold)
        q->count++;
    return 0;
}

/* Context: a name to look for and a place to put the answer. */
struct find_query {
    const char *name;
    struct city *found;
};
int find_name(struct city *c, void *ctx)
{
    struct find_query *q = ctx;
    if (strcmp(c->name, q->name) == 0) {
        q->found = c;
        return 1;           /* stop: no need to look further */
    }
    return 0;
}

int print_city(struct city *c, void *ctx)
{
    printf("  %-10s %8ld\n", c->name, c->people);
    (void)ctx;              /* this callback needs no context */
    return 0;
}

struct city *push(struct city *head, const char *name, long people)
{
    struct city *c = malloc(sizeof *c);
    if (c == NULL)
        return head;
    c->name = name;
    c->people = people;
    c->next = head;
    return c;
}

int main(void)
{
    struct city *list = NULL, *next;
    long total = 0;
    struct over_query over;
    struct find_query find;

    list = push(list, "Reykjavik", 139000L);
    list = push(list, "Oslo", 709000L);
    list = push(list, "Tallinn", 454000L);
    list = push(list, "Valletta", 5800L);
    list = push(list, "Lisbon", 545000L);

    printf("cities:\n");
    for_each(list, print_city, NULL);

    for_each(list, add_people, &total);
    printf("total people: %ld\n", total);

    over.threshold = 400000L;
    over.count = 0;
    for_each(list, count_over, &over);
    printf("cities over %ld: %d\n", over.threshold, over.count);

    /*
     * In See, step into for_each here: ctx is a void pointer whose
     * arrow leads back into main's frame, to the find struct.
     */
    find.name = "Tallinn";
    find.found = NULL;
    for_each(list, find_name, &find);
    if (find.found != NULL)
        printf("found %s with %ld people\n", find.found->name, find.found->people);

    while (list != NULL) {
        next = list->next;
        free(list);
        list = next;
    }
    return 0;
}
