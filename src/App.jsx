/**
 * File: App.jsx
 * Description: Main Application Component. Responsible for routing,
 * global state initialization (fetching inventory), and layout structure.
 * Handles the authentication flow by rendering login/signup pages if
 * the user is not authenticated.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Header from "./headers/Header";
import SideNavbar from "./side navbar/Sidenavbar";
import Dashboard from "./dashboard/Dashboard";
import InventoryTable from "./table/InventoryTable";
import ExpiryMonitorCards from "./cards/ExpiryMonitorCards";
import StockEntryForm from "./stock Entry form/StockEntryForm";
import SupportForm from "./support form/SupportForm";
import DispenseView from "./dispense/DispenseView";
import LoginPage from "./user auth/LoginPage";
import SignupPage from "./user auth/SignupPage";
import { useAuth } from "./user auth/AuthContext";
import { setCurrentView } from "./slices/uiSlice";
import { fetchInventory } from "./slices/inventorySlice";

/**
 * App Component
 * 
 * The root component of the application. It acts as a controller for
 * switching between different views based on the current state.
 * 
 * @returns {JSX.Element} The rendered React component.
 */
function App() {
  const dispatch = useDispatch();
  
  // Retrieve current user context from AuthProvider
  const { currentUser } = useAuth();

  // Local state to manage which auth view to show when not authenticated
  const [authView, setAuthView] = useState("login"); // 'login' | 'signup'

  // Redux selectors for UI and data states
  const currentView = useSelector((state) => state.ui.currentView);
  const globalSearch = useSelector((state) => state.ui.globalSearch);
  const inventoryState = useSelector((state) => state.inventory);
  const { items: inventory, initialized } = inventoryState;
  const recentEntries = useSelector((state) => state.stockEntry.recentEntries);

  /**
   * Effect hook to fetch Firestore inventory on login.
   * Only triggers if a user is present and inventory isn't initialized yet.
   */
  useEffect(() => {
    if (currentUser && !initialized) {
      dispatch(fetchInventory(currentUser.uid));
    }
  }, [currentUser, initialized, dispatch]);

  /**
   * Memoized filtered inventory based on the global search query.
   * Filters by medicine name, batch ID, or category.
   */
  const filteredInventory = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    
    // Return all inventory if no search query is present
    if (!query) return inventory;

    return inventory.filter(
      (item) =>
        item.medicineName.toLowerCase().includes(query) ||
        item.batchId.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [inventory, globalSearch]);

  /**
   * Renders the corresponding view based on the current view state.
   * 
   * @returns {JSX.Element} The active view component.
   */
  const renderView = () => {
    switch (currentView) {
      case "inventory":
        return <InventoryTable items={filteredInventory} />;
      case "expiry":
        return <ExpiryMonitorCards items={filteredInventory} />;
      case "stock-entry":
        return <StockEntryForm />;
      case "dispense":
        return <DispenseView />;
      case "support":
        return <SupportForm />;
      default:
        // Default to the dashboard view
        return (
          <Dashboard items={filteredInventory} activities={recentEntries} />
        );
    }
  };

  /**
   * Handles navigation from the SideNavbar.
   * 
   * @param {string} view - The name of the view to navigate to.
   */
  const handleNavigate = (view) => {
    dispatch(setCurrentView(view));
  };

  // If the user is not authenticated, show Authentication flows
  if (!currentUser) {
    if (authView === "signup") {
      return <SignupPage onSwitchToLogin={() => setAuthView("login")} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthView("signup")} />;
  }

  // Authenticated layout rendering the main shell, header, and active view
  return (
    <div className="app-shell">
      <SideNavbar currentView={currentView} onNavigate={handleNavigate} />
      <div className="app-content">
        <Header />
        <main className="app-main">{renderView()}</main>
      </div>
    </div>
  );
}

export default App;
