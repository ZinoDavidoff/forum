# Mommy Forum 👶

A beautiful, feature-rich forum platform designed specifically for mothers and mothers-to-be to connect, share experiences, and support each other throughout their pregnancy and parenting journey.

## 🌟 Features

### Core Forum Features
- **Threaded Discussions** - Create and participate in organized discussion threads
- **Categories & Subcategories** - Organize topics by pregnancy stages, parenting, health, etc.
- **Rich Text Editor** - Format posts with images, links, and styling
- **Search Functionality** - Find threads, posts, and users quickly
- **Tagging System** - Add and filter by relevant tags
- **Post Reactions** - React to posts with emojis (like, love, helpful, etc.)
- **Bookmarks** - Save favorite threads for later

### User Features
- **User Profiles** - Customizable profiles with avatars and bio
- **Reputation System** - Earn points for helpful contributions
- **Badges & Achievements** - Unlock badges for milestones
- **Follow System** - Follow other users
- **Due Date Tracking** - Optional pregnancy tracker
- **Activity Feed** - See your recent activity

### Communication
- **Real-time Notifications** - Get notified about replies, mentions, and reactions
- **Private Messaging** - Chat privately with other members
- **Typing Indicators** - See when someone is typing
- **@Mentions** - Tag users in posts

### Moderation & Safety
- **Content Moderation** - Report inappropriate content
- **User Roles** - Admin, Moderator, and User roles
- **HTML Sanitization** - Protect against XSS attacks
- **Profanity Filter** - Configurable word filter
- **Thread Locking** - Lock threads when needed

### Design
- **Baby-Themed UI** - Soft pastel colors and friendly design
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Delightful micro-interactions
- **Custom Fonts** - Friendly, readable typography
- **Dark Mode Ready** - Easy to implement dark theme

## 🛠️ Tech Stack

### Backend (NestJS)
- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based auth with Passport
- **Real-time**: Socket.IO for WebSockets
- **Validation**: class-validator
- **Security**: bcrypt, sanitize-html
- **File Upload**: Multer

### Frontend (Angular)
- **Framework**: Angular 17.x
- **Routing**: Angular Router
- **HTTP**: HttpClient with Interceptors
- **Forms**: Reactive Forms
- **State Management**: RxJS BehaviorSubjects
- **Styling**: Custom CSS (no Material Design)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Backend Setup

1. Navigate to backend directory:
```cmd
cd backend
```

2. Install dependencies:
```cmd
npm install
```

3. Create environment file:
```cmd
copy .env.example .env
```

4. Update `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=mommy_forum
JWT_SECRET=your-secret-key
```

5. Create the database:
```sql
CREATE DATABASE mommy_forum;
```

6. Start the development server:
```cmd
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

### Frontend Setup

1. Navigate to frontend directory:
```cmd
cd frontend
```

2. Install dependencies:
```cmd
npm install
```

3. Start the development server:
```cmd
npm start
```

The app will be available at `http://localhost:4200`

## 🚀 Usage

### Creating an Account
1. Click "Join Us" on the homepage
2. Fill in your username, email, and password
3. Optionally add your full name and due date
4. Start participating in discussions!

### Creating a Thread
1. Log in to your account
2. Click "New Thread" button
3. Select a category
4. Write your title and content
5. Add relevant tags
6. Click "Create Thread"

### Posting Replies
1. Open any thread
2. Scroll to the bottom
3. Write your reply
4. Click "Post Reply"

### Using Reactions
1. View any post
2. Click the reaction buttons (❤️ like, 💡 helpful, etc.)
3. Your reaction is saved and counted

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentication & JWT
│   │   ├── users/         # User management
│   │   ├── categories/    # Forum categories
│   │   ├── threads/       # Discussion threads
│   │   ├── posts/         # Thread posts/replies
│   │   ├── reactions/     # Post reactions
│   │   ├── notifications/ # Real-time notifications
│   │   ├── messages/      # Private messaging
│   │   ├── search/        # Search functionality
│   │   ├── reputation/    # Badges & reputation
│   │   ├── moderation/    # Content moderation
│   │   └── upload/        # File uploads
│   ├── app.module.ts
│   └── main.ts
├── package.json
└── tsconfig.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/      # Auth guards
│   │   │   ├── interceptors/# HTTP interceptors
│   │   │   ├── models/      # TypeScript interfaces
│   │   │   └── services/    # API services
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   └── sidebar/
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   ├── auth/
│   │   │   ├── threads/
│   │   │   ├── profile/
│   │   │   ├── messages/
│   │   │   └── notifications/
│   │   └── shared/
│   │       └── components/  # Reusable components
│   ├── styles.css
│   └── index.html
└── package.json
```

## 🎨 Theme Customization

The baby theme uses CSS custom properties for easy customization. Edit `frontend/src/styles.css`:

```css
:root {
  --baby-pink: #FFB6C1;
  --baby-blue: #B0D4F1;
  --baby-yellow: #FFF9C4;
  --baby-lavender: #E6E6FA;
  --baby-mint: #C7EFCF;
  /* Add your colors */
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- HTTP-only cookies (optional)
- CORS configuration
- SQL injection protection (TypeORM)
- XSS protection (HTML sanitization)
- CSRF protection ready
- Input validation on all endpoints

## 🧪 Testing

### Backend Tests
```cmd
cd backend
npm test
```

### Frontend Tests
```cmd
cd frontend
npm test
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/validate` - Validate token

### Threads
- `GET /api/threads` - List threads
- `GET /api/threads/:id` - Get thread details
- `POST /api/threads` - Create thread (auth required)
- `PUT /api/threads/:id` - Update thread (auth required)
- `DELETE /api/threads/:id` - Delete thread (auth required)

### Posts
- `GET /api/posts/thread/:threadId` - Get thread posts
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)

[See full API documentation in the `/docs` folder]

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💖 Support

If you find this project helpful, please give it a ⭐️!

## 🙏 Acknowledgments

- Designed with love for mothers everywhere 👶
- Icons from emoji set
- Fonts: Quicksand & Fredoka from Google Fonts

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with 💖 for amazing mothers everywhere!
