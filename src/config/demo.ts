// Demo configuration for GitHub Pages deployment
export const DEMO_CONFIG = {
  // Use a demo backend API or mock data for GitHub Pages
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://pal-training-api.herokuapp.com/api' // Replace with your deployed backend
    : 'http://localhost:5000/api',
  
  // Demo user accounts for testing
  DEMO_ACCOUNTS: {
    student: {
      email: 'demo.student@paltraining.com',
      password: 'demo123',
      role: 'student'
    },
    company: {
      email: 'demo.company@paltraining.com',
      password: 'demo123',
      role: 'company'
    },
    supervisor: {
      email: 'demo.supervisor@paltraining.com',
      password: 'demo123',
      role: 'supervisor'
    },
    admin: {
      email: 'demo.admin@paltraining.com',
      password: 'demo123',
      role: 'training_manager'
    }
  }
};

export default DEMO_CONFIG;
