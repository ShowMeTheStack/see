/* config.h - reads "key = value" settings from a text file. */
#ifndef CONFIG_H
#define CONFIG_H

#define CFG_MAX 16

int config_load(const char *path);
const char *config_get(const char *key, const char *fallback);
int config_get_int(const char *key, int fallback);
int config_get_bool(const char *key, int fallback);
void config_dump(void);
void config_unload(void);

#endif
