# Project Report

## Title
Blood Pressure Monitoring System with Personalized Health Assistance

## Submitted To
College Project Report Submission

## Submitted By
- Name: `<Your Name>`
- Roll No: `<Your Roll Number>`
- Department: `<Your Department>`
- College: `<Your College Name>`
- Academic Session: `<Year>`

## 1. Abstract
The Blood Pressure Monitoring System is a full-stack healthcare web application developed to help users monitor their blood pressure, manage medication reminders, maintain a health profile, and receive profile-based health recommendations. The system combines a React frontend, a Node.js and Express backend, a PostgreSQL database managed with Prisma ORM, and a Python-based machine learning service for hypertension risk prediction.

The project is designed to solve the problem of fragmented personal health tracking. Instead of storing blood pressure readings manually in notebooks or relying only on memory for medication schedules and lifestyle patterns, the system centralizes health-related information in one platform. It also improves the user experience by offering trend visualization, personalized health assistance, and consultation-request support.

This application demonstrates the integration of web development, authentication, database design, healthcare-oriented data handling, and machine learning into one practical project.

## 2. Introduction
Blood pressure is one of the most important indicators of cardiovascular health. Many patients, especially those with hypertension or risk factors such as smoking, obesity, poor diet, or inactivity, require continuous monitoring and lifestyle management. However, most people do not maintain consistent records of their blood pressure readings, medications, and daily habits.

The aim of this project is to create a digital monitoring platform that:
- stores and manages blood pressure readings securely,
- helps patients maintain medication schedules,
- captures health profile data for personalization,
- provides recommendation support based on profile and latest blood pressure,
- allows simple consultation support between patients and doctors,
- visualizes blood pressure trends using dashboards and graphs.

## 3. Problem Statement
Patients often face the following issues:
- Blood pressure readings are not recorded consistently.
- Medication reminders are missed or not tracked properly.
- Lifestyle factors like smoking, diet, sleep, stress, and exercise are not connected to health decisions.
- There is limited access to immediate profile-based guidance.
- Basic communication or consultation tracking with doctors is often unstructured.

This project addresses these problems by building an integrated system for health tracking and personalized recommendation support.

## 4. Objectives
The major objectives of the project are:
- To build a secure blood pressure monitoring web application.
- To enable users to register, log in, and manage their health profile.
- To provide facilities for adding and reviewing blood pressure records.
- To implement medication reminders and tracking.
- To provide personalized health assistance based on profile and blood pressure history.
- To visualize BP trends through dashboard cards and graphs.
- To support basic doctor consultation requests.
- To demonstrate the use of machine learning in healthcare recommendation systems.

## 5. Scope of the Project
The current scope of the project includes:
- user authentication and authorization,
- health profile management,
- blood pressure update and history tracking,
- medication reminder scheduling and intake tracking,
- personalized health assistant with chat-based interaction,
- hypertension risk recommendation through ML service,
- graphical BP trend analysis,
- basic patient-doctor consultation request support.

The system is intended primarily for educational and demonstration purposes. It is not a replacement for professional medical diagnosis.

## 6. Technology Stack

### Frontend
- React
- React Router
- Vite
- CSS
- Axios

### Backend
- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- PostgreSQL

### Machine Learning Service
- Python
- FastAPI
- Pandas
- Joblib
- Pre-trained hypertension model (`hypertension_model.pkl`)

### Other Tools
- Cron job for medication scheduling support
- Git and GitHub for version control

## 7. System Architecture
The project follows a modular client-server architecture:

1. The frontend built with React provides the user interface for registration, sign-in, profile management, BP tracking, medication management, consultations, and chatbot interaction.
2. The backend built with Express handles APIs, authentication, authorization, data validation, and communication with the database.
3. Prisma ORM connects the backend to the PostgreSQL database.
4. The ML microservice built with FastAPI predicts hypertension risk and returns recommendation output.
5. The personalized health assistant uses saved profile data and latest BP data to generate context-aware responses.

## 8. Main Modules

### 8.1 Authentication Module
This module allows users to:
- sign up,
- sign in,
- maintain logged-in sessions,
- access protected routes securely using JWT.

