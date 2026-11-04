# MEDP33100 - Project 2 Data Visualization

## Team members

Add all the names of all the team members

- Rubi Perez Guzman
- Jin Wang

## Live Demo

- Include a link to the live version of the project hosted on Render.

## Project Overview

Briefly describe the purpose of the project. Explain what live data set was used, and what you hope users would learn about the data set by using your project
The purpose of the project is explore subway accessibility through its elevators using map visualization and interactions. We utilized two live data sets, MTA stations and train elevator availabilities, which are filtered to contain data for Manhattan stations in 2025. We hope that through this project, users can think more about accessibility in our daily lives such as our daily commutes. Users can learn through our project like which train stations are accessible by elevators, what areas have more elevators, and which stations experiences the most elevator outages.

## Features

List all (at least 3) distinct types of user interaction, such as filtering, sorting, modifying data views, or changing the data presentation.

1. Filter (accessed by clicking the top right icon with three horizontal bars) that allows users to change map view to show all stations with elevators or without
2. Ranking modal (accessed by clicking the top right icon with a bar graph) that sorted total outages for every station with elevators and displays the top 10 highest ones
3. Map markers correspond to every train station in Manhattan with clear indication whether it has elevators or not, popup appears when clicked with unique data pertaining to the station's elevator

## Technologies Used

List the technologies and tools used in the project

- **Languages**: HTML, CSS, JavaScript
- **Libraries**: Leaflet for map
- **APIs**: [MTA NYCT Subway Elevator and Escalator Availability](https://data.ny.gov/d/rc78-7x78), [MTA Subway Stations](https://data.ny.gov/d/39hk-dx4f)
- **Other**: Font Awesome for icons

## Future Enhancements

List any features you would’ve liked to add if given more time

- Expanding our data, we choose for our API to fetch specific data due to time constraints so our project only focuses on the data of Manhattan stations during 2025
- More filtering options such as by months or average outages per month, sorting specific elevators within marker popup
- We found an elevator API from MTA with real-time data of outages during our research into what API to use. If there was more time, we would've love to showcase the most recent elevator outages as a resource for commuting users who use elevators

## Credits

List any third-party assets used in the project (e.g., sound effects, images, fonts) and provide proper attribution. Acknowledge any resources, tutorials, or references you used to help complete the project.

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- Font Awesome: [Ranking Icon](https://fontawesome.com/icons/classic/solid/ranking-star), [Bars Icon](https://fontawesome.com/icons/classic/solid/bars)
- [Accessibility using ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label)
