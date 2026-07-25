import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Header from "./headers/Header";
import SideNavbar from "./side navbar/SideNavbar";
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

function App() {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  const [authView, setAuthView] = useState("login"); // 'login' | 'signup'

  const currentView = useSelector((state) => state.ui.currentView);
  const globalSearch = useSelector((state) => state.ui.globalSearch);
  const inventoryState = useSelector((state) => state.inventory);
  const { items: inventory, initialized } = inventoryState;
  const recentEntries = useSelector((state) => state.stockEntry.recentEntries);

  // Fetch Firestore inventory on login
  useEffect(() => {
    if (currentUser && !initialized) {
      dispatch(fetchInventory(currentUser.uid));
    }
  }, [currentUser, initialized, dispatch]);

  const filteredInventory = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    if (!query) return inventory;

    return inventory.filter(
      (item) =>
        item.medicineName.toLowerCase().includes(query) ||
        item.batchId.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [inventory, globalSearch]);

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
        return (
          <Dashboard items={filteredInventory} activities={recentEntries} />
        );
    }
  };

  const handleNavigate = (view) => {
    dispatch(setCurrentView(view));
  };

  // Not authenticated? Show Auth flows
  if (!currentUser) {
    if (authView === "signup") {
      return <SignupPage onSwitchToLogin={() => setAuthView("login")} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthView("signup")} />;
  }

  // Authenticated layout
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
