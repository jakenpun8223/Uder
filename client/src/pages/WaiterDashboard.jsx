import TableSelector from '../components/TableSelector';
import { useWaiter } from '../context/WaiterContext';

const WaiterDashboard = () => {
    const { notifications } = useWaiter();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-gray-800">My Station 🛎️</h1>
                <p className="text-gray-500 mt-2">
                    Select the tables you are serving today. You will only receive alerts for the highlighted tables.
                </p>
            </header>

            {/* The Table Selector Component */}
            <TableSelector />

            {/* Summary Section */}
            <div className="mt-10 grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-blue-800 text-lg mb-2">Instructions</h3>
                    <ul className="list-disc list-inside text-blue-700 space-y-2 text-sm">
                        <li>Tap a table number to <strong>subscribe</strong>.</li>
                        <li>Tap again to <strong>unsubscribe</strong>.</li>
                        <li>Highlighted tables are <strong>active</strong>.</li>
                        <li>Stay on this page or browse the menu; notifications will pop up anywhere.</li>
                    </ul>
                </div>
                
                {/* Optional: Show active alerts count */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">Current Status</h3>
                    <div className="text-4xl font-black text-primary">
                        {notifications.length}
                    </div>
                    <p className="text-gray-500 text-sm">Active Requests</p>
                </div>
            </div>
        </div>
    );
};

export default WaiterDashboard;