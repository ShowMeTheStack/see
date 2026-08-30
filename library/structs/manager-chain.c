/*
 * title: Structs that point to other structs
 * level: 2
 * about: Links employees to their managers with pointers, then walks each chain of command up to the boss and counts direct reports.
 */
#include <stdio.h>

/* A struct may hold a pointer to its own kind. It cannot hold a whole
   struct employee inside itself (that would be infinitely big), but a pointer
   is only 4 bytes. NULL means "no manager": the top of the tree. */
struct employee {
    const char *name;
    const char *role;
    struct employee *manager;
};

void chain_of_command(const struct employee *e)
{
    int depth = 0;
    printf("%s", e->name);
    /* Follow the arrows upward until one is NULL. In the memory picture each
       manager field is an arrow to another box in the same array. */
    while (e->manager != NULL) {
        e = e->manager;
        printf(" -> %s", e->name);
        depth++;
    }
    printf("   (%d level%s)\n", depth, depth == 1 ? "" : "s");
}

int direct_reports(const struct employee *staff, int n, const struct employee *boss)
{
    int i, count = 0;
    for (i = 0; i < n; i++)
        if (staff[i].manager == boss)   /* comparing addresses, not names */
            count++;
    return count;
}

int main(void)
{
    struct employee staff[7];
    int i, n = 7;

    staff[0].name = "Margaret"; staff[0].role = "director";  staff[0].manager = NULL;
    staff[1].name = "Ken";      staff[1].role = "lead";      staff[1].manager = &staff[0];
    staff[2].name = "Barbara";  staff[2].role = "lead";      staff[2].manager = &staff[0];
    staff[3].name = "Dennis";   staff[3].role = "engineer";  staff[3].manager = &staff[1];
    staff[4].name = "Frances";  staff[4].role = "engineer";  staff[4].manager = &staff[1];
    staff[5].name = "John";     staff[5].role = "engineer";  staff[5].manager = &staff[2];
    staff[6].name = "Radia";    staff[6].role = "intern";    staff[6].manager = &staff[5];

    for (i = 0; i < n; i++)
        chain_of_command(&staff[i]);

    printf("\n");
    for (i = 0; i < n; i++)
        printf("%-9s %-9s reports: %d\n", staff[i].name, staff[i].role,
               direct_reports(staff, n, &staff[i]));

    /* Reorganise: Radia moves under Ken. One pointer changes and every
       chain through her follows automatically. */
    staff[6].manager = &staff[1];
    printf("\nafter the reorganisation:\n");
    chain_of_command(&staff[6]);
    printf("Ken now has %d reports, John has %d\n",
           direct_reports(staff, n, &staff[1]), direct_reports(staff, n, &staff[5]));
    return 0;
}
