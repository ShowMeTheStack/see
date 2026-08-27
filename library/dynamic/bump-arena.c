/*
 * title: A bump arena on one malloc
 * level: 4
 * about: Carves many small allocations of different types out of one big malloc'd block by bumping a pointer, keeps them aligned, and frees everything with a single free.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct arena {
    char *base;     /* the one big block from malloc */
    size_t size;    /* how many bytes it has */
    size_t used;    /* how many are handed out so far */
};

static int arena_init(struct arena *a, size_t size)
{
    a->base = malloc(size);
    a->size = size;
    a->used = 0;
    return a->base != NULL;
}

/*
 * Hand out n bytes. Round the offset up to a multiple of 8 first so any
 * type (doubles included) can live at the returned address. No per-object
 * bookkeeping at all: that is why arenas are fast.
 */
static void *arena_alloc(struct arena *a, size_t n)
{
    size_t start = (a->used + 7) & ~(size_t)7;
    if (start + n > a->size)
        return NULL;
    a->used = start + n;
    return a->base + start;
}

static char *arena_strdup(struct arena *a, const char *s)
{
    char *p = arena_alloc(a, strlen(s) + 1);
    if (p != NULL)
        strcpy(p, s);
    return p;
}

/* Forget everything at once: the memory is reused, not freed. */
static void arena_reset(struct arena *a)
{
    a->used = 0;
}

struct city {
    const char *name;
    double lat, lon;
    struct city *next;
};

int main(void)
{
    static const char *names[] = { "Lisbon", "Oslo", "Nairobi", "Lima", "Hanoi" };
    static const double coords[][2] = {
        { 38.72, -9.14 }, { 59.91, 10.75 }, { -1.29, 36.82 }, { -12.05, -77.04 }, { 21.03, 105.85 }
    };
    struct arena a;
    struct city *head = NULL, *c;
    int i;

    if (!arena_init(&a, 256))
        return 0;

    /*
     * Build a linked list whose nodes and names all come from the arena.
     * The heap panel shows a single block; all the list arrows point into it.
     */
    for (i = 0; i < 5; i++) {
        c = arena_alloc(&a, sizeof *c);
        if (c == NULL)
            break;
        c->name = arena_strdup(&a, names[i]);
        c->lat = coords[i][0];
        c->lon = coords[i][1];
        c->next = head;
        head = c;
        printf("node %-8s at offset %3ld, name at offset %3ld\n", names[i],
               (long)((char *)c - a.base), (long)(c->name - a.base));
    }
    printf("arena: %u of %u bytes used\n\n", (unsigned)a.used, (unsigned)a.size);

    for (c = head; c != NULL; c = c->next)
        printf("%-8s %7.2f %8.2f\n", c->name ? c->name : "?", c->lat, c->lon);

    /* A request that does not fit simply fails; it never touches other memory. */
    printf("\nasking for 500 more bytes: %s\n", arena_alloc(&a, 500) ? "ok" : "refused");

    /*
     * Reset makes all of it available again (every pointer into it is now
     * stale), and one free releases the lot: no walking the list.
     */
    arena_reset(&a);
    head = NULL;
    printf("after reset: %u bytes used\n", (unsigned)a.used);
    free(a.base);
    return 0;
}
