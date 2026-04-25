# Play4All Requirements Document

## 1. Project Overview

Play4All is a web-based application designed to help users find, create, join, and manage local sport activities. The goal of the application is to make casual sport organization easier by replacing informal methods such as group chats, social media posts, or word of mouth with a centralized platform focused on sport matchmaking.

The application allows users to create accounts, browse public games, search by location, filter games, join or leave activities, manage friends, chat in real time, and rate other players after completed games.

## 2. Target Users

The main users of Play4All are:

- People who recently moved to a new place and do not know many people.
- People who want to try a new sport but do not know where to start.
- People who want to play casual sports without needing to organize everything manually.
- People who prefer to find games based on sport, skill level, location, and date.
- Users who want a simple way to coordinate with other players.

## 3. Functional Requirements

### 3.1 User Registration

The system shall allow users to create an account.

During signup, users shall provide:

- First name
- Last name
- Username
- Email
- Password
- Bio
- At least one sport
- Skill level for each selected sport
- Avatar

The system shall require at least one sport during signup.

The system shall allow users to select up to three sports.

The system shall store passwords securely using hashing.

The system shall prevent duplicate usernames.

The system shall create an authentication token after successful registration.

### 3.2 User Login

The system shall allow registered users to log in using email and password.

The system shall compare the submitted password with the stored hashed password.

The system shall return an authentication token when login is successful.

The system shall reject invalid credentials.

### 3.3 Authentication and Protected Features

The system shall use JSON Web Tokens to protect private actions.

The frontend shall store the token in the browser.

The frontend shall send the token when accessing protected routes.

The backend shall verify the token before allowing protected actions.

Protected actions include:

- Creating games
- Joining games
- Leaving games
- Editing profile information
- Managing friends
- Using chat
- Submitting ratings
- Admin game deletion

### 3.4 Public Game Browsing

The system shall allow users to browse games without logging in.

The system shall display available upcoming games.

The system shall not show old games as available.

The system shall display relevant game information, including:

- Sport
- Game type
- Date
- Time
- Skill level
- Location
- Number of players joined
- Number of players needed

### 3.5 Game Creation

The system shall allow authenticated users to create games.

When creating a game, users shall provide:

- Sport
- Game type: pickup, casual, or competitive
- Date
- Start time
- Skill level
- Number of players needed
- Location name
- Location coordinates
- Google place ID when available

The system shall automatically add the creator to the players list.

The system shall store the game in MongoDB.

### 3.6 Game Discovery and Filtering

The system shall allow users to search for games by location.

The system shall support location search using:

- Written location or postal code
- Current browser coordinates

If a written location is used, the backend shall convert it into coordinates using Google Geocoding API.

The backend shall calculate the distance between the searched location and each game location.

The system shall return games within the selected radius.

The frontend shall allow filtering games by:

- Sport
- Skill level
- Game type
- Date

### 3.7 Join Game

The system shall allow authenticated users to join an existing game.

The backend shall check whether the user is already in the game.

The system shall prevent duplicate joins.

The system shall update the game players list after a successful join.

### 3.8 Leave Game

The system shall allow authenticated users to leave a game they joined.

The backend shall remove the user from the players list.

If the creator leaves and other players remain, the system shall transfer creator ownership to another player.

If the last player leaves, the system shall delete the game.

### 3.9 My Games

The system shall allow authenticated users to view games they joined.

The system shall display recent joined games.

The user shall be able to leave a game from the My Games page.

### 3.10 User Profile

The system shall allow users to view their own profile.

The system shall allow users to view other users’ profiles.

The profile shall display:

- Name
- Username
- Bio
- Avatar
- Sports
- Skill levels

The system shall allow authenticated users to edit their own profile.

Editable profile information includes:

- Bio
- Sports
- Skill levels
- Avatar

### 3.11 Friend System

The system shall allow authenticated users to search for other users by username.

The system shall allow users to send friend requests.

The system shall allow users to accept friend requests.

The system shall allow users to remove friends.

