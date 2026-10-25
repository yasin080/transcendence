# transcendence
## Backups and disaster recovery

**What is saved.** The MariaDB database (users, rooms, games). Redis is not
backed up: it only holds sessions and the state of games in progress, which
are lost in a crash anyway.

**When.** The `backup` service dumps the database when the stack starts and
then every 6 hours, into `./backups/<date>.sql.gz` on the host. The newest 28
dumps (one week) are kept. A dump only counts if it finished, so a broken one
never replaces a good one. `make backup` makes one on the spot.

**Recovery.** `./backups` lives outside Docker, so it survives even
`make fclean`. To rebuild everything from scratch:

```sh
make fclean                                  # or the machine is gone: clone the repo, copy .env and ./backups
make up                                      # fresh stack, empty database
make restore FILE=backups/<date>.sql.gz      # load the dump
```
