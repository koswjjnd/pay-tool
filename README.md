[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/L1CTotQ-)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=19449155)


## Proposal Link: https://docs.google.com/document/d/14phZYPUm03hRg1Ig7o2XtB0V4cIX-uFeu4-iDN9K6io/edit?usp=sharing

## Figma Link: https://www.figma.com/proto/dV3Pb7LVvBbcEYOkZgXBub/303-Final-Project?node-id=24-8463&p=f&t=TXmc8SJZMbr3QYA6-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=47%3A218

# PayTool - Group Payment Management Tool

PayTool is a modern group payment management tool that helps users easily manage group bills and payments.

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- GraphQL Client
- UI Components:
  - shadcn/ui (based on Radix UI)
  - Lucide Icons
  - Tailwind CSS

### Backend
- Spring Boot
- GraphQL
- MySQL
- Maven

## Requirements

- Node.js 18.0.0 or higher
- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Setup Instructions

### 1. Clone the Project
```bash
git clone [repository-url]
cd final-project-paytool
```

### 2. Backend Setup

1. Configure Database
   - Create MySQL database
   - Update database configuration in `backend/src/main/resources/application.properties`:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/paytool
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

2. Start Backend Service
   ```bash
   cd backend
   sdk env
   mvn clean install
   mvn spring-boot:run
   ```
   Backend service will run at http://localhost:8080

### 3. Frontend Setup

1. Install Dependencies
   ```bash
   cd frontend
   npm install
   ```

2. Copy environment variables example file
   ```bash
   cp .env.example .env.local
   ```

3. Start Development Server
   ```bash
   npm run dev
   ```
   Frontend service will run at http://localhost:3000

## Usage Guide

1. Visit http://localhost:3000 to open the application
2. Register an account for first-time users
3. After logging in, you can:
   - Create new payment groups
   - Join groups via QR code
   - Manage group bills
   - Track payment status

## Development Guide

- Frontend code is located in `frontend/src` directory
- Backend code is located in `backend/src/main/java` directory
- GraphQL schema is located in `backend/src/main/resources/schema.graphqls`

## Troubleshooting

1. If you encounter database connection issues, check:
   - MySQL service is running
   - Database configuration is correct
   - Database user has sufficient permissions

2. If frontend cannot connect to backend, check:
   - Backend service is running
   - Frontend environment variables are configured correctly
   - CORS configuration is correct

## Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
