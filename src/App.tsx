import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { QuickViewModal } from './components/products/QuickViewModal';
import { SizeGuideModal } from './components/products/SizeGuideModal';

// Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { TrackOrderView } from './views/TrackOrderView';
import { AccountView } from './views/AccountView';
import { WishlistView } from './views/WishlistView';
import { StoreLocatorView } from './views/StoreLocatorView';
import { AboutView, FAQView, ReturnsView, ContactView, PrivacyPolicyView, TermsView } from './views/StaticPolicyViews';
import { AdminDashboardView } from './views/AdminDashboardView';
import { LiveChatWidget } from './components/chat/LiveChatWidget';


const AppContent: React.FC = () => {
  const { activeView } = useShop();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderCurrentView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ShopView />;
      case 'product-detail':
        return <ProductDetailView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-success':
        return <OrderSuccessView />;
      case 'track-order':
        return <TrackOrderView />;
      case 'account':
        return <AccountView />;
      case 'wishlist':
        return <WishlistView />;
      case 'stores':
        return <StoreLocatorView />;
      case 'about':
        return <AboutView />;
      case 'faq':
        return <FAQView />;
      case 'returns':
        return <ReturnsView />;
      case 'contact':
        return <ContactView />;
      case 'privacy':
        return <PrivacyPolicyView />;
      case 'terms':
        return <TermsView />;
      case 'admin':
        return <AdminDashboardView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Active Main View Content */}
      <main className="flex-1">{renderCurrentView()}</main>

      {/* Shopping Bag Slide-over Drawer */}
      <CartDrawer />

      {/* Global Quick View Modal */}
      <QuickViewModal />

      {/* Master Size Guide Modal */}
      <SizeGuideModal />

      {/* Zippy Atelier Live Chat & AI Concierge */}
      <LiveChatWidget />

      {/* Master Luxury Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}

export default App;
