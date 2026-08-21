/*
 * title: NULL means "no object here"
 * level: 2
 * about: Looks up people by name in a table, returning a pointer to the record or NULL, and checks before every use.
 */
#include <stdio.h>
#include <string.h>

struct person {
    char name[12];
    int age;
};

/*
 * Returns the address of the matching record, or NULL when there is none.
 * NULL is a pointer that is guaranteed not to point at any object.
 */
struct person *lookup(struct person *table, int n, const char *name)
{
    int i;
    if (table == NULL || name == NULL)
        return NULL;                 /* defend against bad callers too */
    for (i = 0; i < n; i++)
        if (strcmp(table[i].name, name) == 0)
            return &table[i];
    return NULL;
}

/* Safe printing: a NULL record is reported, not dereferenced. */
void show(const char *asked, const struct person *p)
{
    if (p == NULL)
        printf("%-6s: nobody by that name\n", asked);
    else
        printf("%-6s: %d years old\n", p->name, p->age);
}

int main(void)
{
    struct person people[3];
    struct person *who;

    strcpy(people[0].name, "Ada");   people[0].age = 36;
    strcpy(people[1].name, "Grace"); people[1].age = 85;
    strcpy(people[2].name, "Linus"); people[2].age = 21;

    show("Grace", lookup(people, 3, "Grace"));
    show("Bob", lookup(people, 3, "Bob"));
    show("x", lookup(NULL, 3, "x"));

    /*
     * The habit to build: test the pointer before following it. Writing
     * who->age when who is NULL would stop the program in See with a
     * NULL dereference, so the test comes first.
     */
    who = lookup(people, 3, "Linus");
    if (who != NULL) {
        who->age++;
        printf("happy birthday, %s: now %d\n", who->name, who->age);
    }

    /* "if (who)" is the short form of "if (who != NULL)". */
    who = lookup(people, 3, "Nobody");
    if (!who)
        printf("lookup failed cleanly, who = %p\n", (void *)who);
    return 0;
}
