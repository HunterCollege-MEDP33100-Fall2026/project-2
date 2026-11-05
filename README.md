# MEDP33100 - Project 2 Data Visualization

## Team members

- Rubi Perez Guzman
- Jin Wang

## Live Demo

https://jiyuua.github.io/project-2/

## Project Overview

The purpose of this project is to explore subway accessibility through elevator availability using map visualization and interactive features. We utilized two live datasets, one for MTA subway stations and the other for train elevator availability, filtered to include Manhattan stations and elevator data from 2025. We hope that through this project, users can think more about the importance of accessibility in everyday life, especially during their daily commutes. Users can learn which train stations are accessible by elevators, which areas have more elevator access and which stations experience the most elevator outages.

## Features

1. Filter (accessed by clicking the top right icon with three horizontal bars) that allows users to change map view to show all stations with or without elevators.
2. Ranking modal (accessed by clicking the top right icon with a bar graph) that sorts and displays the top 10 stations with the most elevator outages.
3. Users can interact with map markers representing each Manhattan subway station. The markers visually indicate whether a station has elevators. When clicked, an animated elevator door opens to display a popup with unique information about that station's elevator availability and outage data

## Technologies Used

List the technologies and tools used in the project

- **Languages**: HTML, CSS, JavaScript
- **Libraries**: Leaflet for map
- **APIs**: [MTA NYCT Subway Elevator and Escalator Availability](https://data.ny.gov/d/rc78-7x78), [MTA Subway Stations](https://data.ny.gov/d/39hk-dx4f)
- **Other**: Canva, Font Awesome for icons

## Future Enhancements

List any features you would’ve liked to add if given more time

- Expanding our data. We would have liked to include more data from additional subway stations and a longer time period. Due to time constraints and having one less group member, we limited our API data to Manhattan stations and the year 2025 to keep the project manageable.
- More filtering options. We would have liked to add more filtering options, such as comparing the average number of outages per month. We also wanted to give users the ability to sort and explore specific elevators within each station's popup.
- Including real-time elevator outage information. We found an elevator API from MTA with real-time data of outages during our research. If there was more time, we would've love to showcase the most recent elevator outages as a resource for commuting users who use elevators.

## Credits

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- Font Awesome: [Ranking Icon](https://fontawesome.com/icons/classic/solid/ranking-star), [Bars Icon](https://fontawesome.com/icons/classic/solid/bars)
- [Accessibility using ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label)
