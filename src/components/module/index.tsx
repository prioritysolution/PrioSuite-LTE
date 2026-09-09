"use client"

import React from "react";
import { Button } from "@/components/ui/button";

interface UIProps {
  loading: boolean;
  data: any[];
  error: string | null;
  onFetch: () => void;
  onCreate: (name: string) => void;
}

export const ModuleUI: React.FC<UIProps> = ({
  loading,
  data,
  error,
  onFetch,
  onCreate,
}) => {
  const [itemName, setItemName] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    onCreate(itemName);
    setItemName("");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100 max-w-2xl mx-auto mt-8 font-sans">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Module UI Component</h2>

      <div className="flex gap-4 mb-6">
        <Button onClick={onFetch} disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
          {loading ? "Loading..." : "Fetch Data"}
        </Button>
      </div>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-600">Add New Item</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
            className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded">
            Add
          </Button>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Items List</h3>
        {data.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No items found. Click fetch or add a new one.</p>
        ) : (
          <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden bg-gray-50">
            {data.map((item, idx) => (
              <li key={idx} className="px-4 py-3 text-sm text-gray-700 flex justify-between items-center hover:bg-gray-100">
                <span>{item.Area_Name || item.name || JSON.stringify(item)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
