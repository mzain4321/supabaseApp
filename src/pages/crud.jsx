import React, { useEffect, useState } from "react";
const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_PROJECT_URL}/functions/v1/profile-crud`; 


export const CRUD = () => {
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);


  const callEdgeFunction = async (method, body = null, id = null) => {
    let url = EDGE_FUNCTION_URL;
    let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    };

    if (id && method === 'DELETE') {
        url = `${EDGE_FUNCTION_URL}?id=${id}`;
    }

    const config = {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, config);
    
    const data = response.status === 200 || response.status === 201 || response.status === 409 ? await response.json() : null;
    
    if (!response.ok) {
        const errorMsg = data?.message || `HTTP error! Status: ${response.status}`;
        throw new Error(errorMsg);
    }
    
    return data;
  };

  const fetchProfiles = async () => {
    try {
      const data = await callEdgeFunction("GET");
      setProfiles(data);
    } catch (error) {
      alert("Error fetching profiles: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      alert("Please provide both name and email.");
      return;
    }

    try {
      if (editingId) {
        // Update (PATCH)
        await callEdgeFunction("PATCH", { id: editingId, name, email });
        alert("Updated Successfully!");
      } else {
        // Create (POST)
        await callEdgeFunction("POST", { name, email });
        alert("Inserted Successfully!");
      }

      // Reset form and refresh table
      setName("");
      setEmail("");
      setEditingId(null);
      fetchProfiles();

    } catch (error) {
        // Check for specific error status from Edge Function (e.g., 409 Conflict for duplicate email)
        if (error.message.includes("Email already exists")) {
            alert("This email already exists!");
        } else {
            alert("Operation failed: " + error.message);
        }
    }
  };

  const startEdit = (profile) => {
    setName(profile.name);
    setEmail(profile.email);
    setEditingId(profile.id);
  };

  // DELETE Operation (DELETE)
  const deleteProfile = async (id) => {
    try {
      await callEdgeFunction("DELETE", null, id);
      alert("Deleted Successfully!");
      fetchProfiles();
    } catch (error) {
      alert("Error deleting profile: " + error.message);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <section className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        CRUD Operations (via Edge Function)
      </h1>

      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editingId ? "Edit Profile" : "Add a Profile"}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="mt-2 px-4 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition"
          >
            {editingId ? "Update" : "Submit"}
          </button>
        </form>
      </div>

      <div className="w-full max-w-3xl overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-700">
                ID
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((prof) => (
              <tr key={prof.id}>
                <td className="px-6 py-4 border-t border-gray-200">
                  {prof.id}
                </td>
                <td className="px-6 py-4 border-t border-gray-200">
                  {prof.name}
                </td>
                <td className="px-6 py-4 border-t border-gray-200">
                  {prof.email}
                </td>
                <td className="px-6 py-4 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => startEdit(prof)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProfile(prof.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};