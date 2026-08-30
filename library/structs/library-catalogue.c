/*
 * title: Library catalogue on the heap
 * level: 3
 * about: Keeps books with heap-allocated titles in a growing array, lends and returns them to members, and prints who has what.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct member {
    int id;
    char name[12];
};

/* A book points at its title (a heap copy, sized exactly) and at the member
   who borrowed it, or NULL when it is on the shelf. Those borrower arrows are
   the interesting part of the memory picture: they cross from the heap back
   into main's stack frame. */
struct book {
    char *title;
    int year;
    struct member *borrower;
};

struct catalogue {
    struct book *books;   /* heap array, grown with realloc */
    int count;
    int capacity;
};

char *copy_string(const char *s)
{
    char *p = malloc(strlen(s) + 1);
    if (p != NULL)
        strcpy(p, s);
    return p;
}

void add_book(struct catalogue *c, const char *title, int year)
{
    if (c->count == c->capacity) {
        /* Double the capacity. realloc may move the whole array: step over it
           and watch the old block vanish and a bigger one appear. */
        int cap = c->capacity ? c->capacity * 2 : 2;
        struct book *nb = realloc(c->books, cap * sizeof *nb);
        if (nb == NULL)
            return;
        c->books = nb;
        c->capacity = cap;
        printf("(catalogue grown to %d slots)\n", cap);
    }
    c->books[c->count].title = copy_string(title);
    c->books[c->count].year = year;
    c->books[c->count].borrower = NULL;
    c->count++;
}

struct book *find(struct catalogue *c, const char *word)
{
    int i;
    for (i = 0; i < c->count; i++)
        if (strstr(c->books[i].title, word) != NULL)
            return &c->books[i];
    return NULL;
}

void lend(struct catalogue *c, const char *word, struct member *m)
{
    struct book *b = find(c, word);
    if (b == NULL)
        printf("%s asks for \"%s\": not in the catalogue\n", m->name, word);
    else if (b->borrower != NULL)
        printf("%s asks for %s: already with %s\n", m->name, b->title, b->borrower->name);
    else {
        b->borrower = m;
        printf("%s borrows %s\n", m->name, b->title);
    }
}

void give_back(struct catalogue *c, const char *word)
{
    struct book *b = find(c, word);
    if (b != NULL && b->borrower != NULL) {
        printf("%s returns %s\n", b->borrower->name, b->title);
        b->borrower = NULL;
    }
}

void report(const struct catalogue *c)
{
    int i;
    printf("-- catalogue --\n");
    for (i = 0; i < c->count; i++) {
        const struct book *b = &c->books[i];
        printf("  %-32s %d  %s\n", b->title, b->year,
               b->borrower ? b->borrower->name : "(on shelf)");
    }
}

int main(void)
{
    struct member people[2] = { { 1, "Priya" }, { 2, "Tom" } };
    struct catalogue cat = { NULL, 0, 0 };
    int i;

    add_book(&cat, "The C Programming Language", 1978);
    add_book(&cat, "Structure and Interpretation", 1985);
    add_book(&cat, "The Art of Computer Programming", 1968);
    add_book(&cat, "Godel, Escher, Bach", 1979);
    add_book(&cat, "Programming Pearls", 1986);

    lend(&cat, "Pearls", &people[0]);
    lend(&cat, "C Programming", &people[1]);
    lend(&cat, "Pearls", &people[1]);
    lend(&cat, "Dragon", &people[0]);
    report(&cat);

    give_back(&cat, "Pearls");
    lend(&cat, "Pearls", &people[1]);
    report(&cat);

    /* Free in the right order: every title first, then the array that held
       the pointers to them. Freeing the array first would lose the titles. */
    for (i = 0; i < cat.count; i++)
        free(cat.books[i].title);
    free(cat.books);
    return 0;
}
