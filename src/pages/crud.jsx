import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export const CRUD = () => {
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null); 

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from("profile1").select("*");
    if (error) alert("Error: " + error.message);
    else setProfiles(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      alert("Please provide both name and email.");
      return;
    }
console.log(name, email);
    if (editingId) {
      const { data, error } = await supabase
        .from("profile1")
        .update({ name, email })
        .eq("id", editingId);
      if (error) alert("Error: " + error.message);
      else {
        alert("Updated Successfully!");
        setName("");
        setEmail("");
        setEditingId(null);
        fetchProfiles();
      }
    } else {

      const emailExists = profiles.some((p) => p.email === email);
      if (emailExists) {
        alert("This email already exists!");
        return;
      }

      const { data, error } = await supabase
        .from("profile1")
        .insert([{ name, email }]);
      if (error) alert("Error: " + error.message);
      else {
        alert("Inserted Successfully!");
        setName("");
        setEmail("");
        fetchProfiles();
      }
    }
  };


  const startEdit = (profile) => {
    setName(profile.name);
    setEmail(profile.email);
    setEditingId(profile.id);
  };


  const deleteProfile = async (id) => {
    const { error } = await supabase.from("profile1").delete().eq("id", id);
    if (error) alert("Error: " + error.message);
    else fetchProfiles();
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <section className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">CRUD Operations</h1>

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
              <th className="px-6 py-3 text-left font-medium text-gray-700">ID</th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">Name</th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">Email</th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((prof) => (
              <tr key={prof.id}>
                <td className="px-6 py-4 border-t border-gray-200">{prof.id}</td>
                <td className="px-6 py-4 border-t border-gray-200">{prof.name}</td>
                <td className="px-6 py-4 border-t border-gray-200">{prof.email}</td>
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
