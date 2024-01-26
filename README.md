![StudentsWeek](https://i.imgur.com/pc3C5Ir.png)

<div align="center">
A simple all-in-one platform to manage your next students' week at school.
</div>

<br />
<div align="center"><a href="https://drone.dev.codegiik.com/codegiik/studentsweek">
  <img src="https://drone.dev.codegiik.com/api/badges/codegiik/studentsweek/status.svg" />
</a>
</div>

## Development

This project resides in a [pnpm monorepo](https://pnpm.io/workspaces). The web server is located in the package named `web`, currently stored in `/web`. All the other accessory packages are stored in the `/packages` directory. To use packages installed in the monorepo, you can utilize the `workspace:` directive as outlined in the pnpm documentation. To run the web server in development mode, execute the following command:
```sh
$ pnpm --filter web dev
```
> Note: The `--filter <package-name>` option allows you to select a specific list of packages on which to run the desired script.

## Production

There are several ways to deploy this platform, with the recommended approach being the use of Docker. The container image for the web server can be built using the `Dockerfile` located in the root of the repository. To simplify deployment, Docker Compose can be employed by following the configuration schema in `docker-compose.yml`. To start the container for production, use the following command:
```sh
$ docker compose up -d --build
```
This command will build the image locally and start the container, exposing port 3000. It is advised to use a reverse proxy service.

## Authors and Contributors

- Coauthor: Antonio Trapanese [@hydra-yse]
- Coauthor: Giuseppe Pascale [@pasc4le]

## License

By accessing, modifying, deploying and sharing this codebase, you are agreeing to its assigned legal terms, defined in the LICENSE.md. The LICENSE.md file (and its contents) must be shared along side the codebase to whomever wants to view, access or make changes to it.