The system shall display friend requests in the account menu.

The system shall display a badge when the user has pending friend requests.

### 3.12 Real-Time Chat

The system shall allow users to chat with friends.

The chat system shall use Socket.io for real-time communication.

The backend shall verify the user token before allowing a socket connection.

Each connected user shall join a private socket room.

The system shall create or find a conversation between two users.

The system shall store chat messages in MongoDB.

The system shall send new messages to both users in real time.

The system shall load previous messages when opening a chat.

### 3.13 Rating System

The system shall allow users to rate other players after a game is completed.

The backend shall determine completed games by comparing the game date and time with the current time.

Users shall only be able to rate players who participated in the same game.

Users shall not be able to rate themselves.

Each rating shall include:

- Score from 1 to 5
- Level accuracy
- Optional comment

The system shall prevent duplicate ratings for the same game, sender, and receiver.

### 3.14 Location and Map Features

The system shall use Google Maps API to allow users to select game locations.

The system shall allow users to search for a place using Google Places.

The system shall allow users to select a location by clicking on the map.

The system shall store location name, latitude, longitude, and place ID.

The system shall use Google place images or static map fallback images when displaying games.

### 3.15 Admin Features

The system shall support a basic admin role.

Admin users shall be able to delete games.

The system shall check admin status before allowing admin-only actions.

## 4. Non-Functional Requirements

### 4.1 Security

The system shall hash user passwords before storing them.

The system shall use JWT tokens for authentication.

The system shall protect private routes using authentication middleware.

The system shall avoid returning passwords in normal user queries.

### 4.2 Usability

The application shall provide a simple and clear interface.

The application shall allow users to find games quickly.

The application shall reduce the number of steps needed to create or join a game.

The interface shall update depending on whether the user is logged in or not.

### 4.3 Responsiveness

The frontend shall support different screen sizes.

The navigation shall include responsive behavior for smaller screens.

The application shall be usable on desktop and mobile devices.

### 4.4 Maintainability

The backend shall be organized into separate route files by feature.

The database logic shall use Mongoose models.

The frontend JavaScript shall be organized into page-specific and shared modules.

### 4.5 Reliability

The backend shall validate important actions such as login, creating games, joining games, and submitting ratings.

The system shall prevent duplicate joins.

The system shall prevent duplicate ratings.

The system shall remove empty games when no players remain.

### 4.6 Testing

The backend shall include automated tests.

Tests shall cover:

- User registration
- Login
- Invalid password rejection
- Protected routes
- Game creation
- Joining games
- Duplicate join prevention
- Sports list retrieval

The tests shall use MongoDB Memory Server to avoid affecting the real database.

## 5. Main Technologies

The frontend uses:

- HTML
- CSS
- JavaScript

The backend uses:

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io

Other technologies used:

- JSON Web Tokens
- bcrypt
- Google Maps API
- Google Places API
- Google Geocoding API
- Jest
- Supertest
- MongoDB Memory Server
- Render for deployment

## 6. External Services

### Google Maps Platform

Google Maps Platform is used for:

- Map display
- Place search
- Location selection
- Geocoding written locations into coordinates
- Displaying place images or map fallback images

### Render

Render is used to deploy and host the live application.

## 7. Data Models

### User

Stores user account and profile information.

Important fields:

- firstName
- lastName
- email
- username
- password
- sports
- friends
- friendRequests
- location
- avatar
- isAdmin
- bio

### Game

Stores sport activity information.

Important fields:

- sport
- type
- date
- startTime
- level
- peopleNeeded
- locationName
- locationPlaceId
- locationLat
- locationLng
- createdBy
- players

### Conversation

Stores a direct chat between two users.

Important fields:

- members
- membersKey
- lastMessage
- lastMessageAt

### Message

Stores individual chat messages.

Important fields:

- conversationId
- sender
- text
- createdAt

### Rating

Stores feedback after completed games.

Important fields:

- gameId
- fromUser
- toUser
- score
- levelAccuracy
- comment
