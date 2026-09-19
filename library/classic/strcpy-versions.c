/*
 * title: strcpy and strcmp, from arrays to pointers
 * level: 2
 * about: Writes strcpy four times, each shorter than the last, ending with while (*s++ = *t++), and strcmp twice, then strcat and strend.
 */
#include <stdio.h>

/* 1: array indexing, the most obvious form. */
void strcpy1(char *s, const char *t)
{
    int i = 0;

    while ((s[i] = t[i]) != '\0')
        i++;
}

/* 2: move the pointers themselves. s and t are copies of the caller's
   pointers, so moving them here does not disturb the caller. Watch
   both arrows slide along in the memory picture. */
void strcpy2(char *s, const char *t)
{
    while ((*s = *t) != '\0') {
        s++;
        t++;
    }
}

/* 3: fold the increments into the copy. *s++ = *t++ copies one
   character and then advances both pointers. */
void strcpy3(char *s, const char *t)
{
    while ((*s++ = *t++) != '\0')
        ;
}

/* 4: the comparison with '\0' is redundant, since '\0' is false. This
   is the famous idiom; gcc asks for the extra brackets to show that the
   = is meant and is not a mistyped ==. */
void strcpy4(char *s, const char *t)
{
    while ((*s++ = *t++))
        ;
}

/* <0, 0 or >0 as s is before, equal to or after t. */
int strcmp1(const char *s, const char *t)
{
    int i;

    for (i = 0; s[i] == t[i]; i++)
        if (s[i] == '\0')
            return 0;
    return s[i] - t[i];
}

int strcmp2(const char *s, const char *t)
{
    for (; *s == *t; s++, t++)
        if (*s == '\0')
            return 0;
    return *s - *t;
}

/* Exercise 5-3: append t to s. Find the end of s, then copy. */
void strcat_p(char *s, const char *t)
{
    while (*s)
        s++;
    while ((*s++ = *t++))
        ;
}

/* Exercise 5-4: 1 if t occurs at the end of s. */
int strend(const char *s, const char *t)
{
    const char *ps = s, *pt = t;

    while (*ps)               /* run both pointers to their '\0' */
        ps++;
    while (*pt)
        pt++;
    if (pt - t > ps - s)      /* t is longer than s: cannot be its end */
        return 0;
    ps -= pt - t;             /* step back by t's length */
    while (*ps && *ps == *t) {
        ps++;
        t++;
    }
    return *t == '\0';
}

int main(void)
{
    char a[40], b[40], c[40], d[40];

    strcpy1(a, "one");
    strcpy2(b, "two");
    strcpy3(c, "three");
    strcpy4(d, "four");
    printf("%s %s %s %s\n", a, b, c, d);

    printf("strcmp(\"apple\", \"apply\") = %d and %d\n",
           strcmp1("apple", "apply"), strcmp2("apple", "apply"));
    printf("strcmp(\"same\", \"same\") = %d and %d\n",
           strcmp1("same", "same"), strcmp2("same", "same"));

    strcat_p(a, " plus ");
    strcat_p(a, b);
    printf("strcat: %s\n", a);
    printf("strend(\"%s\", \"two\") = %d, strend(\"%s\", \"one\") = %d\n",
           a, strend(a, "two"), a, strend(a, "one"));
    return 0;
}
