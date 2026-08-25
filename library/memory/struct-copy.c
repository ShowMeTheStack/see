/*
 * title: Copying a struct copies its bytes
 * level: 2
 * about: Assigns one struct to another and shows that an array member is copied while a pointer member is shared, so the copies disagree about which changes they see.
 */
#include <stdio.h>
#include <string.h>
#include <stddef.h>

struct player {
    char name[12];       /* the characters live inside the struct */
    const char *team;    /* only an address lives inside the struct */
    int score;
};

int main(void)
{
    char team_name[16];
    /*
     * The initialiser fills name with "Asha" and zeros in the unused bytes,
     * so every byte of a has a known value before it is copied.
     */
    struct player a = { "Asha", NULL, 10 };
    struct player b;

    strcpy(team_name, "Lions");
    a.team = team_name;

    /*
     * One assignment copies every byte of a into b: the 12 name characters,
     * the 4-byte pointer and the score. Step over it and compare a and b
     * in the stack panel: two separate name boxes, but both team arrows
     * point at the same team_name array.
     */
    b = a;

    strcpy(b.name, "Ben");
    b.score = 25;
    printf("a: %-5s %-6s %d\n", a.name, a.team, a.score);
    printf("b: %-5s %-6s %d\n", b.name, b.team, b.score);

    /* Change the shared team name: both see it, because only the pointer was copied. */
    strcpy(team_name, "Tigers");
    printf("after renaming the team:\n");
    printf("a: %-5s %-6s %d\n", a.name, a.team, a.score);
    printf("b: %-5s %-6s %d\n", b.name, b.team, b.score);

    printf("a.name at %p, b.name at %p\n", (void *)a.name, (void *)b.name);
    printf("a.team -> %p, b.team -> %p\n", (void *)a.team, (void *)b.team);

    /*
     * C cannot compare structs with ==, but it can copy, pass and return
     * them by value. Each copy is a shallow copy: pointers are copied,
     * not the things they point to.
     */
    return 0;
}
