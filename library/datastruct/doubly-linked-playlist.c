/*
 * title: A music playlist as a doubly linked list
 * level: 2
 * about: Keeps songs in a doubly linked list with head and tail pointers, and runs next, previous, add, remove and move-to-front commands on it.
 * input: add Blackbird\nadd Yesterday\nadd Imagine\nadd Help\nshow\nnext\nnext\nprev\nremove\nshow\nfront Help\nnext\nshow\nback\nquit\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* With a prev arrow as well as a next arrow, a node can be unlinked knowing
   only the node itself, and the list can be walked in both directions. In the
   memory picture each node has two arrows, one each way. */
struct song {
    char title[24];
    struct song *prev;
    struct song *next;
};

struct playlist {
    struct song *head;
    struct song *tail;
    struct song *current;
    int length;
};

void add_song(struct playlist *p, const char *title)
{
    struct song *s = malloc(sizeof *s);
    if (s == NULL)
        exit(1);
    strncpy(s->title, title, sizeof s->title - 1);
    s->title[sizeof s->title - 1] = '\0';
    s->next = NULL;
    s->prev = p->tail;
    if (p->tail != NULL)
        p->tail->next = s;
    else
        p->head = s;
    p->tail = s;
    if (p->current == NULL)
        p->current = s;
    p->length++;
}

/* Detach s from wherever it is, fixing up the neighbours (or head/tail). */
void unlink_song(struct playlist *p, struct song *s)
{
    if (s->prev) s->prev->next = s->next; else p->head = s->next;
    if (s->next) s->next->prev = s->prev; else p->tail = s->prev;
    s->prev = s->next = NULL;
}

void move_to_front(struct playlist *p, struct song *s)
{
    unlink_song(p, s);
    s->next = p->head;
    if (p->head) p->head->prev = s; else p->tail = s;
    p->head = s;
}

struct song *find(struct playlist *p, const char *title)
{
    struct song *s;
    for (s = p->head; s != NULL; s = s->next)
        if (strcmp(s->title, title) == 0)
            return s;
    return NULL;
}

void show(const struct playlist *p)
{
    const struct song *s;
    printf("playlist (%d):", p->length);
    for (s = p->head; s != NULL; s = s->next)
        printf(s == p->current ? " [%s]" : " %s", s->title);
    printf("\n");
}

void show_backwards(const struct playlist *p)
{
    const struct song *s;
    printf("backwards:");
    for (s = p->tail; s != NULL; s = s->prev)
        printf(" %s", s->title);
    printf("\n");
}

int main(void)
{
    struct playlist p = { NULL, NULL, NULL, 0 };
    char cmd[16], title[24];

    while (scanf("%15s", cmd) == 1) {
        if (strcmp(cmd, "add") == 0 && scanf("%23s", title) == 1) {
            add_song(&p, title);
        } else if (strcmp(cmd, "next") == 0 && p.current) {
            /* Wrap round at the end: the playlist repeats. */
            p.current = p.current->next ? p.current->next : p.head;
            printf("playing %s\n", p.current->title);
        } else if (strcmp(cmd, "prev") == 0 && p.current) {
            p.current = p.current->prev ? p.current->prev : p.tail;
            printf("playing %s\n", p.current->title);
        } else if (strcmp(cmd, "remove") == 0 && p.current) {
            struct song *dead = p.current;
            p.current = dead->next ? dead->next : dead->prev;
            unlink_song(&p, dead);
            printf("removed %s\n", dead->title);
            free(dead);
            p.length--;
        } else if (strcmp(cmd, "front") == 0 && scanf("%23s", title) == 1) {
            struct song *s = find(&p, title);
            if (s) move_to_front(&p, s);
        } else if (strcmp(cmd, "show") == 0) {
            show(&p);
        } else if (strcmp(cmd, "back") == 0) {
            show_backwards(&p);
        } else if (strcmp(cmd, "quit") == 0) {
            break;
        }
    }

    while (p.head != NULL) {
        struct song *next = p.head->next;
        free(p.head);
        p.head = next;
    }
    return 0;
}
