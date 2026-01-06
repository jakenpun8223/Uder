import { useWaiter } from '../context/WaiterContext';

const TableSelector = () => {
    const { myTables, toggleTable } = useWaiter();
    // Assuming 12 tables for now - you could fetch this from API
    const allTables = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-3">🔔 My Tables (Click to subscribe)</h3>
            <div className="flex flex-wrap gap-2">
                {allTables.map(num => (
                    <button
                        key={num}
                        onClick={() => toggleTable(num)}
                        className={`
                            w-10 h-10 rounded-full font-bold transition-all
                            ${myTables.includes(num) 
                                ? 'bg-primary text-white scale-110 shadow-md ring-2 ring-orange-200' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }
                        `}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
                You will only receive notifications for the highlighted tables.
            </p>
        </div>
    );
};

export default TableSelector;