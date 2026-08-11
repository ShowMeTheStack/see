/*
 * title: Multiplication square
 * level: 1
 * about: Prints a 10 by 10 multiplication table with headings using two nested for loops.
 */
#include <stdio.h>

int main(void)
{
    int row, col;

    /* Heading row. %4d pads every number to four columns so the table
       lines up however many digits each product has. */
    printf("   x|");
    for (col = 1; col <= 10; col++)
        printf("%4d", col);
    printf("\n----+");
    for (col = 1; col <= 10; col++)
        printf("----");
    printf("\n");

    /* The outer loop picks a row; for each row the inner loop runs all
       the way through the columns. The inner loop's counter starts
       again from 1 every time: watch col reset in the locals panel when
       row goes up by one. 10 rows x 10 columns = 100 products. */
    for (row = 1; row <= 10; row++) {
        printf("%4d|", row);
        for (col = 1; col <= 10; col++)
            printf("%4d", row * col);
        printf("\n");
    }
    return 0;
}
