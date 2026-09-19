/*
 * title: Sorting lines with alloc and an array of pointers
 * level: 3
 * about: Reads lines into a home-made storage allocator, keeps pointers to them in an array, and sorts by swapping the pointers, never the text.
 * input: pear\napple\nfig\ncherry\nbanana\ndate\napricot\n
 */
#include <stdio.h>
#include <string.h>

#define MAXLINES 50
#define MAXLEN 100
#define ALLOCSIZE 1000

/* Section 5.4's allocator: one big static array handed out from the
   front like a stack. allocp is the next free byte. Find allocbuf in the
   globals panel: the lines appear in it one after another, each ending
   in '\0', and the pointers in lineptr point into it. */
static char allocbuf[ALLOCSIZE];
static char *allocp = allocbuf;

char *alloc(int n)
{
    /* Room left is the end of the buffer minus where we are. Pointer
       subtraction gives a count of elements. */
    if (allocbuf + ALLOCSIZE - allocp >= n) {
        allocp += n;
        return allocp - n;      /* the old position */
    }
    return NULL;
}

/* Free p and everything allocated after it. Only works stack-wise:
   the last thing allocated must be the first thing freed. */
void afree(char *p)
{
    if (p >= allocbuf && p < allocbuf + ALLOCSIZE)
        allocp = p;
}

char *lineptr[MAXLINES];

int get_line(char *s, int lim)
{
    int c = 0, i;

    for (i = 0; i < lim - 1 && (c = getchar()) != EOF && c != '\n'; i++)
        s[i] = (char)c;
    s[i] = '\0';
    return (c == EOF && i == 0) ? -1 : i;
}

int readlines(char *ptrs[], int maxlines)
{
    int len, nlines = 0;
    char *p, line[MAXLEN];

    while ((len = get_line(line, MAXLEN)) >= 0) {
        if (nlines >= maxlines || (p = alloc(len + 1)) == NULL)
            return -1;
        strcpy(p, line);
        ptrs[nlines++] = p;
    }
    return nlines;
}

void writelines(char *ptrs[], int nlines)
{
    while (nlines-- > 0)
        printf("  %s\n", *ptrs++);
}

void swap(char *v[], int i, int j)
{
    char *temp = v[i];
    v[i] = v[j];
    v[j] = temp;
}

/* The recursive quicksort of section 4.10, on pointers. Swapping two
   4-byte pointers is cheap however long the lines are, and in the memory
   picture you can see the arrows from lineptr cross over while the text
   in allocbuf never moves. */
void qsort_lines(char *v[], int left, int right)
{
    int i, last;

    if (left >= right)
        return;
    swap(v, left, (left + right) / 2);   /* middle element as the pivot */
    last = left;
    for (i = left + 1; i <= right; i++)
        if (strcmp(v[i], v[left]) < 0)
            swap(v, ++last, i);
    swap(v, left, last);
    qsort_lines(v, left, last - 1);
    qsort_lines(v, last + 1, right);
}

int main(void)
{
    int nlines;

    if ((nlines = readlines(lineptr, MAXLINES)) < 0) {
        printf("input too big to sort\n");
        return 0;
    }
    printf("as read:\n");
    writelines(lineptr, nlines);
    qsort_lines(lineptr, 0, nlines - 1);
    printf("sorted:\n");
    writelines(lineptr, nlines);
    printf("%d bytes of allocbuf used\n", (int)(allocp - allocbuf));

    /* Give everything back in one go: free from the first line on. */
    if (nlines > 0)
        afree(allocbuf);
    printf("after afree: %d bytes used\n", (int)(allocp - allocbuf));
    return 0;
}
