/*
 * title: Pointers into the members of a struct
 * level: 3
 * about: Aims pointers at individual fields of a struct and of structs inside an array, and updates them through those pointers.
 */
#include <stdio.h>
#include <string.h>

struct player {
    char name[10];
    int score;
    int lives;
};

/* This function knows nothing about players; it just bumps an int. */
void add(int *counter, int amount)
{
    *counter += amount;
}

int main(void)
{
    struct player team[2];
    struct player *pl;
    int *best;
    char *initial;
    int i;

    strcpy(team[0].name, "Ann"); team[0].score = 0; team[0].lives = 3;
    strcpy(team[1].name, "Bo");  team[1].score = 0; team[1].lives = 3;

    /*
     * &team[1].score is the address of one int inside the second struct.
     * The arrow in See lands in the middle of that struct, not at its start.
     */
    add(&team[1].score, 50);
    add(&team[0].score, 20);
    add(&team[0].lives, -1);

    /* A pointer to the struct, and -> to reach its fields. p->x means (*p).x. */
    pl = &team[0];
    add(&pl->score, 15);

    /* A pointer to the char array field, used like any string. */
    initial = team[1].name;
    *initial = 'J';                   /* "Bo" becomes "Jo" */

    /* Find the larger score and keep a pointer to that field. */
    best = &team[0].score;
    for (i = 1; i < 2; i++)
        if (team[i].score > *best)
            best = &team[i].score;
    *best += 1000;                    /* reward the winner through the pointer */

    for (i = 0; i < 2; i++)
        printf("%-4s score %4d, lives %d\n", team[i].name, team[i].score, team[i].lives);

    /* Field addresses are the struct address plus an offset. */
    printf("offset of score: %ld bytes, of lives: %ld bytes\n",
           (long)((char *)&team[0].score - (char *)&team[0]),
           (long)((char *)&team[0].lives - (char *)&team[0]));
    return 0;
}
