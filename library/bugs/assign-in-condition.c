/*
 * title: Everyone gets the senior discount
 * level: 1
 * about: Prices cinema tickets by age, but an = in place of == makes every customer 65.
 * expect: warning
 */

/*
 * THE PUZZLE
 * Tickets cost 9. As a birthday treat, the cinema charges 4 to anyone
 * aged exactly 65. Of the four customers only one is 65, yet every one
 * of them pays 4, and every age is printed as 65. Look closely at the
 * if line. One character is missing.
 *
 * HOW TO HUNT IT WITH SEE
 * The build panel shows a warning: "suggest parentheses around
 * assignment used as truth value". The compiler is telling you it saw
 * an assignment where a test usually goes. Step through ticket_price
 * with F10 and watch age in the frame: it is 12 on entry and becomes
 * 65 the moment the if line runs. The value of an assignment is the
 * value assigned, 65, which is not zero, so the condition is true.
 */
#include <stdio.h>

static int ticket_price(int age)
{
    int price = 9;

    if (age = 65)
        price = 4;
    printf("age %2d pays %d\n", age, price);
    return price;
}

int main(void)
{
    int ages[4];
    int i, total = 0;

    ages[0] = 12;
    ages[1] = 40;
    ages[2] = 65;
    ages[3] = 30;

    for (i = 0; i < 4; i++)
        total += ticket_price(ages[i]);
    printf("takings: %d\n", total);
    return 0;
}

/*
 * THE FIX
 *     if (age == 65)
 * Expected output: ages 12, 40, 65 and 30 paying 9, 9, 4 and 9, takings
 * 31. Actual: everyone shown as 65, paying 4, takings 16.
 * Some programmers write the constant first, if (65 == age), so that a
 * slip to = becomes a compile error (you cannot assign to 65). Others
 * just never ignore this warning. When you really mean to assign and
 * test, add the extra parentheses the compiler asked for and compare
 * explicitly: if ((c = getchar()) != EOF).
 */
