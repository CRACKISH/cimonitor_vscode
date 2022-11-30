# CI Monitor

## Features

Show status for your CI plans.

## Screenshots

![Example](images/example.png).

## Extension Settings

### Main
- `cimonitor.providers`: Array of providers.
- `cimonitor.jobs`: Array of jobs for providers.

### Providers
- `id`: Id of provider.
- `name`: Name of provider.
- `login`: Login.
- `password`: Password.
- `serviceUrl`: Url for ci service api.
- `type`: Type of provider.
    0 - Jenkins

### Jobs
- `id`: Id of job.
- `name`: Name for job.
- `key`: Key of project.
- `providerId`: Provider id.
