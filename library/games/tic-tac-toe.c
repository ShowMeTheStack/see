/*
 * title: Tic-tac-toe against a careful computer
 * level: 3
 * about: You play X against a computer that wins if it can, blocks if it must, else takes the centre or a corner - and you beat it with a fork.
 * input: 1\n9\n3\n7\n4\n
 */
#include <stdio.h>

static char board[9];

/* All eight ways to make three in a row, as triples of square numbers.
   One table serves both for checking a win and for planning a move. */
static const int lines[8][3] = {
    { 0, 1, 2 }, { 3, 4, 5 }, { 6, 7, 8 },     /* rows */
    { 0, 3, 6 }, { 1, 4, 7 }, { 2, 5, 8 },     /* columns */
    { 0, 4, 8 }, { 2, 4, 6 }                   /* diagonals */
};

static void show(void)
{
    int r;

    for (r = 0; r < 3; r++) {
        printf(" %c | %c | %c\n", board[3 * r], board[3 * r + 1], board[3 * r + 2]);
        if (r < 2)
            printf("---+---+---\n");
    }
}

static char winner(void)
{
    int i;

    for (i = 0; i < 8; i++) {
        char a = board[lines[i][0]];
        if (a != ' ' && a == board[lines[i][1]] && a == board[lines[i][2]])
            return a;
    }
    return ' ';
}

/* If player p has two in a line and the third square is empty, return
   that square: it wins for p (or, for the other side, it must be blocked). */
static int completing_square(char p)
{
    int i, k, mine, empty, where;

    for (i = 0; i < 8; i++) {
        mine = 0;
        empty = 0;
        where = -1;
        for (k = 0; k < 3; k++) {
            if (board[lines[i][k]] == p)
                mine++;
            else if (board[lines[i][k]] == ' ') {
                empty++;
                where = lines[i][k];
            }
        }
        if (mine == 2 && empty == 1)
            return where;
    }
    return -1;
}

static int computer_move(void)
{
    static const int preference[9] = { 4, 0, 2, 6, 8, 1, 3, 5, 7 };
    int sq, i;

    sq = completing_square('O');        /* 1. win */
    if (sq >= 0)
        return sq;
    /* 2. block. This rule has a blind spot: it can only block one
          threat. A "fork" - a move that makes two threats at once - beats
          it. The canned game does exactly that with squares 1, 9 and 7. */
    sq = completing_square('X');
    if (sq >= 0)
        return sq;
    for (i = 0; i < 9; i++)             /* 3. centre, corners, sides */
        if (board[preference[i]] == ' ')
            return preference[i];
    return -1;
}

int main(void)
{
    int move, turn, sq;
    char w = ' ';

    for (sq = 0; sq < 9; sq++)
        board[sq] = ' ';

    printf("Squares are numbered 1-9, left to right, top to bottom.\n");
    for (turn = 0; turn < 9 && w == ' '; turn++) {
        if (turn % 2 == 0) {
            printf("Your move (X): ");
            if (scanf("%d", &move) != 1) {
                printf("\nNo more moves.\n");
                return 0;
            }
            printf("%d\n", move);
            if (move < 1 || move > 9 || board[move - 1] != ' ') {
                printf("Square %d is not free, try again.\n", move);
                turn--;         /* the for loop's turn++ undoes this */
                continue;
            }
            board[move - 1] = 'X';
        } else {
            sq = computer_move();
            board[sq] = 'O';
            printf("Computer takes %d.\n", sq + 1);
            show();
        }
        w = winner();
    }
    show();
    if (w == 'X')
        printf("You win!\n");
    else if (w == 'O')
        printf("The computer wins.\n");
    else
        printf("A draw - the usual result between careful players.\n");
    return 0;
}
