/* greet.h - a promise: "somewhere there is a function called greet that
 * takes a name and a count and returns nothing". Any file that includes
 * this can call greet without knowing where its body is. */
#ifndef GREET_H
#define GREET_H

void greet(const char *name, int times);
int greetings_given(void);

#endif
