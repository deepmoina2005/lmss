# VidyaHub LMS

VidyaHub is a full-stack Learning Management System (LMS) with separate web apps for students, instructors, and admins. The platform supports course browsing, enrollment, paid checkout, lecture progress tracking, doubts/Q&A, instructor course management, and admin moderation.

## Project Overview

This repository is organized as a multi-app MERN-style project:

```txt
lms/
|-- server/              # Express + MongoDB REST API
|-- client/
|   |-- student/         # Student-facing React app
|   |-- instructor/      # Instructor dashboard React app
|   `-- admin/           # Admin dashboard React app
`-- docs/                # ER diagram and generated project reports
```

## Main Features

### Student App

- Student registration and login with JWT authentication.
- Public home page with hero section, companies, featured courses, testimonials, about, contact, and privacy policy pages.
- Course listing, search route, and course detail page.
- Course purchase/enrollment flow using Stripe Checkout.
- Free-course direct enrollment support when discounted price is zero.
- My Enrollments page for purchased/enrolled courses.
- Course player with lecture videos.
- Lecture progress tracking per course.
- Course rating system for enrolled students.
- Doubt/question submission for enrolled or free courses.
- View instructor replies to submitted doubts.
- Profile update with name and profile image upload.
- Password change support.

### Instructor App

- Instructor registration and login.
- Instructor accounts stay pending until approved by admin.
- Protected instructor dashboard.
- Add courses with thumbnail image upload.
- Create chapters and lectures.
- Upload lecture videos and bind them to lectures.
- View own courses.
- Edit/update existing course details and lecture videos.
- Delete own courses.
- Dashboard metrics for total courses, earnings, and enrolled students.
- View enrolled students per course.
- View student doubts/questions.
- Reply to doubts and mark them answered.
- Instructor profile update and password change.

### Admin App

- Separate admin login using configured admin credentials.
- Admin profile page.
- Change admin password.
- View pending instructor approval requests.
- Approve or reject instructors.
- View all users.
- Block and unblock users.
- Delete users.
- Cleanup logic for deleted instructors/users, including courses, purchases, progress, ratings, and enrollments.

### Backend/API Features

- REST API built with Express.
- MongoDB database with Mongoose models.
- JWT-based authentication and role-based authorization.
- Roles: `student`, `instructor`, and `admin`.
- User status management: `pending`, `approved`, `rejected`, and `blocked`.
- Password hashing with `bcryptjs`.
- File uploads with `multer`.
- Static serving for uploaded thumbnails, profile images, and lecture videos.
- Stripe Checkout session creation.
- Stripe webhook handling for successful and failed payments.
- Course progress, purchase, doubt, rating, and enrollment management.

## Technology Stack

### Frontend

- React 18
- Vite 6
- React Router DOM 7
- Redux Toolkit
- React Redux
- Axios
- Tailwind CSS
- PostCSS
- Autoprefixer
- React Toastify
- Lucide React
- Quill rich text editor
- Humanize Duration
- Student app extras:
  - Framer Motion
  - React YouTube
  - RC Progress
  - Phosphor React
  - Formspree React

### Backend

- Node.js
- Express 4
- MongoDB
- Mongoose
- JSON Web Token (`jsonwebtoken`)
- bcryptjs
- multer
- cors
- dotenv
- cookie-parser
- Stripe SDK
- Nodemon

### Tools/Docs

- Draw.io ER diagram in `docs/server-er-diagram.drawio`
- Generated PDF/DOCX project report in `docs/`

## Database Models

- `User`
  - Stores student, instructor, and admin-style user data.
  - Includes role, status, profile image, and enrolled courses.
- `Course`
  - Stores course title, description, thumbnail, price, discount, chapters, lectures, ratings, educator, and enrolled students.
- `Purchase`
  - Tracks course purchase amount and payment status.
- `CourseProgress`
  - Tracks completed lectures for a user and course.
- `Doubt`
  - Stores student questions and instructor replies.
- `AdminSetting`
  - Stores updated admin password hash.

## API Routes

### Auth Routes

Base path: `/api/auth`

- `POST /register` - register student or instructor.
- `POST /login` - login student or instructor.
- `POST /logout` - logout response; client removes token.
- `GET /verify` - verify JWT token.

### Admin Routes

