# Connect Sphere 🌐

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Welcome to **Connect Sphere**! A modern, real-time social networking platform designed to connect people and build communities.

## ✨ Features

- **Real-time Chat:** Instant messaging with friends and groups.
- **User Profiles:** Customizable user profiles with avatars and bios.
- **News Feed:** A dynamic feed to see updates from people you follow.
- **Friend System:** Send, receive, and manage friend requests.
- **Post Creation:** Share your thoughts with text, images, and links.
- **Responsive Design:** A seamless experience on desktop and mobile devices.

## 🚀 Tech Stack

This project is built with a modern and scalable tech stack:

- **Frontend:** [React](https://reactjs.org/) with [Vite](https://vitejs.dev/) for a blazing fast development experience.
- **Backend:** [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/) for a robust REST API.
- **Real-time Communication:** [Socket.IO](https://socket.io/) for instant messaging and notifications.
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) for data persistence.
- **Authentication:** JSON Web Tokens (JWT) for secure user authentication.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/en/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

## ⚙️ Getting Started

Follow these steps to get your development environment set up:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/connect_sphere.git
    cd connect_sphere
    ```

2.  **Install dependencies:**

    This project may have separate dependencies for the client and server.

    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the `server` directory and add the necessary environment variables.

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

4.  **Run the application:**

    You can run the client and server concurrently.

    ```bash
    # Run the backend server (from the /server directory)
    npm run dev

    # Run the frontend client (from the /client directory in a new terminal)
    npm run dev
    ```

    The client should now be running on `http://localhost:5173` (or another port specified by Vite) and the server on `http://localhost:5000`.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Happy coding!