Frontend pages:
- `Client/src/Pages/Signin.jsx`
- `Client/src/Pages/Signup.jsx`

Backend files:
- `Backend/http/controllers/auth.controller.js`
- `Backend/http/routes/auth.routes.js`
- `Backend/http/middlewares/requireAuth.js`

### 8.2 Health Profile Module
This module stores user-specific health details required for personalized suggestions.

Profile fields include:
- age
- gender
- weight
- height
- smoking status
- alcohol use
- exercise frequency
- exercise types
- sleep hours
- water intake
- diet type
- junk food level
- stress level
- sleep quality
- medical conditions
- family history
- health goal

Frontend files:
- `Client/src/components/ProfileForm.jsx`
- `Client/src/Pages/ProfilePage.jsx`

Backend files:
- `Backend/http/controllers/profile.controller.js`
- `Backend/http/routes/profile.routes.js`

### 8.3 Blood Pressure Monitoring Module
This module enables users to:
- add systolic and diastolic readings,
- view previous readings,
- analyze blood pressure trends.

Frontend files:
- `Client/src/Pages/Dashboard.jsx`
- `Client/src/components/BPTrendDashboard.jsx`
- `Client/src/api/bpApi.jsx`

Backend files:
- `Backend/http/controllers/bp.controller.js`
- `Backend/http/routes/bp.routes.js`

### 8.4 Medication Reminder Module
This module provides:
- medication creation,
- schedule listing,
- marking medication as taken,
- time updates,
- medication deletion.

Frontend files:
- `Client/src/Pages/MedicationReminder.jsx`
- `Client/src/components/MedicationForm.jsx`
- `Client/src/components/MedicationList.jsx`

Backend files:
- `Backend/http/controllers/medication.controller.js`
- `Backend/http/routes/medication.routes.js`
- `Backend/http/jobs/medicationJob.js`

### 8.5 Personalized Health Assistant Module
This is one of the main features of the project. The assistant:
- uses the saved user profile,
- fetches latest blood pressure data,
- calculates a rule-based risk level,
- uses ML-based hypertension recommendation support,
- responds to user chat queries based on the user profile and recent context.

The assistant supports questions related to:
- diet,
- blood pressure,
- exercise,
- sleep and stress,
- weight and BMI,
- general health summary.

Frontend files:
- `Client/src/components/ChatBot.jsx`
- `Client/src/api/mlApi.js`

Backend files:
- `Backend/http/controllers/assistant.controller.js`
- `Backend/http/service/healthAssistant.service.js`
- `Backend/http/routes/users.routes.js`

### 8.6 Consultation Support Module
This module provides basic patient-doctor interaction support.

Users can:
- view available doctors,
- write a consultation request,
- mention symptoms,
- choose a preferred consultation date,
- view request history and status.

Frontend files:
- `Client/src/components/ConsultationPanel.jsx`
- `Client/src/api/consultationApi.jsx`

Backend files:
- `Backend/http/controllers/consultation.controller.js`
- `Backend/http/routes/consultation.routes.js`

## 9. Database Design
The database schema is defined using Prisma.

### Main Entities
- `User`
- `HealthProfile`
- `BloodPressure`
- `MedicationSchedule`
- `MedicationLog`
- `ConsultationRequest`

### Entity Summary

#### User
Stores basic user account data such as:
- id
- name
- email
- password

#### HealthProfile
Stores personal health and lifestyle information used for recommendations.

#### BloodPressure
Stores systolic and diastolic readings with timestamps.

#### MedicationSchedule
Stores medicine name, dosage, time, and status.

#### MedicationLog
Tracks whether medication was taken, missed, or reminded.

#### ConsultationRequest
Stores patient requests for basic consultation support with doctor name, specialty, message, symptoms, status, and reply.

## 10. Machine Learning Integration
The project includes a Python-based ML service located in the `ml-service` folder.

### Inputs Used by the Model
- age
- weight
- systolic
- diastolic
- smoking
- exercise

### Output
- risk level
- basic recommendations

The FastAPI service exposes:
- `GET /`
- `POST /predict`

This service is called from the Node.js backend recommendation service and contributes to the overall personalized guidance system.