Base path: `/api/admin`

- `POST /login` - admin login.
- `GET /profile` - get admin profile.
- `PATCH /profile/password` - change admin password.
- `GET /instructors/pending` - list pending instructors.
- `PATCH /instructors/:id/approve` - approve instructor.
- `PATCH /instructors/:id/reject` - reject instructor.
- `GET /users` - list all users.
- `PATCH /users/:id/block` - block user.
- `PATCH /users/:id/unblock` - unblock user.
- `DELETE /users/:id` - delete user.

### Course Routes

Base path: `/api/course`

- `GET /all` - get all published/available courses.
- `GET /:id` - get course by ID.

### Educator Routes

Base path: `/api/educator`

- `GET /update-role` - request instructor role.
- `POST /add-course` - add course with thumbnail and lecture videos.
- `GET /courses` - get instructor courses.
- `PATCH /courses/:id` - update instructor course.
- `DELETE /courses/:id` - delete instructor course.
- `GET /dashboard` - get instructor dashboard data.
- `GET /enrolled-students` - get enrolled students.
- `GET /doubts` - get student doubts.
- `PATCH /doubts/:id/reply` - reply to a doubt.

### User Routes

Base path: `/api/user`

- `GET /data` - get logged-in user data.
- `PUT /update-profile` - update name/profile image.
- `POST /change-password` - change user password.
- `GET /enrolled-courses` - get enrolled courses.
- `POST /purchase` - create purchase/Stripe checkout.
- `POST /confirm-purchase` - confirm Stripe checkout session.
- `POST /update-course-progress` - mark lecture complete.
- `POST /get-course-progress` - get course progress.
- `POST /add-rating` - add/update course rating.
- `POST /doubts` - submit course doubt.
- `GET /doubts/:courseId` - get own doubts for a course.

### Stripe Webhook

- `POST /stripe` - handles Stripe webhook events.

## Environment Variables

### Server

Create `server/.env`:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
CURRENCY=usd
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLIENT_URL=http://localhost:5173
```

### Student Client

Create `client/student/.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CURRENCY=usd
```

### Instructor Client

Create `client/instructor/.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CURRENCY=usd
```

### Admin Client

Create `client/admin/.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CURRENCY=usd
```

## Installation

Install dependencies for each app:

```bash
cd server
npm install

cd ../client/student
npm install

cd ../instructor
npm install

cd ../admin
npm install
```

## Running Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the student app:

```bash
cd client/student
npm run dev
```

Start the instructor app on another port:

```bash
cd client/instructor
npm run dev -- --port 5174
```

Start the admin app on another port:

```bash
cd client/admin
npm run dev -- --port 5175
```

Default local URLs:

- Backend API: `http://localhost:3000`
- Student app: `http://localhost:5173`
- Instructor app: `http://localhost:5174`
- Admin app: `http://localhost:5175`

## Build Commands

```bash
cd client/student
npm run build

cd ../instructor
npm run build

cd ../admin
npm run build
```

## Authentication Flow

- Students register with `role: student` and are approved immediately.
- Instructors register with `role: instructor` and default to `pending`.
- Admin approves or rejects pending instructors.
- Blocked users cannot log in.
- Admin login uses `/api/admin/login`; normal users use `/api/auth/login`.
- JWT tokens are stored client-side and sent through the `Authorization: Bearer <token>` header.

## Payment Flow

1. Student clicks purchase/enroll on a course.
2. Backend creates a `Purchase` record.
3. If the final price is zero, enrollment is completed immediately.
4. If payment is required, backend creates a Stripe Checkout session.
5. Student completes payment on Stripe.
6. Enrollment is finalized through checkout confirmation and/or Stripe webhook.
7. Course is added to the user's enrolled courses.

## Uploads

Uploaded files are stored in:

```txt
server/uploads/
```

The server exposes uploaded files through:

```txt
/uploads/<filename>
```

Used for:

- Course thumbnails
- Lecture videos
- User profile images

## Notes

- The project has three separate frontend apps, so use different Vite ports when running them together.
- Stripe requires valid `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `CURRENCY`.
- MongoDB must be running or available through `MONGODB_URI`.
- Existing generated reports and ER diagrams are available inside `docs/`.

#   v i d h y a h u b  
 #   l m s s  
 