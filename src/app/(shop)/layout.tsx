import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

const ShopLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
        </div>
    );
};

export default ShopLayout;
