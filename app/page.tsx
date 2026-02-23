import { AppContextProvider } from "@/app/context/AppContext";
import { ClientShell } from "@/app/components/ClientShell";

export default function RootPage() {
    return (
        <AppContextProvider>
            <ClientShell />
        </AppContextProvider>
    );
}
