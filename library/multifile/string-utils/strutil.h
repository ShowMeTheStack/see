/* strutil.h - small string helpers, all working in place on char arrays. */
#ifndef STRUTIL_H
#define STRUTIL_H

void str_reverse(char *s);
void str_upper(char *s);
char *str_trim(char *s);
int str_count_words(const char *s);
int str_replace_char(char *s, char from, char to);
int str_is_palindrome(const char *s);

#endif
