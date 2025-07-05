# Personal Finance Visualizer

A modern, responsive web application for tracking personal finances with interactive charts and insights. Built with Next.js 14, TypeScript, and MongoDB.

## 🚀 Features

### 📊 Dashboard Overview

- **Total Expenses Tracking**: Real-time calculation of all expenses
- **Category Breakdown**: Monthly spending analysis by category
- **Recent Transactions**: Quick view of latest transactions
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### 💰 Transaction Management

- **Add Transactions**: Easy form to add new expenses with date, description, category, and amount
- **Edit Transactions**: Modify existing transaction details
- **Delete Transactions**: Remove unwanted transactions with confirmation
- **Transaction List**: Sortable table view with pagination

### 📈 Data Visualization

- **Monthly Expenses Chart**: Bar chart showing spending trends over time
- **Category Breakdown**: Pie chart displaying spending distribution by category
- **Budget vs Actual**: Compare budgeted amounts with actual spending
- **Interactive Charts**: Hover tooltips and responsive chart sizing

### 💡 Financial Insights

- **Spending Patterns**: Analyze your spending habits
- **Budget Tracking**: Set and monitor budget limits by category
- **Monthly Comparisons**: Track spending changes month-over-month

### 🎨 User Experience

- **Modern UI**: Clean, intuitive interface using Tailwind CSS
- **Error Handling**: Comprehensive error management with retry mechanisms
- **Loading States**: Smooth loading indicators for better UX
- **Optimistic Updates**: Immediate feedback for user actions
- **Toast Notifications**: Success and error notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Charts**: Recharts for data visualization
- **Database**: MongoDB with native driver
- **Icons**: Lucide React
- **Deployment**: Vercel-ready configuration

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- MongoDB database (local or cloud)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Yasvanth-2005/Yardstick-Finance
cd yardstick-assignment
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Update the environment variables in `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

### 4. Database Setup

Ensure your MongoDB instance is running and accessible. The application will automatically create the necessary collections:

- `transactions` - stores all transaction data
- `budgets` - stores budget information
- `categories` - stores available categories

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
yardstick-assignment/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── budgets/       # Budget management endpoints
│   │   ├── categories/    # Category management endpoints
│   │   └── transactions/  # Transaction CRUD endpoints
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Charts.tsx        # Data visualization
│   ├── Dashboard.tsx     # Main dashboard
│   └── TransactionList.tsx # Transaction management
├── lib/                  # Utility libraries
│   ├── mongodb.ts        # Database connection
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm start
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)

## 🔒 Environment Variables

| Variable      | Description               | Required | Default                     |
| ------------- | ------------------------- | -------- | --------------------------- |
| `MONGODB_URI` | MongoDB connection string | Yes      | `mongodb://localhost:27017` |
| `NODE_ENV`    | Environment mode          | No       | `development`               |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your MongoDB connection
3. Ensure all environment variables are set correctly
4. Create an issue in the repository

## 🔮 Roadmap

- [ ] User authentication and authorization
- [ ] Data export functionality (CSV, PDF)
- [ ] Advanced filtering and search
- [ ] Recurring transactions
- [ ] Financial goals tracking
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Integration with banking APIs
