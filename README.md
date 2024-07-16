## Contents
- [About](#about)
- [Local Usage](#local-usage)

## About
Personal telegram bot to manage task on project

## Local Usage

1. Requirements

* [Docker & Docker compose](https://docs.docker.com/compose/install/)

2. Installation

### Preparation

#### configure environment variables

```bash
cp .env.development .env.development.local
```
Then set your environments (you can use any text editor)

### Launch provisioning(install packages, run migrations, etc.)

```bash
make provision
```

3. Usage

### Run app

```bash
make app
```

### Migrations

#### Create migration

```bash
make migration-create name=create-users
```

#### Apply migrations

```bash
make migration-up
```

#### Revert migration

```bash
make migration-down
```

### Stop

#### Stop and keep data

```bash
make down
```

#### Stop and clear data

```bash
make down-v
```
