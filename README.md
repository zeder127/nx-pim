# PI Manager

PI Manager is a research project for digitizing and automating of [SAFe PI-Planning](https://www.scaledagileframework.com/pi-planning/). It provides a real-time collaborating planning board, try to make the collaboration while planning process more easier and more efficiently.

## Quick start

- Run `npm install` to install all dependencies.
- Run `npm run start:ui` to start the app.
- Run `npm run start:fluid` to start backend service for data synchronisation

  > Please contact [me](xuesong.wen@gmail.com) to assign you access to Arzue DevOps. It is also possible to connect with other Azure DevOps project.

## Features

- Real-time board
- Synchronisation between Team- and Program-Board
- Visualising dependencis between work items
- To be continue ...

## Technologies

- [Angular](https://angular.io/) Frontend Framework
- [NestJS](https://nestjs.com/) Node.js Framework for REST API
- Using [Nx Workspace](https://nx.dev/) for a better project structure
- Using [PrimeNG for Angular](https://www.primefaces.org/primeng/) as main UI library
- Using [Fluidframework](https://fluidframework.com/) for real-time data synchronisation
- Using [LeaderLine](https://anseki.github.io/leader-line/) to build svg lines for visualising dependencies
- [Azure OAuth 2.0 Authentication](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/msal-angular-v1/lib/msal-angular)
- Using [Azure DevOps Services REST API](https://docs.microsoft.com/en-us/?view=azure-devops-rest-5.1) to interact with Azure DevOps

## Project Structure

- apps
  - api&nbsp;&nbsp;&nbsp;&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;backend rest api
  - pim&nbsp;&nbsp;&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;main App components
- libs

  - data&nbsp;&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;shared data model and distributed data objects
  - ui&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;basis ui components

## TODOs

- Azure DevOps extension
- Support for KeyResults & Objectives
- Dashboard for PI KPI
- Mouse tracking on a board
- ...

## Contribute

Welcome contributions and feedbacks. Please contact [me](xuesong.wen@gmail.com).

## License

Licensed under the MIT License (the "License").