## 11. User Interface and UX Features
The project includes a responsive and interactive user interface with:
- premium-style sign-in and sign-up screens,
- dashboard-based navigation,
- sidebar and top navigation,
- blood pressure trend cards and graphs,
- chat-based assistant interface,
- consultation request cards and forms,
- responsive layout for desktop and mobile.

The frontend focuses on simplicity, readability, and guided interaction so that users can perform healthcare-related actions with less confusion.

## 12. Workflow of the System

### Step 1: Registration and Login
The user creates an account or signs in securely.

### Step 2: Profile Setup
The user fills in health-related fields such as age, diet type, smoking, exercise, and medical history.

### Step 3: Blood Pressure Update
The user enters BP readings through the dashboard.

### Step 4: BP Trend Analysis
The system stores readings and displays historical tables and graphical analysis.

### Step 5: Medication Management
The user adds medications, views schedules, and tracks intake.

### Step 6: Health Assistance
The user chats with the health assistant and receives recommendations based on saved profile and latest BP data.

### Step 7: Consultation Support
The user submits a consultation request to a doctor and tracks request history.

## 13. Key Features Implemented
- JWT-based user authentication
- protected routes
- profile data persistence
- BP entry and BP history
- BP graph and dashboard statistics
- medication reminder management
- personalized health assistant
- ML-based hypertension recommendation support
- diet suggestions based on diet type
- basic patient-doctor consultation request system
- responsive premium-style auth pages

## 14. Advantages of the System
- Centralizes important health information in one platform
- Improves consistency in BP tracking
- Helps users manage medicines effectively
- Supports preventive care through profile-based advice
- Encourages better habits through chat-based guidance
- Gives users a simple path to request doctor consultation
- Demonstrates practical healthcare + web + ML integration

## 15. Limitations
- The system is meant for educational use and not as a certified medical platform.
- The ML model currently uses a limited set of input features.
- The doctor consultation module is basic and does not yet include a separate doctor login panel.
- Real-time doctor chat is not implemented.
- Advanced chart libraries and clinical-grade analytics are not included.
- The recommendation logic is supportive and not a substitute for diagnosis.

## 16. Future Enhancements
- Add doctor-side dashboard and reply system
- Add real-time chat or video consultation
- Add appointment booking and notification support
- Improve ML model with larger and richer healthcare datasets
- Add downloadable health reports in PDF format
- Add role-based access for patient, doctor, and admin
- Add email/SMS alerts for BP risk and medication reminders
- Add wearable device integration
- Add advanced data visualization with filters and date ranges

## 17. Testing and Verification
The frontend was verified using production builds through Vite.
The backend files were checked for syntax correctness using Node.js checks.
Prisma client generation was also executed successfully after schema updates.

## 18. Conclusion
The Blood Pressure Monitoring System successfully demonstrates the development of a modern healthcare-focused web application. It integrates authentication, profile management, blood pressure recording, medication tracking, BP trend visualization, consultation support, and intelligent recommendation assistance in one system.

The project is valuable as a college-level full-stack application because it combines software engineering, database design, API development, user interface design, and machine learning integration. It also addresses a practical health problem and shows how digital systems can improve preventive healthcare and personal monitoring.

## 19. References
- React Documentation
- Express.js Documentation
- Prisma Documentation
- FastAPI Documentation
- PostgreSQL Documentation
- JWT Authentication Documentation
- Axios Documentation

## 20. Appendix

### Project Folder Structure
```text
MonitoringSystem/
├── Backend/
│   ├── http/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── service/
│   │   ├── middlewares/
│   │   └── jobs/
│   ├── prisma/
│   └── app.js
├── Client/
│   ├── src/
│   │   ├── Pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── styles/
│   │   └── context/
├── ml-service/
│   ├── ml_api.py
│   ├── train_model.py
│   └── hypertension_model.pkl
└── PROJECT_REPORT.md
```

### Notes for Final Submission
- Replace placeholder student details before submission.
- If required by your college, copy this content into Word or PDF format.
- Add screenshots of:
  - Sign In page
  - Sign Up page
  - Dashboard
  - BP trend graph
  - Health assistant
  - Consultation request page