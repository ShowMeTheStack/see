/*
 * title: A pool allocator with a free list
 * level: 4
 * about: Manages fixed-size nodes inside one malloc'd array, threading the unused ones into a free list so allocating and releasing a node are both a couple of pointer moves.
 */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;   /* in the list we build, or in the free list when unused */
};

struct pool {
    struct node *slots;  /* one malloc'd array of nodes */
    struct node *free;   /* head of the chain of unused nodes */
    int capacity, in_use;
};

static int pool_init(struct pool *p, int capacity)
{
    int i;

    p->slots = malloc(capacity * sizeof *p->slots);
    if (p->slots == NULL)
        return 0;
    /*
     * Thread every slot onto the free list: slot 0 -> 1 -> 2 -> ... -> NULL.
     * The unused nodes store the list in their own next fields, so the
     * bookkeeping costs no extra memory.
     */
    for (i = 0; i < capacity; i++) {
        p->slots[i].value = 0;
        p->slots[i].next = i + 1 < capacity ? &p->slots[i + 1] : NULL;
    }
    p->free = p->slots;
    p->capacity = capacity;
    p->in_use = 0;
    return 1;
}

static struct node *pool_get(struct pool *p)
{
    struct node *n = p->free;
    if (n != NULL) {
        p->free = n->next;   /* pop from the free list */
        p->in_use++;
    }
    return n;
}

static void pool_put(struct pool *p, struct node *n)
{
    n->next = p->free;       /* push back onto the free list */
    p->free = n;
    p->in_use--;
}

static void show(const struct pool *p, const struct node *list)
{
    const struct node *n;
    printf("list:");
    for (n = list; n != NULL; n = n->next)
        printf(" %d[slot %d]", n->value, (int)(n - p->slots));
    printf("   free:");
    for (n = p->free; n != NULL; n = n->next)
        printf(" %d", (int)(n - p->slots));
    printf("   (%d of %d in use)\n", p->in_use, p->capacity);
}

int main(void)
{
    struct pool p;
    struct node *list = NULL, *n, **link;
    int i;

    if (!pool_init(&p, 6))
        return 0;
    show(&p, list);

    /* Push five values onto the front of a list. */
    for (i = 1; i <= 5; i++) {
        n = pool_get(&p);
        n->value = i * 10;
        n->next = list;
        list = n;
    }
    show(&p, list);

    /*
     * Remove the multiples of 20. link points at the pointer that leads
     * to the current node, so unlinking is one assignment.
     */
    link = &list;
    while (*link != NULL) {
        if ((*link)->value % 20 == 0) {
            n = *link;
            *link = n->next;
            pool_put(&p, n);
        } else
            link = &(*link)->next;
    }
    show(&p, list);

    /* New nodes reuse the slots just released, most recent first. */
    for (i = 0; i < 3; i++) {
        n = pool_get(&p);
        if (n == NULL) {
            printf("pool empty\n");
            break;
        }
        n->value = 7 + i;
        n->next = list;
        list = n;
    }
    show(&p, list);

    /* However many nodes are live, they all go with one free. */
    free(p.slots);
    return 0;
}
