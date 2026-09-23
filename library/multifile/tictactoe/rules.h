/* rules.h - who has won, and how the computer chooses a move. */
#ifndef RULES_H
#define RULES_H

#include "board.h"

char rules_winner(const Board *b);      /* 'X', 'O', or EMPTY */
int rules_full(const Board *b);
int rules_best_move(Board *b, char me, char them);

#endif
