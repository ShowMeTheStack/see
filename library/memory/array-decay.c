/*
 * title: Why sizeof lies inside a function
 * level: 2
 * about: Shows that an array passed to a function arrives as a pointer, so sizeof gives 4 there, and how passing the length fixes it.
 */
#include <stdio.h>

/*
 * The [] in the parameter is a disguise: "int values[]" here means exactly
 * "int *values". Only a pointer to the first element is passed.
 */
static void inside(int values[])
{
    printf("inside : sizeof values = %u (a pointer)\n", (unsigned)sizeof values);
}

static long total(const int *values, int n)
{
    long sum = 0;
    int i;
    for (i = 0; i < n; i++)
        sum += values[i];
    return sum;
}

int main(void)
{
    int marks[7];
    int i;

    for (i = 0; i < 7; i++)
        marks[i] = 50 + i * 5;

    printf("in main: sizeof marks  = %u (the whole array)\n", (unsigned)sizeof marks);
    inside(marks);

    /*
     * Step into total() and look at values in the stack panel: it is a
     * 4-byte pointer whose arrow goes back into main's frame, to marks[0].
     */
    printf("total of %u marks = %ld\n",
           (unsigned)(sizeof marks / sizeof marks[0]),
           total(marks, (int)(sizeof marks / sizeof marks[0])));

    /* The address of the array and of its first element are the same place. */
    printf("marks = %p, &marks[0] = %p, &marks = %p\n",
           (void *)marks, (void *)&marks[0], (void *)&marks);
    /* ...but they step differently: &marks + 1 jumps over the whole array. */
    printf("marks + 1 = %p, &marks + 1 = %p\n", (void *)(marks + 1), (void *)(&marks + 1));
    return 0;
}
