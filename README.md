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
- **Backend:** [Firebase](https://firebase.google.com/) (Backend-as-a-Service)
  - **Authentication:** [Firebase Authentication](https://firebase.google.com/products/auth) for user management and security.
  - **Database:** [Cloud Firestore](https://firebase.google.com/products/firestore) for real-time NoSQL data storage.
  - **File Storage:** [Cloud Storage for Firebase](https://firebase.google.com/products/storage) for user uploads like avatars and post images.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/en/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Firebase project](https://console.firebase.google.com/)

## ⚙️ Getting Started

Follow these steps to get your development environment set up:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/connect_sphere.git
    cd connect_sphere
    ```

2.  **Install dependencies:**

    ```bash
    # Navigate to the project directory (if you're not already there)
    cd connect_sphere
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of your project directory and add your Firebase project configuration keys. You can get these from your Firebase project settings.

    ```env
    VITE_FIREBASE_API_KEY="your_api_key"
    VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
    VITE_FIREBASE_PROJECT_ID="your_project_id"
    VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
    VITE_FIREBASE_APP_ID="your_app_id"
    ```

4.  **Run the application:**

    ```bash
    # Run the frontend development server
    npm run dev
    ```

    The application should now be running on `http://localhost:5173` (or another port specified by Vite).

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request<br/><br/>

<img width="1858" height="959" alt="image" src="https://github.com/user-attachments/assets/f14778c9-18c2-4143-bde3-852b745f3608" /><br/><br/>

**Participant User Module**<br/>
<img width="1864" height="973" alt="image" src="https://github.com/user-attachments/assets/4e912e26-b777-4dbb-9cd8-77230c507ba3" /><br/><br/>

**System Admin Module**<br/>
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/76730b78-d43c-4f34-9810-35194bf4f31d" />


