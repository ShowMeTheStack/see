/* roman.h - Roman numerals, 1 to 3999. */
#ifndef ROMAN_H
#define ROMAN_H

/* Writes the numeral into out (16 bytes is always enough: MMMDCCCLXXXVIII
 * is the longest). Returns 0 if n is out of range. */
int roman_from_int(int n, char *out);

/* Returns the value, or 0 if the text is not a well-formed numeral. */
int roman_to_int(const char *s);

#endif
