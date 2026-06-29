struct p { int x; };
int main(void) { struct p a; return a->x; }
/* ERROR: did you mean '.' */
