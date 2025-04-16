

export const budgetData = {
  households: [
    {
      id: "hh-1",
      name: "Smith Family",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    }
  ],
  users: [
    {
      id: "usr-1",
      household_id: "hh-1",
      email: "john.smith@example.com",
      name: "John Smith",
      role: "admin",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: "usr-2",
      household_id: "hh-1",
      email: "jane.smith@example.com",
      name: "Jane Smith",
      role: "admin",
      created_at: "2024-01-01T00:00:00Z"
    }
  ],
  income: [
    {
      id: "inc-1",
      household_id: "hh-1",
      name: "Salary",
      amount: 2500,
      type: "recurring",
      frequency: "monthly",
      month: 4,
      year: 2024,
      created_by: "usr-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    },
    {
      id: "inc-2",
      household_id: "hh-1",
      name: "Freelance",
      amount: 1000,
      type: "variable",
      frequency: "monthly",
      month: 4,
      year: 2024,
      created_by: "usr-2",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    }
  ],
  categories: [
    {
      id: "cat-1",
      household_id: "hh-1",
      name: "Housing",
      color: "bg-blue-500",
      month: 4,
      year: 2024,
      planned_amount: 2000,
      spent_amount: 1500,
      created_by: "usr-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    },
    {
      id: "cat-2",
      household_id: "hh-1",
      name: "Food",
      color: "bg-green-500",
      month: 4,
      year: 2024,
      planned_amount: 800,
      spent_amount: 600,
      created_by: "usr-2",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    },
    {
      id: "cat-3",
      household_id: "hh-1",
      name: "Transportation",
      color: "bg-yellow-500",
      month: 4,
      year: 2024,
      planned_amount: 400,
      spent_amount: 300,
      created_by: "usr-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    },
    {
      id: "cat-4",
      household_id: "hh-1",
      name: "Entertainment",
      color: "bg-purple-500",
      month: 4,
      year: 2024,
      planned_amount: 300,
      spent_amount: 200,
      created_by: "usr-2",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    }
  ],
  subcategories: [
    {
      id: "sub-1",
      category_id: "cat-1",
      name: "Rent",
      month: 4,
      year: 2024,
      planned_amount: 1500,
      spent_amount: 1500,
      created_by: "usr-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    },
    {
      id: "sub-2",
      category_id: "cat-1",
      name: "Utilities",
      month: 4,
      year: 2024,
      planned_amount: 500,
      spent_amount: 0,
      created_by: "usr-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    },
    {
      id: "sub-3",
      category_id: "cat-2",
      name: "Groceries",
      month: 4,
      year: 2024,
      planned_amount: 500,
      spent_amount: 400,
      created_by: "usr-2",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    },
    {
      id: "sub-4",
      category_id: "cat-2",
      name: "Dining Out",
      month: 4,
      year: 2024,
      planned_amount: 300,
      spent_amount: 200,
      created_by: "usr-2",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    },
    {
      id: "sub-5",
      category_id: "cat-3",
      name: "Gas",
      month: 4,
      year: 2024,
      planned_amount: 400,
      spent_amount: 300,
      created_by: "usr-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    },
    {
      id: "sub-6",
      category_id: "cat-4",
      name: "Movies & Events",
      month: 4,
      year: 2024,
      planned_amount: 300,
      spent_amount: 200,
      created_by: "usr-2",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-04-15T00:00:00Z"
    }
  ],
  transactions: [
    {
      id: "txn-1",
      household_id: "hh-1",
      category_id: "cat-1",
      subcategory_id: "sub-1",
      month: 4,
      year: 2024,
      amount: 1500,
      description: "Monthly Rent",
      date: "2024-04-01",
      type: "expense",
      status: "completed",
      created_by: "usr-1",
      created_at: "2024-04-01T00:00:00Z",
      updated_at: "2024-04-01T00:00:00Z"
    },
    {
      id: "txn-2",
      household_id: "hh-1",
      category_id: "cat-2",
      subcategory_id: "sub-3",
      month: 4,
      year: 2024,
      amount: 150.50,
      description: "Weekly Groceries",
      date: "2024-04-05",
      type: "expense",
      status: "completed",
      created_by: "usr-2",
      created_at: "2024-04-05T00:00:00Z",
      updated_at: "2024-04-05T00:00:00Z"
    },
    {
      id: "txn-3",
      household_id: "hh-1",
      category_id: "cat-2",
      subcategory_id: "sub-4",
      month: 4,
      year: 2024,
      amount: 75.25,
      description: "Dinner at Italian Restaurant",
      date: "2024-04-10",
      type: "expense",
      status: "completed",
      created_by: "usr-1",
      created_at: "2024-04-10T00:00:00Z",
      updated_at: "2024-04-10T00:00:00Z"
    },
    {
      id: "txn-4",
      household_id: "hh-1",
      category_id: "cat-3",
      subcategory_id: "sub-5",
      month: 4,
      year: 2024,
      amount: 45.00,
      description: "Gas Fill-up",
      date: "2024-04-12",
      type: "expense",
      status: "completed",
      created_by: "usr-2",
      created_at: "2024-04-12T00:00:00Z",
      updated_at: "2024-04-12T00:00:00Z"
    },
    {
      id: "txn-5",
      household_id: "hh-1",
      category_id: "cat-4",
      subcategory_id: "sub-6",
      month: 4,
      year: 2024,
      amount: 50.00,
      description: "Movie Tickets",
      date: "2024-04-14",
      type: "expense",
      status: "completed",
      created_by: "usr-1",
      created_at: "2024-04-14T00:00:00Z",
      updated_at: "2024-04-14T00:00:00Z"
    }
  ]
}