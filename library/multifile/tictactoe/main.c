/*
 * title: Noughts and crosses in board, rules and main
 * level: 3
 * about: Plays tic-tac-toe against a computer that wins when it can and blocks when it must, split across three files.
 * input: 5\n3\n1\n4\n2\n9\n
 */

/* board.c knows the grid, rules.c knows the game, main.c talks to the
 * player. See compiles the three .c files one by one and links them into
 * a single program. The Board is one struct in main's frame; the other
 * files work on it through a pointer. Typed moves that are taken or out of
 * range are refused and asked again. */
#include <stdio.h>
#include "board.h"
#include "rules.h"

int main(void)
{
    Board b;
    int move;
    char winner = EMPTY;

    board_clear(&b);
    printf("You are X, the computer is O.\n");
    board_print(&b);

    while (winner == EMPTY && !rules_full(&b)) {
        printf("your move: ");
        if (scanf("%d", &move) != 1) {
            printf("\nno more moves, goodbye\n");
            return 0;
        }
        printf("%d\n", move);
        if (!board_place(&b, move, 'X')) {
            printf("square %d is not free\n", move);
            continue;
        }
        winner = rules_winner(&b);
        if (winner != EMPTY || rules_full(&b)) {
            break;
        }
        move = rules_best_move(&b, 'O', 'X');
        board_place(&b, move, 'O');
        printf("computer takes %d\n", move);
        winner = rules_winner(&b);
        if (winner == EMPTY) {
            board_print(&b);
        }
    }

    board_print(&b);
    if (winner == 'X') {
        printf("You win!\n");
    } else if (winner == 'O') {
        printf("The computer wins.\n");
    } else {
        printf("A draw.\n");
    }
    return 0;
}
