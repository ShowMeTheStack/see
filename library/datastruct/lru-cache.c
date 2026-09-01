/*
 * title: An LRU cache from a hash table and a doubly linked list
 * level: 4
 * about: Caches slow square-root lookups in a fixed-size least-recently-used cache, combining a chained hash table for finding entries with a doubly linked list for their age.
 * input: 16 25 16 81 49 25 100 25 49 16 4 25 36 100\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define CAPACITY 4
#define BUCKETS 7

/* Every cached entry sits in two structures at once:
   - a hash chain (hnext), so get() finds a key without scanning;
   - a recency list (prev/next), most recently used at the front.
   On a hit the entry moves to the front; when the cache is full the entry at
   the back (least recently used) is evicted. Both operations are O(1).
   In the memory picture each node has three outgoing arrows. */
struct entry {
    int key;
    double value;
    struct entry *prev, *next;   /* recency list */
    struct entry *hnext;         /* hash chain */
};

struct cache {
    struct entry *bucket[BUCKETS];
    struct entry *front, *back;
    int size;
    int hits, misses;
};

void list_remove(struct cache *c, struct entry *e)
{
    if (e->prev) e->prev->next = e->next; else c->front = e->next;
    if (e->next) e->next->prev = e->prev; else c->back = e->prev;
}

void list_push_front(struct cache *c, struct entry *e)
{
    e->prev = NULL;
    e->next = c->front;
    if (c->front) c->front->prev = e; else c->back = e;
    c->front = e;
}

void hash_remove(struct cache *c, struct entry *e)
{
    struct entry **pp = &c->bucket[e->key % BUCKETS];
    while (*pp != e)
        pp = &(*pp)->hnext;
    *pp = e->hnext;
}

/* Pretend this is expensive, like a disk read or a network call. */
double slow_compute(int key)
{
    return sqrt((double)key);
}

double get(struct cache *c, int key)
{
    struct entry *e;
    for (e = c->bucket[key % BUCKETS]; e != NULL; e = e->hnext)
        if (e->key == key) {
            c->hits++;
            list_remove(c, e);           /* used just now: move to front */
            list_push_front(c, e);
            printf("%4d hit   ", key);
            return e->value;
        }

    c->misses++;
    if (c->size == CAPACITY) {
        /* Evict the least recently used entry and reuse its memory. */
        e = c->back;
        printf("%4d miss, evict %3d ", key, e->key);
        list_remove(c, e);
        hash_remove(c, e);
    } else {
        e = malloc(sizeof *e);
        if (e == NULL)
            exit(1);
        c->size++;
        printf("%4d miss  ", key);
    }
    e->key = key;
    e->value = slow_compute(key);
    e->hnext = c->bucket[key % BUCKETS];
    c->bucket[key % BUCKETS] = e;
    list_push_front(c, e);
    return e->value;
}

void show(const struct cache *c)
{
    const struct entry *e;
    printf("  [");
    for (e = c->front; e != NULL; e = e->next)
        printf(e == c->front ? "%d" : " %d", e->key);
    printf("]\n");
}

int main(void)
{
    struct cache c;
    struct entry *e;
    int i, key;

    for (i = 0; i < BUCKETS; i++)
        c.bucket[i] = NULL;
    c.front = c.back = NULL;
    c.size = c.hits = c.misses = 0;

    while (scanf("%d", &key) == 1) {
        double v = get(&c, key);
        printf("sqrt = %-5g", v);
        show(&c);
    }
    printf("%d hits, %d misses\n", c.hits, c.misses);

    /* Every entry is on the recency list, so walking it frees them all. */
    while (c.front != NULL) {
        e = c.front;
        c.front = e->next;
        free(e);
    }
    return 0;
}
