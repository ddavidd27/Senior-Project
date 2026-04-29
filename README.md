# Play4All

Play4All is a web application designed to help users find, create, join, and manage local sports activities. The platform helps people organize casual games, meet other players, and participate in sports events based on location, sport type, skill level, and availability.

The goal of Play4All is to replace informal coordination methods such as group chats, social media posts, or word of mouth with a centralized platform focused on sports matchmaking and local activity management.

## Features

- User registration and login
- User profiles with personal information, avatar, sports, and skill levels
- Browse available public games
- Search games by location
- Filter games by sport, skill level, date, and other criteria
- Create and manage sports activities
- Join and leave games
- Manage friends
- Real-time chat between users
- Rate other players after completed games

## Target Users

Play4All is designed for:

- People who recently moved to a new place and want to meet others through sport
- People who want to try a new sport but do not know where to start
- Players who want to organize casual sports activities without doing everything manually
- Users who prefer to find games based on sport, skill level, location, and date
- Groups of players who need a simple way to coordinate activities

## Project Structure

```text
Senior-Project/
│
├── backend/              # Server-side application
├── frontend/             # Client-side application
├── Diagrams/             # Project diagrams and visual documentation
├── REQUIREMENTS.md       # Full requirements document
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Dependency lock file
└── README.md             # Project overview
```

## Technologies Used

- Frontend: React
- Backend: Node.js
- Package Manager: npm
- Version Control: Git and GitHub

## Installation

Clone the repository:

```bash
git clone https://github.com/ddavidd27/Senior-Project.git
cd Senior-Project
```

Install the root dependencies:

```bash
npm install
```

If the frontend and backend have separate dependencies, install them individually:

```bash
cd frontend
npm install
```

```bash
cd ../backend
npm install
```

## Running the Project

If the project can be started from the root folder, run:

```bash
npm start
```

If the frontend and backend run separately, start each one in a different terminal.

Frontend:

```bash
cd frontend
npm start
```

Backend:

```bash
cd backend
npm start
```

## Documentation

More detailed project documentation is available in the following files:

- [Requirements Document](./REQUIREMENTS.md)
- [Diagrams](./Diagrams)

## Project Status

This project is being developed as part of a final degree project. The application is currently focused on implementing the main functionality for user management, sports activity creation, game discovery, communication between users, and post-game rating.

## Author

Developed by David.

## License

This project is for academic purposes.
