
# Server Agent

This is a server agent that you can run locally on your server. It is designed to handle tasks and manage jobs according to the defined configurations.

## Installation

To install the required dependencies, use Bun:

```bash
bun install
```

## Migrate Database

To set up the database schema and perform migrations, run:

```bash
bun run migrate
```

This command will create the necessary tables and ensure the database is up-to-date.

## Run the REST API Server

To start the REST API server, which allows you to set jobs and manage users who can add jobs to the server, use:

```bash
bun run server
```

The REST API server provides endpoints for job and user management.

## Run the Agent

To run the server agent that processes jobs, execute:

```bash
bun run agent
```

The agent continuously processes jobs and performs the assigned tasks according to the configurations.

## Usage

1. **Start the REST API Server**: This will allow you to create and manage jobs and users.
  need to login -> collect token form cookies -> using this token you can make API call
2. **Run the Agent**: This will continuously process the jobs as per the configurations and schedules.
