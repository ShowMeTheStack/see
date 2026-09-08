/*
 * title: offsetof and a container_of macro
 * level: 4
 * about: Builds an intrusive linked list where the link lives inside each record, and uses offsetof to get from a link back to its record.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stddef.h>
#include <string.h>

/*
 * offsetof(type, member) from <stddef.h> is the number of bytes from
 * the start of a struct to one of its members. Here we use it to walk
 * backwards: given a pointer to a member, subtract the offset and you
 * have a pointer to the whole struct. The Linux kernel calls this
 * container_of.
 */
#define CONTAINER_OF(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

/* A generic link that knows nothing about what it is part of. */
struct link {
    struct link *next;
};

/*
 * The record keeps its link in the middle on purpose, so the offset is
 * not zero and the arithmetic actually has to happen.
 */
struct book {
    char title[24];
    int year;
    struct link node;
    double price;
};

/* Push a link onto the front of a list. Works for any record type. */
static void push(struct link **head, struct link *l)
{
    l->next = *head;
    *head = l;
}

static struct book *new_book(const char *title, int year, double price)
{
    struct book *b = (struct book *)malloc(sizeof *b);
    if (b == NULL)
        return NULL;
    strncpy(b->title, title, sizeof b->title - 1);
    b->title[sizeof b->title - 1] = '\0';
    b->year = year;
    b->price = price;
    b->node.next = NULL;
    return b;
}

int main(void)
{
    struct link *head = NULL;
    struct link *l, *next;
    struct book *b;
    const char *titles[4];
    int years[4], i;
    double prices[4];

    titles[0] = "The C Programming Lang"; years[0] = 1978; prices[0] = 45.00;
    titles[1] = "Expert C Programming";   years[1] = 1994; prices[1] = 38.50;
    titles[2] = "C Traps and Pitfalls";   years[2] = 1989; prices[2] = 29.95;
    titles[3] = "C Interfaces";           years[3] = 1996; prices[3] = 52.00;

    printf("offsetof(struct book, title) = %d\n", (int)offsetof(struct book, title));
    printf("offsetof(struct book, year)  = %d\n", (int)offsetof(struct book, year));
    printf("offsetof(struct book, node)  = %d\n", (int)offsetof(struct book, node));
    printf("offsetof(struct book, price) = %d (a double, aligned to 8)\n",
           (int)offsetof(struct book, price));
    printf("sizeof(struct book) = %d\n", (int)sizeof(struct book));

    for (i = 0; i < 4; i++) {
        b = new_book(titles[i], years[i], prices[i]);
        if (b == NULL)
            return 0;
        push(&head, &b->node);
    }

    /*
     * Watch the heap in See: each list arrow points at the node field,
     * 28 bytes into a book block, not at the block's start. The macro
     * steps back those 28 bytes to reach the title.
     */
    printf("the list, newest first:\n");
    for (l = head; l != NULL; l = l->next) {
        b = CONTAINER_OF(l, struct book, node);
        printf("  %-24s %d  %6.2f\n", b->title, b->year, b->price);
    }

    /* Free every book. Read next before the block holding it is gone. */
    for (l = head; l != NULL; l = next) {
        next = l->next;
        free(CONTAINER_OF(l, struct book, node));
    }
    return 0;
}
