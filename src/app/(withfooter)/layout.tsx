
import Footer from "@/components/layout/Footer";
export default function withFooter({children,}: { children: React.ReactNode })
{
    return (
        <div>
            <main>
                {children}
            </main>
            <Footer />
        </div>

    )
}