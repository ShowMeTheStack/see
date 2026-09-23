/*
 * title: A tiny text adventure in three files
 * level: 3
 * about: Explores a five-room castle from typed commands, picking up a key to open the locked treasury.
 * input: look\nnorth\ntake lamp\nnorth\nwest\nsouth\neast\ntake key\nwest\nnorth\nwest\ninv\ntake crown\n
 */

/* world.c builds the map, player.c moves the player, main.c reads
 * commands. See compiles the three .c files separately and links them.
 * The game ends when the crown is taken, or when the commands run out. */
#include <stdio.h>
#include <string.h>
#include "world.h"
#include "player.h"

int main(void)
{
    struct player p;
    char line[64];
    char verb[16], noun[16];
    int n, d;

    player_start(&p, world_build());
    player_look(&p);

    while (!p.carrying[2] && fgets(line, sizeof line, stdin) != NULL) {
        noun[0] = '\0';
        n = sscanf(line, "%15s %15s", verb, noun);
        if (n < 1) {
            continue;
        }
        printf("> %s", line);
        if (strcmp(verb, "look") == 0) {
            player_look(&p);
        } else if (strcmp(verb, "take") == 0 && n == 2) {
            player_take(&p, noun);
        } else if (strcmp(verb, "inv") == 0) {
            player_inventory(&p);
        } else if ((d = dir_from_word(verb)) >= 0) {
            player_go(&p, d);
        } else {
            printf("I don't understand \"%s\".\n", verb);
        }
    }
    if (p.carrying[2]) {
        printf("The crown is yours, in %d moves. You win!\n", p.moves);
    }
    return 0;
}
