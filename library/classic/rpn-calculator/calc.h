/* calc.h: what the files of the calculator share. Each .c file includes
   this, so they all agree on the names and types of the functions they
   call in each other. */

#define NUMBER '0'      /* getop's signal that a number was found */
#define MAXOP 100       /* longest operand or operator */

/* stack.c */
void push(double f);
double pop(void);
int depth(void);
void clear(void);

/* getop.c */
int getop(char s[]);

/* getch.c */
int getch(void);
void ungetch(int c);
